import axios from 'axios';
import crypto from 'crypto';

// Function to generate the HMAC-SHA256 signature
function generateSignature(secretKey: string, method: string, path: string, timestamp: number, body: string): string {
  const requestString = `${method}\n${path}\n${body}&signTimestamp=${timestamp}`;
  console.log('Request String:', requestString); // Log the request string for debugging
  const hmac = crypto.createHmac('sha256', secretKey);
  hmac.update(requestString);
  const rawSignature = hmac.digest(); // Get raw binary data
  console.log('Raw Signature (binary):', rawSignature);
  const base64Signature = rawSignature.toString('base64'); // Encode to base64
  console.log('Base64 Signature:', base64Signature);
  return base64Signature;
}

// Function to withdraw Solana
async function withdrawSolana(apiKey: string, secretKey: string, amount: number, address: string) {
  const method = 'POST';
  const path = '/wallets/withdraw';
  const url = `https://api.poloniex.com/wallets/withdraw'`;
  const timestamp = Date.now();

  const bodyObject = {
    currency: 'SOL', // Corrected currency to a string
    amount: amount.toString(), // Corrected toString() usage
    address: address // Address as a string
  };

  const body = JSON.stringify(bodyObject);

  const signature = generateSignature(secretKey, method, path, timestamp, body);

  const headers = {
    'key': apiKey,
    'signatureMethod': 'HmacSHA256',
    'signatureVersion': '2',
    'signTimestamp': timestamp.toString(),
    'signature': signature,
    'recvWindow' : '5000',
    'Content-Type': 'application/json'
  };

  console.log('Headers:', headers); // Log headers for debugging
  console.log('Request Body:', body); // Log request body for debugging

  try {
    const response = await axios.post(url, body, { headers });
    console.log('Response:', response.data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // Server responded with a status code outside the 2xx range
        console.error('Error Status:', error.response.status);
        console.error('Error Data:', error.response.data);
      } else if (error.request) {
        // No response received from server
        console.error('No response received:', error.request);
      } else {
        // Error setting up the request
        console.error('Request error:', error.message);
      }
    } else {
      // Non-Axios error
      console.error('Unexpected error:', error);
    }
  }
}

// Example usage
const apiKey = 'YTTV8E7W-IPWHSMZL-OYGRJ2JV-CV9E28AI';
const secretKey = '5d06ed247fa7d0c321dbe8ea6c7770d3765e47addf56b1ed680ffe779543a5df225c281601e75f6ecff5aafd41cc05cddd276b67c673b61c186586f0ef513fd6';
const amount = 0.005; // Amount of SOL to withdraw
const address = 'FgeSGFFuASnBpMmeToo9ZovaQpQbbrSkzYabJXzXEpqq';

withdrawSolana(apiKey, secretKey, amount, address);

