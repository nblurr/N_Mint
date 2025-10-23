import json

log_file = '/Users/simonrousseau/development/NCOIN/N_Mint/mint_log.json'

with open(log_file, 'r') as f:
    logs = json.load(f)

our_wallet = '0x20ab05a5ab247dae26dee9e664dbf999ee505ca8'
competitor_wallet = '0xa22f1ac02b5fc04f2e355c30aebfd82a7465b250'

transactions = [log for log in logs if log.get('type') == 'transactionReceipt' and log.get('data', {}).get('status') == 'Success']

for i in range(len(transactions) - 1):
    tx1 = transactions[i]['data']
    tx2 = transactions[i+1]['data']

    if tx1['from'].lower() == competitor_wallet.lower() and tx2['from'].lower() == our_wallet.lower() and tx2['blockNumber'] == tx1['blockNumber'] + 1:
        print('Found a case where we minted one block after the competitor:')
        print(f"Competitor TX in block {tx1['blockNumber']}:")
        print(f"  - Hash: {tx1['hash']}")
        print(f"  - Priority Fee: {tx1['priorityFeeGwei']:.4f} Gwei")
        print(f"  - Base Fee: {tx1['baseFeeGwei']:.4f} Gwei")
        print(f"  - Effective Gas Price: {tx1['effectiveGasPriceGwei']:.4f} Gwei")
        print(f"Our TX in block {tx2['blockNumber']}:")
        print(f"  - Hash: {tx2['hash']}")
        print(f"  - Priority Fee: {tx2['priorityFeeGwei']:.4f} Gwei")
        print(f"  - Base Fee: {tx2['baseFeeGwei']:.4f} Gwei")
        print(f"  - Effective Gas Price: {tx2['effectiveGasPriceGwei']:.4f} Gwei")
        print('---')