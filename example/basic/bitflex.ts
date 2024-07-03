

import axios from 'axios';
import * as crypto from 'crypto-js';

const API_KEY = 'MZoa0xDT8lwyenrT2L99FzSeGSWFQvQHAbeKGP34bwk3UmFZar1JRqm18CxIOySO';
const API_SECRET = 'QBiKnqt6RCaF0DQju2TQSk3R41KAZUv7CG3WV8c22rlROOtTWyjTDG8L5IoEc6KP';

function createSignature(secret: string, message: string): string {
    return crypto.HmacSHA256(message, secret).toString(crypto.enc.Hex);
}

async function withdrawSol(fromAccount: string, amount: number, address: string) {
    const endpoint = "https://api.bitflex.com/openapi/v1/withdraw";
    const timestamp = Date.now();
    const params = {
        chainType : 'SOL',
        address: address,
        tokenId: 'SOL',
        amount: amount,
        timestamp: timestamp
    };

    const queryString = Object.keys(params)
        .sort()
        .map(key => `${key}=${params[key]}`)
        .join('&');
    const signature = createSignature(API_SECRET, queryString);
    const headers = {
        'X-BF-APIKEY': API_KEY,
        'X-BF-SIGNATURE': signature,
        'Content-Type': 'application/x-www-form-urlencoded'
    };

    try {
        const response = await axios.post(endpoint, null, { headers, params });
        console.log(response.data);
    } catch (error) {
        console.error('Error making withdrawal request:', error);
    }
}

// Example usage
const amount = 1.0;  // Amount of SOL to withdraw
const solanaAddress = 'D3icYLKDKRZTJeCoCSi28Ae5TNZRTdRzcnGxn4bMhwx9';

withdrawSol( amount, solanaAddress);
