import dotenv from "dotenv";
import { Connection, Keypair } from "@solana/web3.js";
import { PumpFunSDK } from "../../src";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import { AnchorProvider } from "@coral-xyz/anchor";
import { countSPLTokenTransactions } from './tx_counter';
import { printBarChart } from './bar_chart';
import {addItem,printtable} from './fancy_table';
import {allSubstrings,countAndSortStrings} from './string_processor';
import {generate_name_ticker} from './ai_metadata';
import {modify_telegram} from './telegram_controls';
import {determine_profit} from './profit_check';
let ExpiredTokenArray: Array<string> = [];

class ExpiringTokenQueue {
    private queue: { items: string[], expiration: number }[] = [];
    private expirationTime: number;
    private intervalId: NodeJS.Timeout;

    constructor(expirationMinutes: number, checkIntervalSeconds: number = 10) {
        this.expirationTime = expirationMinutes * 60 * 1000;
        this.intervalId = setInterval(() => this.cleanup(), checkIntervalSeconds * 1000);
    }

    addItems(items: string[]): void {
        const startTime = Date.now();
        const expiration = startTime + this.expirationTime;
        this.queue.push({ items, expiration });
    }

    getItems(): string[][] {
        return this.queue.map(entry => entry.items);
    }

    cleanup(): void {
        const now = Date.now();
        const initialLength = this.queue.length;

        // Filter the queue and keep items that have not expired
        this.queue = this.queue.filter(entry => {
            if (entry.expiration > now) {
                return true;
            } else {
                var ca_to_be_removed = entry.items[0];
                ExpiredTokenArray.push(ca_to_be_removed);
                console.log(`Removing expired items: ${JSON.stringify(entry.items)}`);
                return false;
            }
        });

        if (initialLength > this.queue.length) {
            console.log(`Cleanup complete. Removed ${initialLength - this.queue.length} item(s).`);
        }
    }

    stopCleanup(): void {
        clearInterval(this.intervalId);
    }
}

// Need to add transaction per minute too

const tokenQueue = new ExpiringTokenQueue(5); // 8 minutes expiration time
const tokensWithDemandQueue = new ExpiringTokenQueue(90); //This is the queue that keeps tokens that shown demand within their first 5 minutes of trading.
const nameSubstrings = new ExpiringTokenQueue(90);
let PastTokenArray: Array<string> = [];
let tx_count_queue: [string, number, string, number,string,string][] = []; // array of token addresses ordered from most to least based on tx count

async function tokenListener() {
    dotenv.config();
    if (!process.env.HELIUS_RPC_URL) {
        console.error("Please set HELIUS_RPC_URL in .env file");
        console.error(
            "Example: HELIUS_RPC_URL=https://mainnet.helius-rpc.com/?api-key=<your api key>"
        );
        console.error("Get one at: https://www.helius.dev");
        return;
    }

    let connection = new Connection(process.env.HELIUS_RPC_URL || "");

    let wallet = new NodeWallet(new Keypair()); // Note this is not used
    const provider = new AnchorProvider(connection, wallet, {
        commitment: "finalized",
    });

    let sdk = new PumpFunSDK(provider);

    let createEvent = sdk.addEventListener("createEvent", (event) => {
        if (PastTokenArray.indexOf(event.mint.toString()) == -1) { // Not in the past tokens array yet
            PastTokenArray.push(event.mint.toString());
            tokenQueue.addItems([event.mint.toString(), event.name.toString(), event.symbol.toString(), Date.now().toString()]); // Last item will be the tx count in string form
        }
    });
}

function findElement(arr: [any, any, any, any,any,any][], target: any): number | null {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i].includes(target)) {
            return i;
        }
    }
    return null;
}

function groupAndProcessSubstrings(){
    const current_substrings: string[][] = nameSubstrings.getItems();
    if (current_substrings.length > 0) {
        let concatenatedString: string[] = current_substrings.flat();
        console.log(countAndSortStrings(concatenatedString));
    };
}

function getCurrentKeyWord():string{
    const current_substrings: string[][] = nameSubstrings.getItems();
    if (current_substrings.length > 0) {
        let concatenatedString: string[] = current_substrings.flat();
        var result:[string,number][] = countAndSortStrings(concatenatedString);
        if (result.length > 0){
            var top_result = result[0];
            if(top_result[1]>=4){
                return top_result[0];
            };
        };
    };
    return "None";
}



