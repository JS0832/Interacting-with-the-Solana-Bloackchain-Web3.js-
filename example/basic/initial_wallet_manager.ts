import { Keypair } from '@solana/web3.js';
import sqlite3 from 'sqlite3';
import fs from 'fs';
import bs58 from 'bs58';
// Define the Wallet interface for better type checking
interface Wallet {
    id: number;
    publicKey: string;
    privateKey: string;
}

// Path to the helper JSON file
const progressFilePath = './initial_wallet_progress.json';

// Function to create the database and table if they don't exist
function createDatabase(): sqlite3.Database {
    const db = new sqlite3.Database('./initial_wallets.db');

    db.serialize(() => {
        db.run(`
            CREATE TABLE IF NOT EXISTS initial_wallets (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                publicKey TEXT NOT NULL,
                privateKey TEXT NOT NULL
            )
        `);
    });

    return db;
}

// Function to generate wallets and store them in the database
function generateAndStoreWallets() {
    const db = createDatabase();

    db.serialize(() => {
        const stmt = db.prepare(`
            INSERT INTO initial_wallets (publicKey, privateKey)
            VALUES (?, ?)
        `);

        for (let i = 0; i < 20; i++) {
            const keypair = Keypair.generate();
            const publicKey = keypair.publicKey.toBase58().toString();
            const privateKey = bs58.encode(keypair.secretKey).toString();

            stmt.run(publicKey, privateKey);

            console.log(`Wallet ${i + 1}:`);
            console.log(`Public Key: ${publicKey}`);
            console.log(`Private Key: ${privateKey}`);
            console.log('------------------------');
        }

        stmt.finalize();
    });

    db.close();
}

// Function to read the wallets from the database and return a list of them
function getWallets(): Promise<Wallet[]> {
    const db = new sqlite3.Database('./initial_wallets.db');

    return new Promise((resolve, reject) => {
        db.all(`SELECT id, publicKey, privateKey FROM initial_wallets`, (err, rows: Wallet[]) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }

            db.close();
        });
    });
}

// Function to get the next wallet and update the progress file
export async function getNextWallet(): Promise<Wallet | null> {
    const wallets = await getWallets();
    let nextWalletIndex = 0;

    // Check if progress file exists
    if (fs.existsSync(progressFilePath)) {
        const progressData = JSON.parse(fs.readFileSync(progressFilePath, 'utf-8'));
        nextWalletIndex = progressData.nextWalletIndex || 0;
    }

    // Check if there are more wallets to read
    if (nextWalletIndex >= wallets.length) {
        return null; // No more wallets
    }

    const nextWallet = wallets[nextWalletIndex];

    // Update the progress file
    fs.writeFileSync(progressFilePath, JSON.stringify({ nextWalletIndex: nextWalletIndex + 1 }, null, 2));

    return nextWallet;
}



//getNextWallet();

generateAndStoreWallets();