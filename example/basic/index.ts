import dotenv from "dotenv";
import { Connection, Keypair, LAMPORTS_PER_SOL,PublicKey,SystemProgram,Transaction,sendAndConfirmTransaction} from "@solana/web3.js";
import { DEFAULT_DECIMALS, PumpFunSDK } from "../../src";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import { AnchorProvider } from "@coral-xyz/anchor";
import {
  getOrCreateKeypair,
  getSPLBalance,
  printSOLBalance,
  printSPLBalance,
} from "../util";
import bs58 from 'bs58'
import * as DBhelpers from './walletdb';
import * as Dbhops from './hopsDb';
import {withdraw} from './bitmart';

import fs from 'fs';
import { bool } from "@coral-xyz/borsh";

const KEYS_FOLDER = __dirname + "/.keys";
const SLIPPAGE_BASIS_POINTS = 100n;
const buy_amount = 2.5; //keep it to 2.5-3 sol per launch 
import {return_fake_metadata} from './fake_meta_maker';
import {main_img_generator} from './img_maker';
import { features } from "process";
import * as path from 'path';
const polo_deposit_address = "";//solana address

const hopsDatabase = new Dbhops.HopsDatabase();//managing the intermidiate wallets
const addressDB = new DBhelpers.AddressDatabase();//managing the past deployer wallets

const connection = new Connection(process.env.HELIUS_RPC_URL || "");
let wallet = new NodeWallet(new Keypair()); //note this is not used
const provider = new AnchorProvider(connection, wallet, {
  commitment: "finalized",
});
let sdk = new PumpFunSDK(provider);

const deploy_and_buy_token = async (token_name:string,token_symbol:string,token_description:string,img_filepath:string,tele:string,x:string,website:string,deployerAccount:Keypair,mint:Keypair) => {
  dotenv.config();

  if (!process.env.HELIUS_RPC_URL) {
    console.error("Please set HELIUS_RPC_URL in .env file");
    console.error(
      "Example: HELIUS_RPC_URL=https://mainnet.helius-rpc.com/?api-key=<your api key>"
    );
    console.error("Get one at: https://www.helius.dev");
    return;
  }

  //const deployerAccount = getOrCreateKeypair(KEYS_FOLDER, "test-account");
  //const mint = Keypair.generate();

  await printSOLBalance(
    connection,
    deployerAccount.publicKey,
    "Deployer Account"
  );

  let globalAccount = await sdk.getGlobalAccount();
  console.log(globalAccount);

  let currentSolBalance = await connection.getBalance(deployerAccount.publicKey);
  if (currentSolBalance == 0) {
    console.log(
      "Please send some SOL to the test-account:",
      deployerAccount.publicKey.toBase58()
    );
    return;
  }
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
        unitLimit: 250000,
        unitPrice: 250000,
      },
    );

    if (createResults.success) {
      console.log("Success:");
    }else{
      console.log(createResults.signature)
    }
  } else {
    console.log("boundingCurveAccount", boundingCurveAccount);
    console.log("Success:", `https://pump.fun/${mint.publicKey.toBase58()}`);
    printSPLBalance(connection, mint.publicKey, deployerAccount.publicKey);
  }

};


//needs a sol transfer function
async function sendSol(amount: number, destinationAddress: string): Promise<string> {
  const LAMPORTS_PER_SOL = 1000000000;

  // Convert SOL amount to lamports
  const adjusted_amount = amount * LAMPORTS_PER_SOL;

  // Connect to cluster
  const connection = new Connection(process.env.HELIUS_RPC_URL || "");

  // Construct a `Keypair` from secret key
  const fromSecretKey = Uint8Array.from(JSON.parse(process.env.DEMO_FROM_SECRET_KEY || "[]"));
  const from = Keypair.fromSecretKey(fromSecretKey);

  // Define the recipient public key
  const toPublicKey = new PublicKey(destinationAddress);

  // Add transfer instruction to transaction
  const transaction = new Transaction().add(
      SystemProgram.transfer({
          fromPubkey: from.publicKey,
          toPubkey: toPublicKey,
          lamports: adjusted_amount, // in lamports
      })
  );

  // Sign transaction, broadcast, and confirm
  const signature = await sendAndConfirmTransaction(
      connection,
      transaction,
      [from]
  );

  return signature;
}

