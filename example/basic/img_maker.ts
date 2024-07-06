

import { ProdiaJobSucceeded, createProdia,ProdiaJobFailed } from "prodia";
import { Prodia } from "prodia.js";
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';

const prodia = createProdia({
	apiKey: "253de4a9-9195-4c0b-a490-5a631f6c0a91",
});


async function generate(input_string:string):Promise<ProdiaJobSucceeded | ProdiaJobFailed>{
	const job = await prodia.generate({
		prompt: input_string,
        aspect_ratio : "square"
	});
	const res = await prodia.wait(job);
  return res;
};

export async function main_img_generator(input_str:string){
  var anwser = await generate(input_str);
  const imageNumber = getNextImageNumber();
  const outputFilePath = path.join('example/basic/shitcoin_images', `shitcoin_image_${imageNumber}.png`);
  if (typeof anwser.imageUrl == 'string'){
    downloadImage(anwser.imageUrl,outputFilePath);
  }
  console.log(anwser.imageUrl);
}


const counterFilePath = path.join(__dirname, 'counter.json');

// Function to get the next image number from the counter file
function getNextImageNumber(): number {
    if (!fs.existsSync(counterFilePath)) {
        fs.writeFileSync(counterFilePath, JSON.stringify({ counter: 0 }));
    }

    const counterData = JSON.parse(fs.readFileSync(counterFilePath, 'utf-8'));
    const nextNumber = counterData.counter + 1;
    counterData.counter = nextNumber;
    fs.writeFileSync(counterFilePath, JSON.stringify(counterData));

    return nextNumber;
}

async function downloadImage(url: string, filePath: string): Promise<void> {
    try {
        const response = await axios({
            url,
            method: 'GET',
            responseType: 'stream',
        });

        const writer = fs.createWriteStream(filePath);

        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });
    } catch (error) {
        console.error(`Error downloading the image: ${error}`);
        throw error;
    }
}

main_img_generator('fast dog');