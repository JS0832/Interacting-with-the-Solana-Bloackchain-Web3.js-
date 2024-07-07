import dotenv from "dotenv";
import { Connection, Keypair, LAMPORTS_PER_SOL,PublicKey,SystemProgram,Transaction,sendAndConfirmTransaction} from "@solana/web3.js";
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
import * as DBhelpers from './walletdb';
import * as Dbhops from './hopsDb';
import bs58 from 'bs58'
import { withdrawFromBinance } from './binance';
import web3 from "@solana/web3.js";
import {
    getOrCreateKeypair,
    getSPLBalance,
    printSOLBalance,
    printSPLBalance,
  } from "../util";
const addressDB = new DBhelpers.AddressDatabase();//managing the past deployer wallets
const hopsDatabase = new Dbhops.HopsDatabase();//managing the intermidiate wallets

const binanceAddress = new web3.PublicKey("FUFu9PZ7ZGEHAeCFafVJSf857kQkaaPboa5mh7zJcn3c"); //use to send back the funds back
const SLIPPAGE_BASIS_POINTS = 1000n;//slippage amount for buy and sell 

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


async function append_initial_wallet(inital_wallet:Keypair): Promise<Wallet> {
    const keypair = inital_wallet
    const publicKey = inital_wallet.publicKey.toBase58();
    return { publicKey, keypair };
}

interface Wallet {
    publicKey: string;
    keypair: Keypair;
}
  
async function generateRandomWallet(): Promise<Wallet> {
const keypair = Keypair.generate();
const publicKey = keypair.publicKey.toBase58();
hopsDatabase.addAddress(bs58.encode(keypair.secretKey).toString(),publicKey.toString());//save walets as backup in case of failure
return { publicKey, keypair };
}

async function retryTransaction(
    fromWallet: Keypair,
    toWallet: Keypair,
    amount: number
  ): Promise<void> {
    const connection = new Connection(process.env.HELIUS_RPC_URL || "");
    let maxRetries = 5;
    let attempt = 0;
    while (attempt < maxRetries) {
      try {
        await transferSol(connection, fromWallet, toWallet.publicKey, amount);
        return;
      } catch (error) {
        console.error(`Transaction attempt ${attempt + 1} failed:`, error);
        attempt++;
        if (attempt >= maxRetries) {
          throw new Error(`Transaction failed after ${maxRetries} attempts`);
        }
      }
    }
  }
  
  async function transferSol (
    connection: Connection,
    fromWallet: Keypair,
    toWallet: PublicKey,
    amount: number
  ): Promise<void> {
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: fromWallet.publicKey,
        toPubkey: toWallet,
        lamports: amount,
      })
    );
    const tx = await sendAndConfirmTransaction(connection, transaction, [fromWallet]);
    //confirm the signature.
    const latestBlockHash = await connection.getLatestBlockhash();
    const confirmation = await connection.confirmTransaction({
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      signature: tx,
    });
    if (confirmation.value.err) {
      throw confirmation.value.err
    } else {
      console.log('Transfer complete with signature: ', tx);
    }
  }
  
  
  function sleep(minutes: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, Math.floor(1000*60*minutes)));
  }

