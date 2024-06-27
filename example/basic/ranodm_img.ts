import fs from 'fs';
import PNG from 'pngjs/browser/png';

// Define constants for image size
const IMAGE_WIDTH = 100;
const IMAGE_HEIGHT = 100;

// Function to generate a random color in RGB format
function getRandomColor(): number[] {
    return [
        Math.floor(Math.random() * 256), // Red
        Math.floor(Math.random() * 256), // Green
        Math.floor(Math.random() * 256)  // Blue
    ];
}

// Function to create a random image data
function createRandomImageData(): number[] {
    const data = [];
    for (let y = 0; y < IMAGE_HEIGHT; y++) {
        for (let x = 0; x < IMAGE_WIDTH; x++) {
            const color = getRandomColor();
            data.push(color[0], color[1], color[2], 255); // RGBA format (255 for alpha)
        }
    }
    return data;
}

// Function to save the image as a PNG file
function saveRandomImage(): void {
    const png = new PNG({
        width: IMAGE_WIDTH,
        height: IMAGE_HEIGHT,
        colorType: 6 // RGBA
    });

    const data = createRandomImageData();
    png.data = Buffer.from(data);

    const output = fs.createWriteStream(__dirname + '/random_image.png');
    png.pack().pipe(output);

    output.on('finish', () => {
        console.log('The PNG file was created.');
    });
}

// Run the function to save the random image
saveRandomImage();
