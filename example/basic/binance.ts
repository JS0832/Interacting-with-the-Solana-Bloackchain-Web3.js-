import axios from 'axios';
import crypto from 'crypto';

interface WithdrawParams {
  address: string;
  amount: string;
}

// Encapsulate sensitive information within closure or module
const withdrawParams: WithdrawParams & {
  apiKey: string;
  secretKey: string;
  coin: string;
  network: string;
} = {
  apiKey: 'GmBs9dg9YvsOb836ImTKqOyd7z7qBKPb4oVn76fGlqsl0I99R0LsbC5zIr4MY3Xs',
  secretKey: 'iqUqhISKEvWwTWlI0LWDqOIF0RO9dd2PqjUJ6T2mWGp1FNiH5slB6g3EjW3hc6r6',
  coin: 'SOL',
  network: 'SOL',
  address: '',
  amount: '',
};

export async function withdrawFromBinance(address: string, amount: string): Promise<any> {
  try {
    withdrawParams.address = address;
    withdrawParams.amount = amount;

    const apiUrl = 'https://api.binance.com';
    const timestamp = Date.now();

    const queryString = `coin=${withdrawParams.coin}&network=${withdrawParams.network}&address=${address}&amount=${amount}&timestamp=${timestamp}`;

    const signature = crypto
      .createHmac('sha256', withdrawParams.secretKey)
      .update(queryString)
      .digest('hex');

    const payload = `${queryString}&signature=${signature}`;

    const response = await axios.post(`${apiUrl}/sapi/v1/capital/withdraw/apply`, payload, {
      headers: {
        'X-MBX-APIKEY': withdrawParams.apiKey,
        'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
      },
    });

    return response.data;
  } catch (error: any) { // Explicitly type error as 'any'
    throw error.response ? error.response.data : error.message;
  }
}
