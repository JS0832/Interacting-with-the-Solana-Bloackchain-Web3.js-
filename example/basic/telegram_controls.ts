import TelegramBot from 'node-telegram-bot-api';

const token = '7424521052:AAFOTkoXyp6IaZwdYgES-FLamnvsm-zMlOU'; // Replace with your actual bot token obtained from BotFather
const bot = new TelegramBot(token);

async function changeGroupName(chatId: number, newName: string) {
    try {
        await bot.setChatTitle(chatId, newName);
        console.log(`Group name changed to "${newName}"`);
    } catch (error: any) { // Explicitly specify 'error' as 'any'
        console.error(`Failed to change group name: ${error.message}`);
    }
}

async function changeGroupDescription(chatId: number, newDescription: string) {
    try {
        await bot.setChatDescription(chatId, newDescription);
        console.log(`Group description changed to "${newDescription}"`);
    } catch (error: any) { // Explicitly specify 'error' as 'any'
        console.error(`Failed to change group description: ${error.message}`);
    }
}

export async function modify_telegram(chatId: number, newDescription: string,newName: string){
        await changeGroupName(chatId, newName);
        await changeGroupDescription(chatId, newDescription);
};



bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    console.log(chatId);
    if (msg.text && msg.text.toLowerCase().includes('change group')) {
        const newName = 'New Group Name';
        const newDescription = 'New Group Description';

        await changeGroupName(chatId, newName);
        await changeGroupDescription(chatId, newDescription);
    }
});

bot.on('polling_error', (error: any) => { // Explicitly specify 'error' as 'any'
    console.error(`Polling error: ${error}`);
});
