# N_Blurr N Minting script Project

- https://etherscan.io/token/0xE73d53e3a982ab2750A0b76F9012e18B256Cc243
- https://nblurr.com
- https://twitter.com/RFD_N_Blurr
- https://t.me/N_Blurr
- https://app.uniswap.org/tokens/ethereum/0xe73d53e3a982ab2750a0b76f9012e18b256cc243
- https://www.dextools.io/app/en/ether/pair-explorer/0x90e7a93E0a6514CB0c84fC7aCC1cb5c0793352d2

Welcome to the N_Blurr project! This repository contains a Node.js application designed for helping community achieve some N minting.

This JavaScript script is designed to automate the process of minting N tokens from a specific Ethereum wallet using ethers.js library, Alchemy API, and other web3 technologies. 

Here’s a breakdown of its functionality and purpose:

### Script Functionality:

1. **Configuration and Setup**:
   - It loads necessary configurations from environment variables, including private keys and API keys for Etherscan, Alchemy, and the Ethereum RPC endpoint.
   - It sets up providers for blockchain interaction through Alchemy and a standard JSON RPC provider.

2. **Contract Interaction**:
   - The script uses the ABI (Application Binary Interface) to create a contract instance. This allows it to interact with the smart contract on the Ethereum blockchain to call functions like minting tokens.
   
3. **Token Minting Logic**:
   - It continuously monitors the blockchain for the right conditions to execute a mint transaction based on the target market price in the environment. 
   - It uses WebSocket subscriptions from Alchemy to listen to mined transactions that affect the specified contract, determining the optimal time to mint based on transaction cost and other factors.
   - The script calculates the cost of minting and compares it against a target price that adjusts dynamically to market conditions. If the cost is below the target, it proceeds to mint tokens.

4. **Utility Functions**:
   - Price checks and updates are performed using both the Alchemy WebSocket service and direct API calls to fetch the latest Ethereum price and calculate transaction costs.
   - Gas price calculations are performed to optimize transaction costs and increase the likelihood of the transaction being processed quickly by the network.

5. **Security and Efficiency**:
   - It includes error handling to gracefully manage any issues during the minting process.
   - The script manages nonce for transactions, ensuring that each transaction is unique and processed in order.

### Script Purpose:

- **Automation**: The primary goal is to automate the minting of tokens when certain financial criteria are met, reducing the need for manual intervention and maximizing profitability or cost-efficiency.
- **Educational**: It serves as a practical example for developers interested in blockchain technology, demonstrating how to interact with Ethereum smart contracts programmatically.
- **Community Engagement**: For token communities, this script can engage users by maintaining active participation in the token economy, helping manage the supply and potentially supporting the token’s market value.

### Educational Value:
The script is an excellent resource for developers looking to understand the complexities of real-time blockchain interaction, smart contract manipulation, and dynamic transaction management based on live market conditions. It encapsulates the challenges and solutions in automating blockchain transactions, particularly in the DeFi space where timing and transaction cost can significantly influence outcomes.

# HOW TO USE / CONFIGURE

## Prerequisites

Before you clone and run this project, ensure you have the following installed:

- Git - [Download & Install Git](https://git-scm.com/downloads).
- Node.js - [Download & Install Node.js](https://nodejs.org/en/download/) and the npm package manager.

## Cloning the Repository

To get started with the N_Blurr project, you first need to clone the repository. Open a terminal and run the following command:

```bash
git clone https://github.com/nblurr/N_Mint.git
cd N_Blurr
npm install
```

 ## Gather APIs keys + Wallet private before launching script

 ### Obtain an Etherscan API Key

To get an API key from Etherscan:

Go to Etherscan.
Register for an account or log in if you already have one.
Navigate to the API-KEYs section in your user profile.
Click on "Create New API Key" button.
Label your API Key for reference (e.g., "NFT Minting Automation Script").
Copy the API key generated.

 ### Obtain an Alchemy API Key
To obtain an API key from Alchemy:

Visit Alchemy.
Sign up for an account or log in.
Go to the dashboard and create a new app.
Choose the network that corresponds to your project needs (e.g., Ethereum Mainnet).
View the app details and find your API key under the "API Key" section.
Copy the API key for use in your project.

 ### Set Up QuickNode RPC with Flashbots and MEV Protect
To setup a QuickNode with the required add-ons:

Go to QuickNode.
Sign up for an account or log in.
Create a new node:
Select the blockchain network relevant to your application.
Choose a plan that supports Flashbots Protect and MEV Protect add-ons.
After setting up your node, navigate to the add-ons section.
Enable "Flashbots Protect" and "MEV Protect" by toggling them on.
Once configured, locate your QuickNode RPC URL from the dashboard.


### Steps to Find Your MetaMask ETH Wallet Private Key

#### 1. **Open MetaMask:**
- Click on the MetaMask extension icon in your browser to open the wallet interface.

#### 2. **Unlock MetaMask:**
- Enter your password to unlock MetaMask if it is not already unlocked.

#### 3. **Select the Account:**
- Ensure that you are viewing the account from which you want to retrieve the private key. If you have multiple accounts, click the account icon at the top-right corner, and select the account you need.

#### 4. **Account Details:**
- Click on the three dots (menu) icon, usually found next to the account name at the top of the MetaMask interface.
- From the dropdown menu, select "Account details."

#### 5. **View Private Key:**
- In the Account details window, you will see an option labeled "Export Private Key." Click on this.
- You will be prompted to enter your password again to confirm your identity.

#### 6. **Reveal and Secure the Private Key:**
- After entering your password, click the "Confirm" button. Your private key will be displayed on the screen.
- Carefully copy the private key. It is crucial to keep this key secure because anyone with access to it can access your wallet and its contents. Do not share it with anyone or leave it in an insecure location. 

### Security Tips

- **Never Share Your Private Key:** Your private key is the only thing needed to access your funds. Sharing it can result in the loss of your cryptocurrencies.
- **Use Secure Storage:** If you must save your private key digitally, use encrypted storage solutions. For maximum security, consider writing it down on paper and storing it in a secure location, like a safe.
- **Consider Using a Hardware Wallet:** For enhanced security, especially if dealing with significant amounts of cryptocurrencies, consider using a hardware wallet. Hardware wallets keep your private keys offline and provide an extra layer of security against online threats.

By following these steps, you can retrieve your MetaMask wallet's private key. Remember, handling private keys requires a high degree of caution due to the risks associated with their exposure.


 ## Creare a .env file at script folder root and revise the following

```bash
PRIVATE_KEY='yourwalletprivatekey'
ALCHEMY_API_KEY='youralchemykey'
ETHERSCAN_API_KEY='youretherscankey'
ETH_RPC='yourquicknoderpcendpointurl'
TARGET_MARKET_PRICE_FACTOR=0.52
```

# Start the Mint script

```bash
node NMint.js
```
