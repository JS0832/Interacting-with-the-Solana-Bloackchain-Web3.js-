import { Connection,Keypair,ConfirmOptions} from '@solana/web3.js';
import { PumpFunSDK, CreateTokenMetadata } from './src';
import { AnchorProvider,Wallet } from '@project-serum/anchor';
import bs58 from './bs58';

export function getKeyPairFromPrivateKey(key: string) {
    return Keypair.fromSecretKey(
        new Uint8Array(bs58.decode(key)
    ));
}

const connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');

const keypair = getKeyPairFromPrivateKey("g3ZDeLvSpwcwL75g6QsBnmDm3N6KJqN9uHVNDpjvorMcGMiYPPkjuG3gWiWzCAAde63jRAz5HwzL96BfZcQwkiF")
const wallet = new Wallet(keypair);
const options: ConfirmOptions = {
    preflightCommitment: 'confirmed',
    commitment: 'confirmed',
};



const provider = new AnchorProvider(connection, wallet,options);

const creator = Keypair.generate();
const mint = Keypair.generate();
const createTokenMetadata: CreateTokenMetadata = {
  name: "MyToken",
  symbol: "MTK",
  description: "My awesome token",
  filePath: "./path/to/token/image.png",
  twitter: "@mytoken",
  telegram: "@mytokentelegram",
  website: "https://mytokenwebsite.com"
};


const buyAmountSol = BigInt(10000); // 1 SOL in lamports

const pumpFunSDK = new PumpFunSDK(provider);

(async () => {
  const result = await pumpFunSDK.createAndBuy(creator, mint, createTokenMetadata, buyAmountSol);
  console.log(result);
})();