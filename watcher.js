// watcher.js
const {Web3} = require('web3');
const axios = require('axios');
require('dotenv').config(); // Load environment variables from .env file

// Replace with your Infura project ID or other Ethereum node provider
const web3 = new Web3(new Web3.providers.HttpProvider(`https://mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID}`));

// Replace with your contract ABI and address
const contractABI = JSON.parse(process.env.CONTRACT_ABI);
const contractAddress = process.env.CONTRACT_ADDRESS;

// Replace with your Telegram bot token and chat ID
const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
const telegramChatId = process.env.TELEGRAM_CHAT_ID;

const contract = new web3.eth.Contract(contractABI, contractAddress);

// Replace with the event you want to watch
const eventName = process.env.EVENT_NAME;

contract.events[eventName]({
    fromBlock: 'latest'
}, (error, event) => {
    if (error) {
        console.error('Error watching event:', error);
        return;
    }

    console.log('Event received:', event);

    // Format the message
    const message = `Event ${eventName} received:\n${JSON.stringify(event.returnValues, null, 2)}`;

    // Send message to Telegram
    axios.post(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
        chat_id: telegramChatId,
        text: message
    })
    .then(response => {
        console.log('Message sent to Telegram:', response.data);
    })
    .catch(error => {
        console.error('Error sending message to Telegram:', error);
    });
});
