const axiosModule = await import('axios');
const cheerio = await import('cheerio');
const axios = axiosModule.default; 



async function fetchTransactionFee(txHash) {
    const url = `https://etherscan.io/tx/${txHash}`;
    
    try {
        // Fetch the transaction page
        const response = await axios.get(url);
        const data = response.data;
        
        // Load the HTML into cheerio
        const $ = cheerio.load(data);

        // Extract the transaction fee
        // This assumes the transaction fee is within a <td> with specific text
        const txnFee = $('#ContentPlaceHolder1_spanTxFee > div > span:nth-child(2)').text().replace('($','').replace(')','');

        console.log(`Transaction Fee for ${txHash}: ${txnFee}`);

        return txnFee;
    } catch (error) {
        console.error('Error fetching transaction fee:', error.message);
    }
}

console.log('Fees: ' + await fetchTransactionFee('0x3662805a265c3d866b3841a0d9d93a9bb8db5e53f6b673ccd781dd0a374ec5ae'));