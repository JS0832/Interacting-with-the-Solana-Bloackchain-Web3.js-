import { Connection, PublicKey, ConfirmedSignaturesForAddress2Options } from '@solana/web3.js';
import dotenv from "dotenv";
dotenv.config();
const connection = new Connection(process.env.HELIUS_RPC_URL || "");

export async function countSPLTokenTransactions(tokenMintAddress: string) {

    // Token Mint Address
    const tokenMint = new PublicKey(tokenMintAddress);

    // Define options for fetching confirmed signatures
    let options: ConfirmedSignaturesForAddress2Options = {
        limit: 1000 // Adjust the limit as necessary
    };

    // This is where we'll store all the signatures
    let allSignatures: string[] = [];

    while (true) {
        // Fetch confirmed signatures for transactions involving the token mint
        const signatures = await connection.getConfirmedSignaturesForAddress2(tokenMint, options);

        // Break the loop if no more signatures are returned
        if (signatures.length === 0) {
            break;
        }

        // Add new signatures to the list
        allSignatures.push(...signatures.map(sigInfo => sigInfo.signature));

        // Update options to fetch the next batch of signatures
        options = {
            ...options,
            before: signatures[signatures.length - 1].signature
        };
    }

    //console.log(`Total number of transactions for token ${tokenMintAddress}: ${allSignatures.length}`);
    return allSignatures.length;
}

