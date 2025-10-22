#!/usr/bin/env bash
set -euo pipefail

TX="${1:-}"
[ -n "$TX" ] || { echo "Usage: $0 <tx_hash>"; exit 1; }

RPCS=(
  "${RPC:-https://rpc.mevblocker.io/}"
  "https://rpc.ankr.com/eth"
  "https://cloudflare-eth.com"
  "https://ethereum.publicnode.com"
)

echo "[INFO] Looking up receipt via eth_getTransactionReceipt for $TX"

RECEIPT=""
USED_RPC=""

for URL in "${RPCS[@]}"; do
  echo "[INFO] Trying RPC: $URL"
  RECEIPT=$(curl -s -X POST "$URL" -H 'Content-Type: application/json' \
    --data "{\"jsonrpc\":\"2.0\",\"method\":\"eth_getTransactionReceipt\",\"params\":[\"$TX\"],\"id\":1}")

  # Validate JSON
  if ! echo "$RECEIPT" | jq -e . >/dev/null 2>&1; then
    echo "[WARN] Non-JSON response from $URL"
    continue
  fi

  RES=$(jq -r '.result' <<< "$RECEIPT")
  if [ "$RES" = "null" ]; then
    echo "[WARN] Receipt not found (result=null) on $URL."

    # Check if tx exists / pending
    TXOBJ=$(curl -s -X POST "$URL" -H 'Content-Type: application/json' \
      --data "{\"jsonrpc\":\"2.0\",\"method\":\"eth_getTransactionByHash\",\"params\":[\"$TX\"],\"id\":2}")

    if echo "$TXOBJ" | jq -e . >/dev/null 2>&1; then
      TXRES=$(jq -r '.result' <<< "$TXOBJ")
      if [ "$TXRES" = "null" ]; then
        echo "[WARN] eth_getTransactionByHash: null (unknown tx on this node)."
      else
        BLK=$(jq -r '.result.blockNumber' <<< "$TXOBJ")
        if [ "$BLK" = "null" ] || [ -z "$BLK" ]; then
          echo "[INFO] Transaction appears PENDING on this node (no blockNumber)."
        else
          echo "[WARN] Tx has blockNumber=$BLK but receipt is missing — node may be lagging/pruned."
        fi
      fi
    fi
    continue
  fi

  USED_RPC="$URL"
  break
done

if [ -z "$USED_RPC" ]; then
  echo "[ERROR] No receipt found on tried RPCs."
  echo "Tips:"
  echo " - Ensure the hash is on Ethereum mainnet (not Base/Arbitrum/etc.)."
  echo " - Try with your own provider: RPC=https://your-endpoint ./$(basename "$0") $TX"
  echo " - If still null everywhere: the tx is pending/dropped or very old (pruned)."
  exit 2
fi

echo "[INFO] Using RPC: $USED_RPC"
echo "[DEBUG] Receipt fields:"
echo "$RECEIPT" | jq '.result | {status, blockNumber, gasUsed, effectiveGasPrice, blobGasUsed, blobGasPrice}'

# Pull hex fields safely
GAS_USED_HEX=$(jq -r '.result.gasUsed' <<< "$RECEIPT")
GAS_PRICE_HEX=$(jq -r '.result.effectiveGasPrice' <<< "$RECEIPT")
BLOB_USED_HEX=$(jq -r '.result.blobGasUsed // "0x0"'  <<< "$RECEIPT")
BLOB_PRICE_HEX=$(jq -r '.result.blobGasPrice // "0x0"' <<< "$RECEIPT")

if [ "$GAS_USED_HEX" = "null" ] || [ "$GAS_PRICE_HEX" = "null" ]; then
  echo "[ERROR] Receipt present but missing gasUsed/effectiveGasPrice. Node may be custom/buggy."
  exit 3
fi

# Convert hex→dec in bash via printf trick
hex2dec() { printf "%d" "$1"; }

GAS_USED=$(hex2dec "$GAS_USED_HEX")
GAS_PRICE=$(hex2dec "$GAS_PRICE_HEX")
BLOB_USED=$(hex2dec "$BLOB_USED_HEX")
BLOB_PRICE=$(hex2dec "$BLOB_PRICE_HEX")

TOTAL_WEI_EXEC=$(( GAS_USED * GAS_PRICE ))
TOTAL_WEI_BLOB=$(( BLOB_USED * BLOB_PRICE ))
TOTAL_WEI=$(( TOTAL_WEI_EXEC + TOTAL_WEI_BLOB ))

# wei→ETH using awk for float division (no cast needed)
GAS_ETH=$(awk -v w="$TOTAL_WEI" 'BEGIN { printf "%.18f", w/1e18 }')

ETH_PRICE=$(curl -s 'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd' \
  | jq -r '.ethereum.usd')

TOTAL_USD=$(awk -v e="$GAS_ETH" -v p="$ETH_PRICE" 'BEGIN { printf "%.6f", e*p }')

echo "[INFO] Computation done."
printf "Transaction: %s\n" "$TX"
printf "RPC used: %s\n" "$USED_RPC"
printf "Gas used (exec): %s\n" "$GAS_USED"
printf "Effective gas price: %s wei\n" "$GAS_PRICE"
printf "Blob gas used: %s\n" "$BLOB_USED"
printf "Blob gas price: %s wei\n" "$BLOB_PRICE"
printf "Total paid: %s ETH\n" "$GAS_ETH"
printf "ETH price: %s USD\n" "$ETH_PRICE"
printf "Total paid (USD): %s\n" "$TOTAL_USD"