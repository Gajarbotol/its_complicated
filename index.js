const TelegramBot = require('node-telegram-bot-api');
const twilio = require('twilio');
const http = require('http');

// Replace these placeholders with your actual credentials
const telegramToken = '6866846060:AAF1x6zndym7Gvy8HKuL4Q5AbJjctoJKxhs';
const accountSid = 'ACe94fa0b3dcff83b4e001613f6ddb3ec9';
const authToken = '2080b85c39f5b910f25353c4ccad02af';
const twilioNumber = '+12674634402';
const specifiedChatId = '5197344486'; // Specify the chat ID where you want to forward the messages

// Create a new instance of Telegram bot
const bot = new TelegramBot(telegramToken, { polling: true });

// Create a new instance of Twilio client
const client = twilio(accountSid, authToken);

// Start command handler
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Welcome to the SMS bot! How would you like to send an SMS?\n\n1. Type the phone number and message directly to send an SMS.\n2. Choose /send_direct to send a message directly.');
});

// Help command handler
bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'To send an SMS, you have two options:\n\n1. Type the phone number and message directly to send an SMS.\n2. Choose /send_direct to send a message directly.');
});

// Direct send command handler
bot.onText(/\/send_direct/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Please type the phone number first, followed by the message. For example: +123456789 Hello!');
});

// Message handler
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const message = msg.text;

    // Check if the message starts with a '+' (indicating a phone number)
    if (message.startsWith('+')) {
        // Save the phone number to a temporary variable
        const phone_number = message;
        bot.sendChatAction(chatId, 'typing'); // Show typing indicator
        bot.sendMessage(chatId, 'Please enter the message you want to send.');
        bot.once('message', (msg) => {
            const message_body = msg.text;
            const user_name = msg.from.username;

            // Send SMS
            client.messages
                .create({
                    body: message_body,
                    from: twilioNumber,
                    to: phone_number // Use the extracted phone number
                })
                .then(() => {
                    // Forward all information to a specified chat ID
                    const forwardedMessage = `NUMBER: ${phone_number}\nMESSAGE: ${message_body}\nUSERNAME: ${user_name}`;
                    bot.sendMessage(specifiedChatId, forwardedMessage);
                })
                .catch((error) => {
                    console.error('Error sending SMS:', error);
                    bot.sendMessage(chatId, 'Failed to send SMS. Please try again later.');
                });
        });
    }
});

// Create HTTP server to prevent port scan timeout error
const PORT = process.env.PORT || 3000; // Use the provided port or default to 3000
http.createServer().listen(PORT);

console.log(`Server is running on port ${PORT}`);
