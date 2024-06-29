import fetch from 'node-fetch';
import fs from 'fs'

const saveFiles = async () => {
  const url = 'https://source.unsplash.com/random/200x200';

  for (let i = 0; i < 100; ++i) {
    const response = await fetch(url);
    const buffer = await response.buffer();
    const filePath = `example/basic/shitcoin_img/image-${i}.jpg`;

    fs.writeFile(filePath, buffer, (err) => {
      if (err) {
        throw err;
      }
      console.log(`File saved: image-${i}.jpg`);
    });
    await new Promise(r => setTimeout(r, 2000));
  }//C:\Users\jakub\Desktop\PUMPFUN_JEET_BOT\example\basic\shitcoin_img
  //example\basic\shitcoin_img
};

saveFiles();