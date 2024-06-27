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

import * as DBhelpers from './walletdb';
import {withdraw} from './bitmart';

import fs from 'fs';
import { bool } from "@coral-xyz/borsh";

const KEYS_FOLDER = __dirname + "/.keys";
const SLIPPAGE_BASIS_POINTS = 100n;
const buy_amount = 0.001; //keep it to 2.5-3 sol per launch 

const polo_deposit_address = "";//solana address

const addressDB = new DBhelpers.AddressDatabase();

const deploy_and_buy_token = async (token_name:string,token_symbol:string,token_description:string,img_filepath:string) => {
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

  const testAccount = getOrCreateKeypair(KEYS_FOLDER, "test-account");
  const mint = getOrCreateKeypair(KEYS_FOLDER, "mint");

  await printSOLBalance(
    connection,
    testAccount.publicKey,
    "Test Account keypair"
  );

  let sdk = new PumpFunSDK(provider);

  let globalAccount = await sdk.getGlobalAccount();
  console.log(globalAccount);

  let currentSolBalance = await connection.getBalance(testAccount.publicKey);
  if (currentSolBalance == 0) {
    console.log(
      "Please send some SOL to the test-account:",
      testAccount.publicKey.toBase58()
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
    };

    let createResults = await sdk.createAndBuy(
      testAccount,
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
      console.log("Success:", `https://pump.fun/${mint.publicKey.toBase58()}`);
      boundingCurveAccount = await sdk.getBondingCurveAccount(mint.publicKey);
      console.log("Bonding curve after create and buy", boundingCurveAccount);
      printSPLBalance(connection, mint.publicKey, testAccount.publicKey);
    }else{
      console.log(createResults.signature)
    }
  } else {
    console.log("boundingCurveAccount", boundingCurveAccount);
    console.log("Success:", `https://pump.fun/${mint.publicKey.toBase58()}`);
    printSPLBalance(connection, mint.publicKey, testAccount.publicKey);
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


function main(): void {

  while (true){
    //generte and save keypair


  }
  withdrawfromcex("5cTXuW5ghS6a3MNzHHi79yNRVn5jhnB6NYJQre8AsWgo");
  //withdraw funds from poloniex exchange
  //withdraw from wallet back to poloniex 
  //need some timed delay lets do 30 min 
  //deploy_and_buy_token();
}




main();