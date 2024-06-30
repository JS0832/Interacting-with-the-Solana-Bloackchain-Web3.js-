import axios from 'axios';
import crypto from 'crypto';

const API_KEY = '33ef259cb780ff7de29b5d15d2ae5e11a31b3f38';
const API_SECRET = '71aba9668eb5d615a97358534dadbbd2b888487d73884370452ddc374532ef6b';
const API_MEMO = 'incel';

const BASE_URL = 'https://api-cloud.bitmart.com';

// Get current timestamp
function get_timestamp(): string {
    return new Date().getTime().toString();
}

// Generate signature
function generate_signature(timestamp: string, body: string): string {
    const message = `${timestamp}#${API_MEMO}#${body}`;
    return crypto.createHmac('sha256', API_SECRET).update(message).digest('hex');
}


export async function withdraw(target:string,amount:string): Promise<void> {
    const path = '/account/v1/withdraw/apply';
    const timestamp = get_timestamp();
    const body = {
        currency: "SOL",
        amount: amount,
        destination: "To Digital Address",
        address: target,
        address_memo: ""
    };
    const headers = {
        'Content-Type': 'application/json',
        'X-BM-KEY': API_KEY,
        'X-BM-TIMESTAMP': timestamp,
        'X-BM-SIGN': generate_signature(timestamp, JSON.stringify(body)),
    };
    const url = BASE_URL + path;
    try {
        const response = await axios.post(url, body, { headers });
        console.log(response.data);
    } catch (error: any) {
        console.error(`Error:`);
        console.error(error.response?.data);
    }
}

//withdraw("5xmfNjWrWRUJfHwASYEbw3yARxvbyaWrY27W7gHyh9gK","0.5");
