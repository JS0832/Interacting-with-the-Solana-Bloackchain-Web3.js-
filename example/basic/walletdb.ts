import sqlite3 from 'sqlite3';

export interface Address {
    privateAddress: string;
    publicAddress: string;
}

export class AddressDatabase {
    private db: sqlite3.Database;

    constructor() {
        this.db = new sqlite3.Database('address-database.db'); // Using file-based database
        this.createTable(); // Create the addresses table on initialization
    }

    private createTable(): void {
        const sql = `
            CREATE TABLE IF NOT EXISTS addresses (
                privateAddress TEXT PRIMARY KEY,
                publicAddress TEXT
            )
        `;
        this.db.run(sql);
    }

    addAddress(privateAddress: string, publicAddress: string): void {
        const sql = 'INSERT INTO addresses (privateAddress, publicAddress) VALUES (?, ?)';
        this.db.run(sql, [privateAddress, publicAddress], err => {
            if (err) {
                console.error('Error adding address:', err.message);
            } else {
                console.log('Address added successfully');
            }
        });
    }


    getAllAddresses(): Promise<Address[]> {
        const sql = 'SELECT * FROM addresses';
        return new Promise((resolve, reject) => {
            this.db.all(sql, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows as Address[]);
                }
            });
        });
    }

    close(): void {
        this.db.close();
    }
}