function generateWallet(): { publicKey: string, privateKey: string } {
  // Generate a new wallet keypair
  const keypair = Keypair.generate();

  // Extract the public key and secret key
  const publicKey = keypair.publicKey.toString();
  const privateKey = Buffer.from(keypair.secretKey).toString('hex');

  return { publicKey, privateKey };
}

async function confirmBalance(acc_address:string):Promise<boolean>{
  const connection = new Connection(process.env.HELIUS_RPC_URL || "");
  const address = new PublicKey(acc_address);
  const balance = await connection.getBalance(address);
  if (balance > 0){
      return true;
  }else{
    return false;
  }
}

function save_keys(pub:string,priv:string): boolean {
  const pub_priv = `${pub},${priv}`; 
  fs.writeFile('keydata.txt', pub_priv, (err) => {
    if (err) {
      console.error(err);
      return false;
    } else {
      console.log('Data written to file successfully.');
      return true;
    }
  });
  return false;
}

/*
async function testAddressDatabase() {
    const addressDB = new AddressDatabase();
    
    await addressDB.addAddress('private1', 'public1');
    await addressDB.addAddress('private2', 'public2');
    console.log('All Addresses:', await addressDB.getAllAddresses());

    addressDB.close();
}
*/

/*
(async () => {
    try {
        const amount = 1.5; // Amount of SOL to send
        const destinationAddress = 'DestinationPublicKeyHere';

        const txHash = await sendSol(amount, destinationAddress);
        console.log("Transaction Hash:", txHash);
    } catch (error) {
        console.error("Error sending SOL:", error);
    }
})();
*/

''

interface Wallet {
  publicKey: string;
  keypair: Keypair;
}

async function generateRandomWallet(): Promise<Wallet> {
  const keypair = Keypair.generate();
  const publicKey = keypair.publicKey.toBase58();
  return { publicKey, keypair };
}

async function append_initial_wallet(inital_wallet:Keypair): Promise<Wallet> {
  const keypair = inital_wallet
  const publicKey = inital_wallet.publicKey.toBase58();
  return { publicKey, keypair };
}

