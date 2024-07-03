import * as Dbhops from './hopsDb';
import { Connection, Keypair, LAMPORTS_PER_SOL,PublicKey,SystemProgram,Transaction,sendAndConfirmTransaction} from "@solana/web3.js";
import dotenv from "dotenv";
import bs58 from 'bs58';
const hopsDatabase = new Dbhops.HopsDatabase();//managing the intermidiate wallets
dotenv.config();
if (!process.env.HELIUS_RPC_URL) {
  console.error("Please set HELIUS_RPC_URL in .env file");
  console.error(
    "Example: HELIUS_RPC_URL=https://mainnet.helius-rpc.com/?api-key=<your api key>"
  );
  console.error("Get one at: https://www.helius.dev");
}
const connection = new Connection(process.env.HELIUS_RPC_URL || "");
function createKeypairFromString(privateKeyString: string): Keypair {

    // Decode the base58 strings to Uint8Array
    const privateKeyBytes = bs58.decode(privateKeyString);
  
    // Combine the private and public key bytes into one Uint8Array
    const keypairBytes = new Uint8Array([...privateKeyBytes]);
  
    // Create and return the Keypair object
    return Keypair.fromSecretKey(keypairBytes);
  }

async function sendSol(amount: number, destinationAddress: string,priv_key : string): Promise<string> {
    const LAMPORTS_PER_SOL = 1000000000;
    var fee = 0.0005;
    // Convert SOL amount to lamports
    const adjusted_amount = Math.floor((amount-fee) * LAMPORTS_PER_SOL);
  

  
    const from = createKeypairFromString(priv_key);
  
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



async function main() {
    const allwallets = await hopsDatabase.getAllAddresses();
    var total = 0;
    for (let item of allwallets) {
        var priv_key = item.publicAddress;
        var pub_key = item.privateAddress;//i mixed them up its ok
        var bal  = await connection.getBalance(new PublicKey(pub_key));
        bal = bal/LAMPORTS_PER_SOL;
        if (bal > 0.001){
            await sendSol(bal,"D3icYLKDKRZTJeCoCSi28Ae5TNZRTdRzcnGxn4bMhwx9",priv_key);
            total+=bal;
        }
        console.log(priv_key,bal);
    }
    console.log(total);
  }
  
  // Execute the main function
  main().catch(console.error);