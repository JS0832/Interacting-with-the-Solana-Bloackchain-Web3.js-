import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';

const TARGET_SUFFIX = 'pump';

function isValidKeypair(publicKey: string, suffix: string): boolean {
  return publicKey.endsWith(suffix);
}

async function generateVanityKeypair(suffix: string): Promise<Keypair> {
  let keypair: Keypair;
  let publicKey: string;

  do {
    keypair = Keypair.generate();
    publicKey = bs58.encode(keypair.publicKey.toBuffer());
  } while (!isValidKeypair(publicKey, suffix));

  return keypair;
}

(async () => {
  console.log(`Searching for a keypair ending with '${TARGET_SUFFIX}'...`);
  const keypair = await generateVanityKeypair(TARGET_SUFFIX);
  console.log('Vanity Keypair found:');
  console.log('Public Key:', bs58.encode(keypair.publicKey.toBuffer()));
  console.log('Secret Key:', bs58.encode(keypair.secretKey));
})();