async function sol_hops(deployer:Keypair,inital_wallet:Keypair): Promise<void>{
    console.log('sending SOL via hops')
    //need to fetch balance to determien the amount of sol to transfer
    var fee:number = 0.0012*LAMPORTS_PER_SOL; //fee cost ( to be played with ) (0.001 sol for now)
    const connection = new Connection(process.env.HELIUS_RPC_URL || "");
  
    const finalWallet:Keypair = deployer; //we want the final wallet to be the deployer
    console.log('Final Wallet:', finalWallet.publicKey.toString());
  
    const hops = 3; // Number of hops
    const wallets: Wallet[] = [];
  
    const initial = await append_initial_wallet(inital_wallet);
    wallets.push(initial);
  
    for (let i = 0; i < hops; i++) {
      const wallet = await generateRandomWallet();
      wallets.push(wallet);
    }
    sleep(0.1);
    // Transfer through each wallet
    for (let i = 0; i < hops - 1; i++) {
      try{
        var retries = 0;
        var maxRetries = 5;
        while (retries < maxRetries) {
          sleep(0.5);//add logic to onyl pass it on if the balance is sufficient (need retry logic here)
          const balance = await connection.getBalance(wallets[i].keypair.publicKey);
          const amount = Math.floor(balance - fee); // leave a small balance for fees
          if ((amount)>0){
            console.log(`Transferring ${amount} lamports from wallet ${i} to wallet ${i + 1}`);
            await retryTransaction(wallets[i].keypair, wallets[i + 1].keypair, amount);
            break; // Exit retry loop if successful
          }else{
            retries++;
            console.log('retrying hop....')
          }
        }
        if (retries === maxRetries) {
          console.error('Max retries exceeded');
          throw Error; // Throw error after retries are exhausted
        }
      }catch(error){
        console.error('Transfer error in hops occured');
        throw error;
      }
    }
    sleep(0.75);
    try {
        var retries = 0;
        var maxRetries = 5;
        while (retries < maxRetries) {
        // Transfer to the final wallet
        const balance = await connection.getBalance(wallets[hops - 1].keypair.publicKey);
        const amount = Math.floor(balance - fee); // leave a small balance for fees
        if ((amount)>0){
          console.log(`Transferring ${amount} lamports from final hop to final wallet`);
          await retryTransaction(wallets[hops - 1].keypair, finalWallet, amount);
          break; // Exit retry loop if successful
        }else{
          retries++;
          console.log('retrying hop....')
        }
      }
      if (retries === maxRetries) {
        console.error('Max retries exceeded');
        throw Error; // Throw error after retries are exhausted
      }
    }catch(error){
      console.error('Transfer error in hops occured');
      throw error;
    }
    console.log('Hops complete');
  }

function delay(minutes: number) {
    return new Promise(resolve => setTimeout(resolve, minutes * 60 * 1000));
}

const connection = new Connection(process.env.HELIUS_RPC_URL || "");
let wallet = new NodeWallet(new Keypair()); //note this is not used
const provider = new AnchorProvider(connection, wallet, {
  commitment: "finalized",
});

let sdk = new PumpFunSDK(provider);

async function  deploy_and_buy_token(token_name:string,token_symbol:string,token_description:string,img_filepath:string,tele:string,x:string,website:string,deployerAccount:Keypair,mint:Keypair,buy_amount:number): Promise<boolean> {
  //need to return true fr false if the token creation has been confirmed.
  await printSOLBalance(
    connection,
    deployerAccount.publicKey,
    "Deployer Account"
  );

  let globalAccount = await sdk.getGlobalAccount();
  console.log(globalAccount);

  //Check if mint already exists
  let boundingCurveAccount = await sdk.getBondingCurveAccount(mint.publicKey);//this techinically will never be the case as we are creating a token from the start
  if (!boundingCurveAccount) {
    let tokenMetadata = {
      name: token_name,
      symbol: token_symbol,
      description: token_description,
      filePath: img_filepath,
      twitter: x,
      telegram: tele,
      website:website 
    };

    let createResults = await sdk.createAndBuy(
      deployerAccount,
      mint,
      tokenMetadata,
      BigInt(buy_amount * LAMPORTS_PER_SOL),
      SLIPPAGE_BASIS_POINTS,
      {
        unitLimit: 550000,
        unitPrice: 250000,
      },
    );

    if (createResults.success) {
      console.log("Token deployed");
      return true;
    }else{
      console.log(createResults.signature)
      return false;
    }
  } else {
    console.log("boundingCurveAccount", boundingCurveAccount);
    console.log("Success:", `https://pump.fun/${mint.publicKey.toBase58()}`);
    printSPLBalance(connection, mint.publicKey, deployerAccount.publicKey);
  }
  return false;
};



async function jeetToken(){
    //here we will jeet the token for two reasons:
    //1 time is up 
    //2 profit has been hit.
    //if sell has been confirmed then job is done with that token so 
}

async function sniffLiquidity(deployer:Keypair,tokenCa:string,buyAmount:number,tp:number){
    //sbiff for liquidty changes and if we meet target then sell
    while(true){
        var profit = await determine_profit(buyAmount,tokenCa);//tbh do place it on a timer queue as it will be useful to see when it expied.
        if (profit !== null && profit >= tp){
            jeetToken();//gotta pass paramas in
        };
        await new Promise((resolve) => setTimeout(resolve, 200));
    }

}


