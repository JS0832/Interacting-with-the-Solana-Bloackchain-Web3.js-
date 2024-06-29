import sqlite3 from 'sqlite3';

export interface Address {
    privateAddress: string;
    publicAddress: string;
}

export class HopsDatabase {
    private dbhops: sqlite3.Database;

    constructor() {
        this.dbhops = new sqlite3.Database('hops-database.dbhops'); // Using file-based database
        this.createTable(); // Create the addresses table on initialization
    }

    private createTable(): void {
        const sql = `
            CREATE TABLE IF NOT EXISTS hopsaddresses (
                privateAddress TEXT PRIMARY KEY,
                publicAddress TEXT
            )
        `;
        this.dbhops.run(sql);
    }

    addAddress(privateAddress: string, publicAddress: string): void {
        const sql = 'INSERT INTO hopsaddresses (privateAddress, publicAddress) VALUES (?, ?)';
        this.dbhops.run(sql, [privateAddress, publicAddress], err => {
            if (err) {
                console.error('Error adding address:', err.message);
            } else {
                console.log('Address added successfully');
            }
        });
    }


    getAllAddresses(): Promise<Address[]> {
        const sql = 'SELECT * FROM hopsaddresses';
        return new Promise((resolve, reject) => {
            this.dbhops.all(sql, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows as Address[]);
                }
            });
        });
    }

    close(): void {
        this.dbhops.close();
    }
}