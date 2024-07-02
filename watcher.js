const {Web3} = require("web3");
const axios = require("axios");
const http = require("http");
require("dotenv").config(); // Load environment variables from .env file

// Initialize Web3 with Infura WebSocket provider
const web3 = new Web3(
    new Web3.providers.WebsocketProvider(
        `wss://mainnet.infura.io/ws/v3/${process.env.INFURA_PROJECT_ID}`,
    ),
);

// Telegram bot details
const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
const telegramChatId = process.env.TELEGRAM_CHAT_ID;

// Address to watch
const watchAddress = process.env.WATCH_ADDRESS.toLowerCase();

// Port to listen on
const port = process.env.PORT || 3000;

// Subscribe to pending transactions
web3.eth.subscribe("pendingTransactions", (error, txHash) => {
    if (error) {
        console.error("Error subscribing to pending transactions:", error);
        return;
    }

    // Get transaction details
    web3.eth
        .getTransaction(txHash)
        .then((tx) => {
            if (
                tx &&
                ((tx.to && tx.to.toLowerCase() === watchAddress) ||
                    (tx.from && tx.from.toLowerCase() === watchAddress))
            ) {
                console.log("Transaction involving watch address:", tx);

                // Get transaction receipt to calculate the fee
                web3.eth
                    .getTransactionReceipt(txHash)
                    .then((receipt) => {
                        if (receipt) {
                            const gasUsed = receipt.gasUsed;
                            const gasPrice = tx.gasPrice;
                            const fee = web3.utils.fromWei(
                                (gasUsed * gasPrice).toString(),
                                "ether",
                            );

                            // Format the message
                            const message = `New transaction involving ${watchAddress}:\n${JSON.stringify(tx, null, 2)}\nTransaction Fee: ${fee} ETH`;

                            // Send message to Telegram
                            axios
                                .post(
                                    `https://api.telegram.org/bot${telegramBotToken}/sendMessage`,
                                    {
                                        chat_id: telegramChatId,
                                        text: message,
                                    },
                                )
                                .then((response) => {
                                    console.log(
                                        "Message sent to Telegram:",
                                        response.data,
                                    );
                                })
                                .catch((error) => {
                                    console.error(
                                        "Error sending message to Telegram:",
                                        error,
                                    );
                                });
                        }
                    })
                    .catch((error) => {
                        console.error(
                            "Error getting transaction receipt:",
                            error,
                        );
                    });
            }
        })
        .catch((error) => {
            console.error("Error getting transaction details:", error);
        });
});

// Create an HTTP server
const server = http.createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Transaction watcher is running\n");
});

// Start the server
server.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
