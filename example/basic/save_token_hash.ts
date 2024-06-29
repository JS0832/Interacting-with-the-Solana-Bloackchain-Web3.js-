import sqlite3 from 'sqlite3';

// Define the database file
const DB_FILE = 'data.db';

// Initialize SQLite database
const db = new sqlite3.Database(DB_FILE, (err) => {
  if (err) {
    console.error('Error opening database ' + DB_FILE + ': ' + err.message);
  } else {
    console.log('Connected to the SQLite database ' + DB_FILE);
    db.run(`CREATE TABLE IF NOT EXISTS strings (id INTEGER PRIMARY KEY AUTOINCREMENT, value TEXT)`);
  }
});

// Function to insert a string value into the database
export const insertString = (value: string) => {
  const sql = `INSERT INTO strings (value) VALUES (?)`;
  db.run(sql, [value], function(err) {
    if (err) {
      return console.error('Error inserting value:', err.message);
    }
    console.log(`Inserted row with id ${this.lastID}`);
  });
};

// Function to retrieve all string values from the database
export const getAllStrings = () => {
  const sql = `SELECT value FROM strings`;
  return new Promise<string[]>((resolve, reject) => {
    db.all(sql, [], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        const values = rows.map(rowas => row.value);
        resolve(values);
      }
    });
  });
};

// Close the database connection when the Node.js process exits
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log('Closed the SQLite database connection.');
    process.exit(0);
  });
});