function remove_expired_from_tx_count_queue() {//here we want to add all tokens that are being removed but ended up in the top 5-10 based on the SN value
    for (let i = 0; i < ExpiredTokenArray.length; i++) {
        var current_token_amount = tx_count_queue.length-1;//adjusted for 0 index based array 
        var ca_to_be_removed = ExpiredTokenArray[i];
        var position = findElement(tx_count_queue, ca_to_be_removed);
        var minSNcount = 500;//ro be tweaked (migth make this more dynami)
        if (position !== null) {
            var topfour = current_token_amount-4;
            if (position >=(topfour) && topfour > 0 &&tx_count_queue[position][3]>=minSNcount){ //within top 4 ( migth also filter by minimum SN number too tweak later)
                addItem(ca_to_be_removed,tx_count_queue[position][4],tx_count_queue[position][5],tx_count_queue[position][3]);
                tokensWithDemandQueue.addItems([ca_to_be_removed,tx_count_queue[position][4],tx_count_queue[position][5],tx_count_queue[position][3].toString()]);//adding to the queue of tokens that shown demand
                nameSubstrings.addItems(allSubstrings(tx_count_queue[position][5],3));
            };
            ExpiredTokenArray = ExpiredTokenArray.filter((_, index) => index !== i);
            tx_count_queue = tx_count_queue.filter((_, index) => index !== position);
        }
    }
};

function getTPM(initial_time: number, tx_count: number) {
    return Math.floor((tx_count / (Date.now() - initial_time)) * 1000000);
};

async function tx_counter() {
    while (true) {
        const current_tokens: string[][] = tokenQueue.getItems();
        if (current_tokens.length > 0) {
            const promises = current_tokens.map(async (token) => {
                const token_ca: string = token[0];
                const token_start_time: number = parseInt(token[3]);
                const position = findElement(tx_count_queue, token_ca);
                try{
                    if (position !== null) {
                        var time_alive = (Date.now() - token_start_time)/1000;
                        var tx_count = 0;
                        var tps = 0;
                        if (time_alive > 20){
                            const transaction_result = await countSPLTokenTransactions(token_ca, "");
                            tx_count = transaction_result.sig_amount;
                            tps = getTPM(token_start_time, tx_count);
                        };
                        tx_count_queue[position][1] = tx_count;
                        tx_count_queue[position][3] = tps;
                    } else {
                        const token_ticker = token[2];
                        const token_name = token[1];
                        tx_count_queue.push([token_ca, 0, "", 0,token_ticker,token_name]);
                    }
                }catch( error){
                    console.log("Tx parse error...will retry");
                }
            });

            await Promise.all(promises);
            remove_expired_from_tx_count_queue();
            tx_count_queue.sort((a, b) => a[3] - b[3]);//1 is ordering by tx 3 is SN value
        }
        await new Promise((resolve) => setTimeout(resolve, 100));
        console.clear();
        printBarChart(tx_count_queue);
        printtable();
        groupAndProcessSubstrings();
        var res = getCurrentKeyWord();
        console.log(`Current key word for Meta: ${res}`);
        if (res != 'None'){
            var meta_result = generate_name_ticker(res);
            if (meta_result != null){
                console.log(`potentinal toekn metadata: ${meta_result.coinName} ${meta_result.ticker}`);
            }
        };
    }
}

function delay(minutes: number) {
    return new Promise(resolve => setTimeout(resolve, minutes * 60 * 1000));
}

const ActiveJeetToken = new ExpiringTokenQueue(20); // each token will haev amax timeout fo 20 min until its jeeeted
//techncically i could use this to handle many tokens at same time
async function indianTokenEngine(){//main code to run the new token
    const launch_time = Date.now()/(1000*60); //in minutes
    const check_interval = 30;
    const take_profit_threshold = 0.25; //SOL
    const chat_id = -1002187221529; //to be improved later
    while(true){//for now just one token at a time but this can be changed later I guess
        //const currentJeetTokens: string[][] = tokenQueue.getItems();
        var res = getCurrentKeyWord();
        var  coinName = '';
        var ticker = '';
        var launch_token = false;
        console.log(`Current key word for Meta: ${res}`);
        if (res != 'None'){
            var meta_result = generate_name_ticker(res);
            if (meta_result != null){
                console.log(`Preparing to launch the token: ${meta_result.coinName} ${meta_result.ticker}`);
                coinName = meta_result.coinName;
                ticker = meta_result.ticker;
                launch_token = true;
                //still need desc and img to be ready.
            }
        };
        if (launch_token){
            var description = '';
            await modify_telegram(chat_id,description,coinName);//possibel error handling?
            //need to change logo via telethon and real accoutn not bot.
            //need to prepare the tg with the name  and logo.
            //deploy the token 
            //write automated commests both in group and the chat
            //sense profit and jeet if its above that level.
            
        };
        
        await delay(20);
    }

};

async function runConcurrently() {
    await Promise.all([tokenListener(), tx_counter()]);
}

// Call the function to run both async functions concurrently
runConcurrently();

//now i want a past tokens list so when releasing a token it wont release the same name again 
//also helpt o make new name by ignoring pas options for example it can use suepr meta twice but it cant be suerp cat twice you know whay you mean

//for now it will onyl make a token by picking the key phsae from most common substring and it has to occour at least 3 times.