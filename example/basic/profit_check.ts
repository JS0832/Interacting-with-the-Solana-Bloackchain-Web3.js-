//check the profit 

import axios from 'axios';


const mc_nomrlaisation_constant = 27.96;
async function getCoinData(mintStr: string): Promise<any | null> {
    const url = `https://frontend-api.pump.fun/coins/${mintStr}`;

    const headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:126.0) Gecko/20100101 Firefox/126.0",
        "Accept": "*/*",
        "Accept-Language": "en-US,en;q=0.5",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-site",
        "If-None-Match": 'W/"41b-5sP6oeDs1tG//az0nj9tRYbL22A"',
        "Priority": "u=4"
    };

    try {
        const response = await axios.get(url, { headers });

        if (response.status === 200) {
            return response.data;
        } else {
            return null;
        }
    } catch (error) {
        return null;
    };
};


async function printCoinData(mintStr: string): Promise<void> {
    const data = await getCoinData(mintStr);
    
    if (data) {
        console.log("Coin Data:");
        console.log(data);
    } else {
        console.log(`Failed to fetch data for mintStr: ${mintStr}`);
    }
}

export async function determine_profit(buyAmount:number,token_mint:string){
    var effectiveInitialMc = mc_nomrlaisation_constant+buyAmount;
    const data = await getCoinData(token_mint);
    var current_mc = parseFloat(data['market_cap']);
    var percentageChange = current_mc/effectiveInitialMc;
    var profit = (buyAmount*percentageChange)-buyAmount;
    console.log(profit);
    return profit;
}


