import Table from 'cli-table3';

// Define the columns
const table = new Table({
    head: ['Ca', 'Ticker', 'Name', 'SN'],
    colWidths: [50, 30, 30, 10]
});



// Function to add a new item to the table
export function addItem(ca: string, name: string, ticker: string, sn: number){
    table.push([ca, name, ticker, sn]);
}

export function printtable(){
    //console.clear();
    console.log(table.toString());
};


