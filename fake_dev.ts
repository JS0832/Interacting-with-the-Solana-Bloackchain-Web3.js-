//chatting in tele and other shit here.
import TelegramBot from 'node-telegram-bot-api';
import {isTokenActive} from './jeet_engine';
// Replace with your bot token
const token = '7424521052:AAFOTkoXyp6IaZwdYgES-FLamnvsm-zMlOU'; // Replace with your actual bot token obtained from BotFather
const bot = new TelegramBot(token);
let currentInterval = 10000;
const messages: string[] = [
    "Warm welcome to all new chads joining us",
    "I will provide a detailed plan of how we will push this in few moments.First of all I will burn some tokens and turn the VC on when we have a bit more chads in here.",
    "I will pin the wbsite soon as the DNS is still loading,we will bump the token aswell so we get more expousoure for us.",
    "OK guys the plan is this: I will pay for dex prepaid at 15k mc , we will have a game listing and after we hit RAY. I will have finder prepared and some more suprises ready.Organic all the way baby!I will hop on the VC soon so we can chill.Im just sorting out few KOLS and other things so its all nicely lined up.",
    "Im sure we will continue doing well because I can see many CHADS in here and our meta is strong.This is Based stuff NGL.",
    "Is the buy bot down? haha that thing is always broken what other one shall I use ? do you chads know?",
    "Guy's BTW any fud or disrespectful behaviour is not allowed and will get you banned.I am busy in the background to get this to send.",
    "I have around 4 KOLS ready straight after we hit RAY!",
    "I managed to get a good artist for our project."
    // Add more messages as needed
];

export async function startDevBot(chat_id:number){
    let index = 0;
    let growthFactor = 2.75;
    function sendMessage() {
        bot.sendMessage(chat_id, messages[index]);
        console.log('sent mesaage to group: ',messages[index]);
        index = (index + 1) % messages.length; // Reset index to 0 after reaching the end
        currentInterval *= growthFactor; // Increase the interval by the growth factor
        if(isTokenActive){
            return;
        }
        setTimeout(sendMessage, currentInterval);
    }
    if (isTokenActive){
        return;
    }
    setTimeout(sendMessage, currentInterval);
}

// Start the chatbot with a message every 5 seconds (5000 milliseconds)
