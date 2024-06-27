'use strict';

import axios from 'axios';
import * as crypto from 'crypto';

const url = 'https://api.poloniex.com';
const apiKey = 'YTTV8E7W-IPWHSMZL-OYGRJ2JV-CV9E28AI';
const secretKey = '5d06ed247fa7d0c321dbe8ea6c7770d3765e47addf56b1ed680ffe779543a5df225c281601e75f6ecff5aafd41cc05cddd276b67c673b61c186586f0ef513fd6';

let timestamp = new Date().getTime();

class ParamUtils {
    values: string[];

    constructor() {
        this.values = [];
    }

    put(k: string, v: string): void {
        let value = encodeURIComponent(v);
        this.values.push(k + '=' + value);
    }

    sortedValues(): string[] {
        return this.values.sort();
    }

    addGetParams(params: Record<string, any>): void {
        Object.keys(params).forEach(k => {
            this.put(k, params[k]);
        });
        this.sortedValues();
    }

    getParams(requestMethod: string, param: Record<string, any>): string {
        if (requestMethod === 'GET') {
            this.put('signTimestamp', timestamp.toString());
            this.addGetParams(param);
            return this.values.join('&').toString();
        } else if (requestMethod === 'POST' || requestMethod === 'PUT' || requestMethod === 'DELETE') {
            return 'requestBody=' + JSON.stringify(param) + '&signTimestamp=' + timestamp;
        }
        return '';
    }
}

class Sign {
    method: string;
    path: string;
    param: Record<string, any>;
    secretKey: string;

    constructor(method: string, path: string, param: Record<string, any>, secretKey: string) {
        this.method = method;
        this.path = path;
        this.param = param;
        this.secretKey = secretKey;
    }

    sign(): string {
        const paramUtils = new ParamUtils();
        let paramValue = paramUtils.getParams(this.method, this.param);
        let payload = this.method.toUpperCase() + '\n' + this.path + '\n' + paramValue;
        console.log('payload:' + payload);

        let hmac = crypto.createHmac('sha256', this.secretKey);
        hmac.update(payload);
        let hmacData = hmac.digest(); // Get raw binary data
        return hmacData.toString('base64'); // Convert binary data to Base64
    }
}

function getHeader(method: string, path: string, param: Record<string, any>) {
    const sign = new Sign(method, path, param, secretKey).sign();
    console.log(`signature:${sign}`);
    return {
        'key': apiKey,
        'signatureMethod': 'HmacSHA256',
        'signatureVersion': '2',
        'signTimestamp': timestamp.toString(),
        'signature': sign.toString(),
        'recvWindow': '5000',
        'Content-Type': 'application/json'
    };
}

function post(url: string, path: string, param: Record<string, any> = {}) {
    const headers = getHeader('POST', path, param);
    return axios.post(url + path, param, { headers: headers })
        .then(res => console.log(res.data))
        .catch(e => console.error(e));
}

const withdrawal_data = {
    'currency': 'SOL', // Corrected currency to a string
    'network': 'SOL',
    'amount': '0.01', // Corrected toString() usage
    'address': 'GtacgBvn3yn5LnfddHgGW4jCGp71tEB3pDKZtRiJ5ZHu' // Address as a string
};

// Place Order
post(url, '/v2/wallets/withdraw', withdrawal_data);