const ActiveJeetToken = new ExpiringTokenQueue(20); // each token will haev amax timeout fo 20 min until its jeeeted
//techncically i could use this to handle many tokens at same time
async function indianTokenEngine(){//main code to run the new token
    const launch_time = Date.now()/(1000*60); //in minutes
    const check_interval = 30;
    const take_profit_threshold = 0.3; //SOL
    const deployerBuyAmount = 1.4;//amount that the deployer will buy each time that a token is made
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
            if (meta_result != null) {
                console.log(`Preparing to launch the token: ${meta_result.coinName} ${meta_result.ticker}`);
                coinName = meta_result.coinName;
                ticker = meta_result.ticker;
                launch_token = true;
                //still need desc and img to be ready.
            };
        };
        if (launch_token){
            try{
                var description = '';
                await modify_telegram(chat_id,description,coinName);//possibel error handling?
                //need to change logo via telethon and real accoutn not bot.
                //need to prepare the tg with the name  and logo.
                //deploy the token 
                //write automated commests both in group and the chat
                //sense profit and jeet if its above that level.
                const connection = new Connection(process.env.HELIUS_RPC_URL || "");
                let temp_deployer:Keypair;
                let temp_initial:Keypair = Keypair.generate();
                let temp_token:Keypair; //the new token keypair
                temp_deployer = Keypair.generate();//new temporary deployer
                addressDB.addAddress(temp_deployer.publicKey.toString(), bs58.encode(temp_deployer.secretKey).toString());
                temp_initial = Keypair.generate();//new temporary inttial deposit wallet
                const binance_res = await withdrawFromBinance(temp_initial.publicKey.toString(),'1.5');//amount will be fixed for now 
                console.log('Response from Binance: ',binance_res);
                var tries = 0;
                while ((await connection.getBalance(temp_initial.publicKey))<0.1){
                try{
                    if (tries > 20){
                    //throw error and stop
                    throw new Error("An error occurred with the deposit to initial wallet! program halted");
                    }
                }catch (error){
                    throw error; // Rethrow the error after logging
                }
                tries+=1;
                await sleep(1);
                }
                //IF NO ERRORS THROW WE CAN PROCEED TO THE HOPS PART
                console.log('Deposit has been confirmed at: ',temp_initial.publicKey.toString());
                console.log('performaing sol hops from initial wallet to deployer: ',temp_deployer.publicKey.toString());
                try{
                    await sol_hops(temp_deployer,temp_initial);
                }catch(error){
                    throw error;
                }
                temp_token = Keypair.generate();//the address of the new token
                console.log('Sucesfully generated the token adress: ',temp_token.publicKey.toString());
                console.log('token pump fun address will be: ',`https://www.pump.fun/${temp_token.publicKey.toString()}`);
                var tokenDeployRetryCount = 0;
                while (true){
                    var creationResult = await deploy_and_buy_token(temp_token_name,temp_token_ticker,temp_token_desc,token_logo_filepath,temp_token_tele,temp_token_twitter,temp_token_website,temp_deployer,temp_token);
                    if (creationResult){
                        break;
                    }else{
                        if (tokenDeployRetryCount>2){
                            console.log('failed to deploy token after numerous attempts.Sending back funds to Binance');
                            sleep(0.1);
                            //send back the funds
                            var fee:number = 0.0012*LAMPORTS_PER_SOL; 
                            const current_sol_balance  =  Math.floor((await connection.getBalance(temp_deployer.publicKey)) - fee);
                            console.log('curent sol balance: ',current_sol_balance);
                            console.log('Sending back to cex and waiting.....');
                            await transferSol(connection, temp_deployer, binanceAddress, current_sol_balance);    
                            throw new Error(`Token was not deployed! Retry count exceeded`);
                        }else{
                            console.log(`Token was not deployed! Retry count ${tokenDeployRetryCount}`);
                        }
                        tokenDeployRetryCount+=1;
                    };
                }
                //here means token was deployed.
                //add it toke queue to inititate the timer on it and run the pnl checker ect asyncronously.
            }catch(error){
                console.log(error);
            };
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