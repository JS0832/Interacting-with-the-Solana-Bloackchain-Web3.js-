import { Connection, PublicKey, ConfirmedSignaturesForAddress2Options } from '@solana/web3.js';
import dotenv from "dotenv";
dotenv.config();

const connection = new Connection(process.env.HELIUS_RPC_URL || "");

export async function countSPLTokenTransactions(tokenMintAddress: string, lastCheckedSignature?: string) {
    // Token Mint Address
    const tokenMint = new PublicKey(tokenMintAddress);

    // Define options for fetching confirmed signatures
    let options: ConfirmedSignaturesForAddress2Options = {
        limit: 1000 // Adjust the limit as necessary
    };

    // If there is a valid last checked signature, set it in the options
    if (lastCheckedSignature && lastCheckedSignature.trim() !== "") {
        options.before = lastCheckedSignature;
    }

    // This is where we'll store all the signatures
    let allSignatures: string[] = [];

    try {
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
            options.before = signatures[signatures.length - 1].signature;
        }
    } catch (error) {
        if (error instanceof TypeError && error.message.includes("fetch failed")) {
            console.error("Fetch failed while retrieving signatures:", error);
            // Handle the error, for example, by returning a partial result or rethrowing the error
            throw new Error("Failed to fetch signatures from the Solana network.");
        } else {
            // Rethrow other unexpected errors
            throw error;
        }
    }

    // If no new signatures are found, use the original lastCheckedSignature, otherwise use the latest found
    const latestSignature = allSignatures.length > 0 ? allSignatures[0] : (lastCheckedSignature || "");

    // Return the count of new transactions and the latest checked signature
    const sig_amount = allSignatures.length;
    return { sig_amount, latestSignature };
}

