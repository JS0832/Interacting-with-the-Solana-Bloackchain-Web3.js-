//have a token sniffer
//event listener and place every token on a 15min queue
//count number of transacrions the token gets
//order tokens with most transactions per 15 min

//check the common theme/pattern between them if there is any


//develop a token that best matches the theme (meta) but has a twist on it ( brute force strategy checkin against the exisitng past tokens)

import dotenv from "dotenv";
import { Connection, Keypair } from "@solana/web3.js";
import { PumpFunSDK } from "../../src";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import { AnchorProvider } from "@coral-xyz/anchor";
import {countSPLTokenTransactions} from './tx_counter';
import {printBarChart} from './bar_chart';

let ExpiredTokenArray: Array<string> = [];
class ExpiringTokenQueue{
    private queue: { items: string[], expiration: number}[] = [];
    private expirationTime: number;
    private intervalId: NodeJS.Timeout;

    constructor(expirationMinutes: number, checkIntervalSeconds: number = 10) {
        this.expirationTime = expirationMinutes * 60 * 1000;
        this.intervalId = setInterval(() => this.cleanup(), checkIntervalSeconds * 1000);
    }

    addItems(items: string[]): void {
        const startTime = Date.now();
        const expiration = startTime + this.expirationTime;
        this.queue.push({items,expiration});
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

//need to add tranation per minute too


const tokenQueue = new ExpiringTokenQueue(8); // 25 minutes expiration time
let PastTokenArray: Array<string> = [];
let tx_count_queue:[string,number,string,number][] = []; //array of token adresses ordered form most to least based on tx count
async function tokenListener(){
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

  let wallet = new NodeWallet(new Keypair()); //note this is not used
  const provider = new AnchorProvider(connection, wallet, {
    commitment: "finalized",
  });

  let sdk = new PumpFunSDK(provider);

  let createEvent = sdk.addEventListener("createEvent", (event) => {
    if (PastTokenArray.indexOf(event.mint.toString())==-1){//not in the past tokens array yet
        PastTokenArray.push(event.mint.toString());
        //console.log("NEW TOKEN: ", event.name);
        tokenQueue.addItems([event.mint.toString(), event.name.toString(),event.symbol.toString(),Date.now().toString()]);//last item will be the tx count in string form
        //console.log(tokenQueue.getItems());
    }
  });
};

function findElement(arr: [any, any, any,any][], target: any): number | null {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i].includes(target)) {
            return i;
        }
    }
    return null;
}


function remove_expired_from_tx_count_queue(){
    
    for (let i = 0; i < ExpiredTokenArray.length; i++) {
        var ca_to_be_remvoed = ExpiredTokenArray[i];
        var position = findElement(tx_count_queue, ca_to_be_remvoed);
        if (position!== null) {
            ExpiredTokenArray = ExpiredTokenArray.filter((_, index) => index !== i);
            tx_count_queue = tx_count_queue.filter((_, index) => index !== position);
        };
    };
};

function getTPM(initial_time:number,tx_count:number){
    return Math.floor((tx_count/(Date.now() - initial_time))*60000);
};

async function tx_counter() {
    while(true){
        const current_tokens:string[][] = tokenQueue.getItems();
        if (current_tokens.length>0){
            for (let i = 0; i < current_tokens.length; i++) {
                var token_ca:string = current_tokens[i][0];
                var token_start_time:number = parseInt(current_tokens[i][3]);
                var position = findElement(tx_count_queue, token_ca);
                if (position!== null) {
                    var last_sig = tx_count_queue[position][2];
                    var transaction_result = await countSPLTokenTransactions(token_ca,last_sig);
                    var tx_count = transaction_result.sig_amount;
                    var latest_sig = transaction_result.latestSignature;
                    tx_count_queue[position][1] += tx_count;
                    var tps = getTPM(tx_count_queue[position][1],tx_count);
                    tx_count_queue[position][2] = latest_sig;
                    tx_count_queue[position][3] = tps;
                } else {
                    var transaction_result = await countSPLTokenTransactions(token_ca,"");
                    var tx_count = transaction_result.sig_amount;
                    var latest_sig = transaction_result.latestSignature;
                    var tps = getTPM(token_start_time,tx_count);
                    tx_count_queue.push([token_ca,tx_count,latest_sig,tps]);
                };
            };
            remove_expired_from_tx_count_queue();
            tx_count_queue.sort((a, b) => a[1] - b[1]);
        };
        //CHECK IF ANY OF THE TOKENS ARENT IN THE CURRENT TOKENS IF SO THEN THAT MENAS IT EXPIRED.
        await new Promise((resolve) => setTimeout(resolve, 100));
        //console.log(tx_count_queue);
        printBarChart(tx_count_queue);
    };
}

async function runConcurrently() {
    await Promise.all([tokenListener(), tx_counter()]);
}

// Call the function to run both async functions concurrently
runConcurrently();

//I NEED SOMETHIGN TO COUNT TRANSACTIONS OF EACH TOKEN AND STORE IT IN THE QUEUE 


