const ethers = require('ethers');
const fetch = require('node-fetch');
require('dotenv').config();

// Load environment variables
const {
    INFURA_PROJECT_ID,
    CONTRACT_ADDRESS,
    TELEGRAM_BOT_TOKEN,
    TELEGRAM_CHAT_ID
} = process.env;

// Define your provider (you can use Infura, Alchemy, or any Ethereum node provider)
const provider = new ethers.providers.InfuraProvider('mainnet', INFURA_PROJECT_ID);

// Define the contract ABI
const contractABI = [
    // Replace with your contract ABI
];

// Create a contract instance
const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, provider);

// Function to send message to Telegram
const sendTelegramMessage = async (message) => {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            text: message,
        }),
    });
    const data = await response.json();
    if (!data.ok) {
        console.error('Error sending message to Telegram:', data);
    } else {
        console.log('Message sent to Telegram successfully');
    }
};

// Define the function to handle the events
const handleEvent = async (event) => {
    console.log('New event:', event);
    const message = `New event detected: ${JSON.stringify(event)}`;
    await sendTelegramMessage(message);
};

// Set up the event listener for all events
contract.on('*', handleEvent);

console.log(`Listening for all events from contract ${CONTRACT_ADDRESS}...`);