async function sol_hops(deployer:Keypair,inital_wallet:Keypair): Promise<void>{ //need retry logi to figure out what went wrong and retry a transaction ( posissibly a function to veryfy a tx is 'convifrmed' )

  //need to fetch balance to determien the amount of sol to transfer
  var fee:number = 10000; //fee cost ( to be played with )
  const connection = new Connection(process.env.HELIUS_RPC_URL || "");

  const finalWallet:Keypair = deployer; //we want the final wallet to be the deployer
  console.log('Final Wallet:', finalWallet.publicKey);

  const hops = 5; // Number of hops
  const wallets: Wallet[] = [];

  const initial = await append_initial_wallet(inital_wallet);
  wallets.push(initial);

  for (let i = 0; i < hops; i++) {
    const wallet = await generateRandomWallet();
    wallets.push(wallet);
  }


  // Transfer through each wallet
  for (let i = 0; i < hops - 1; i++) {
    try{
    const amount = (await connection.getBalance(wallets[i].keypair.publicKey)) - fee; // leave a small balance for fees
    await transferSol(connection, wallets[i].keypair, wallets[i + 1].keypair.publicKey, amount);
    }catch(error){
      console.error('Transfer error in hops occured');
      throw error;
    }
  }

  try {
    // Transfer to the final wallet
    const amount = (await connection.getBalance(wallets[hops - 1].keypair.publicKey)) - fee; // leave a small balance for fees
    await transferSol(connection, wallets[hops - 1].keypair, finalWallet.publicKey, amount);
  }catch(error){
    console.error('Transfer error in hops occured');
    throw error;
  }

  console.log('Hops complete');
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

const sellTokens = async (tempdeployer:Keypair, mint:Keypair) => {
  const currentSPLBalance = await getSPLBalance(
    sdk.connection,
    mint.publicKey,
    tempdeployer.publicKey
  );
  console.log("currentSPLBalance", currentSPLBalance);

  if (currentSPLBalance) {
    const sellResults = await sdk.sell(
      tempdeployer,
      mint.publicKey,
      BigInt(currentSPLBalance * Math.pow(10, DEFAULT_DECIMALS)),
      SLIPPAGE_BASIS_POINTS,
      {
        unitLimit: 2500000,//these values need to be high
        unitPrice: 2500000,
      }
    );

    if (sellResults.success) {
      await printSOLBalance(sdk.connection, tempdeployer.publicKey, "Test Account keypair");
      printSPLBalance(sdk.connection, mint.publicKey, tempdeployer.publicKey, "After SPL sell all");
      console.log("Bonding curve after sell", await sdk.getBondingCurveAccount(mint.publicKey));
    } else {
      console.log("Sell failed");
    }
  }
};


async function main(): Promise<void> {
  const connection = new Connection(process.env.HELIUS_RPC_URL || "");
  let temp_deployer:Keypair;
  let temp_initial:Keypair;
  let temp_token:Keypair; //the new token keypair
  const cex_deposit_addy:string = ""; //to return funds to
  while(true){
    temp_deployer = Keypair.generate();//new temporary deployer
    addressDB.addAddress(temp_deployer.publicKey.toString(), bs58.encode(temp_deployer.secretKey).toString());
    temp_initial = Keypair.generate();//new temporary intitial deposit address (pre-hops)
    addressDB.addAddress(temp_initial.publicKey.toString(), bs58.encode(temp_initial.secretKey).toString());
    //withdrawfromcex(temp_initial);
    var tries = 0;
    while ((await connection.getBalance(temp_initial.publicKey))==0){
      try{
        if (tries > 10){
          //throw error and stop
          throw new Error("An error occurred with the deposit to initial wallet! program halted");
        }
      }catch (error){
        throw error; // Rethrow the error after logging
      }
      tries+=1;
      await sleep(3);
    }
    //IF NO ERRORS THROW WE CAN PROCEDD TO THE HOPS PART
    try{
      await sol_hops(temp_deployer,temp_initial);
    }catch(error){
      throw error;
    }
    //now we have a funded deployer

    //create all the token metdata here:
    const fake_meta = return_fake_metadata();

    var temp_token_name = fake_meta.name;
    var temp_token_ticker = fake_meta.ticker;
    var temp_token_desc = fake_meta.description;

    var temp_token_tele = fake_meta.telegramLink;
    var temp_token_twitter = fake_meta.twitterLink;
    var temp_token_website = fake_meta.websiteLink;

    var keyword_for_img = fake_meta.keyword;

    await main_img_generator(keyword_for_img);
    const counterFilePath = path.join(__dirname, 'counter.json');
    const counterData = JSON.parse(fs.readFileSync(counterFilePath, 'utf-8'));
    const currentNumber = counterData.counter;
    const token_logo_filepath = `example/basic/shitcoin_images/shitcoin_image_${currentNumber}.png`
    temp_token = await Keypair.generate();
    await deploy_and_buy_token(temp_token_name,temp_token_ticker,temp_token_desc,token_logo_filepath,temp_token_tele,temp_token_twitter,temp_token_website,temp_deployer,temp_token);
    await sleep(0.05);
    await sellTokens(temp_deployer,temp_token);

    //still neds to create the logo
    //deploy token
    //sell token
    //check balance and send back to cex


    await sleep(15);
  }
}

main().catch(error => {
  console.error("Error:", error);
  // Handle the unhandled error here
});


main();