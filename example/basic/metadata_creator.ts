function getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffleArray<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function getRandomInteger(upperBound: number): number {
    // Check if the upperBound is a positive integer
    let random_val = Math.floor(Math.random() * upperBound);
    while (random_val<3) {
       random_val = Math.floor(Math.random() * upperBound);
    }
    return random_val;
}

function generateRandomWord(substrings: string[], maxLength: number): {randomWord:string,keywordforimg:string} {
    // Shuffle the array of substrings
    const shuffledSubstrings = shuffleArray(substrings);
    // Initialize the random word and its current length
    const final_max_length = getRandomInteger(maxLength);
    let randomWord = '';
    let currentLength = 0;
    let keywordforimg = '';
    // Iterate through the shuffled substrings and add them to the word if they fit within maxLength
    for (let substring of shuffledSubstrings) {
        if (currentLength + substring.length <= final_max_length) {
            randomWord += substring;
            currentLength += substring.length;
            keywordforimg = substring;
        }
        // Stop if the maximum length is reached
        if (currentLength >= final_max_length) {
            break;
        }
    }

    return {randomWord,keywordforimg};
}



function generateLoremIpsum(): string {
    const loremIpsum = "Buckle up for the future of finance with our token! Powered by cutting-edge blockchain technology, it ensures every transaction is secure and hype-worthy, delivering seamless crypto fun. Imagine a token that's not just digital gold but a meme lover's dream—a fixed supply with a secret sauce rocketing its value to the moon! Join our community where token holders aren't spectators but decision-makers, voting on features and events. Forget sluggish banks; our token offers lightning-fast, meme-powered peer-to-peer exchanges worldwide. It's stable, liquid, and meme-friendly, keeping you cool in the wild crypto jungle. Security concerns? Fear not! Guarded by blockchain wizards, our token is fortified for meme-worthy adventures. Unlock the metaverse with apps and services designed for thrilling digital journeys. Compliance isn't just a word; it's our commitment, ensuring your meme adventures are safe and compliant. Speed? It's our middle name! Whether trading, memeing, or reaching for the moon, our token's turbo boost keeps you ahead. Why pay more? Our token cuts out middlemen and fees, letting you meme your way to the moon economically. More memes, less fees—it's a win-win! But that's not all. Our vibrant community thrives on lively discussions and collaborative projects, adding to the excitement. Engage with like-minded enthusiasts who share your passion for pushing the boundaries of digital finance. Embrace the future with our token, where innovation meets fun and reliability in every transaction. Explore new horizons with our evolving ecosystem, constantly expanding with new opportunities and partnerships. Trust in our experienced team of blockchain enthusiasts dedicated to revolutionizing decentralized finance. Join the revolution and experience the thrill of decentralized finance with our token at the forefront. Dive into a world where every transaction is not just a step forward but a leap into a future fueled by community-driven growth and groundbreaking technology. Participate in governance and shape the future of our token ecosystem, ensuring it remains responsive to the needs and aspirations of our global community. Enjoy seamless integration with a diverse range of decentralized applications that enhance your digital experience and empower you to explore new financial frontiers. Experience the power of our tokenomics—a carefully crafted model designed to incentivize participation and reward long-term holders. Benefit from innovative token utilities that go beyond simple transactions, offering unique opportunities for engagement and value creation. Our commitment to transparency and compliance ensures that every aspect of our token's operation is held to the highest standards, providing you with peace of mind as you navigate the world of digital assets. With a relentless focus on user experience, our token platform is designed to be intuitive and user-friendly, whether you're a seasoned crypto investor or just starting your journey. Access comprehensive educational resources and support from our dedicated team to empower you with the knowledge and tools needed to make informed decisions. Join a global network of users who are shaping the future of finance with our token, driving adoption and innovation in the decentralized ecosystem. In a world where innovation never sleeps, our token stands as a beacon of progress and possibility. Join us on this exhilarating journey towards a more inclusive and decentralized financial future. Together, we're redefining the way people transact, invest, and interact with digital assets. Discover the limitless potential of our token and unlock new possibilities for financial freedom and empowerment. The future of finance is here, and it's powered by our token—join us and be part of something extraordinary";
    const sentenceRegex = /[^\r\n.!?]+(?:[.!?]|$)/g;
    // Match all sentences in the text
    const sentences = loremIpsum.match(sentenceRegex);

    // If there are sentences, pick one at random (or the first one)
    if (sentences && sentences.length > 0) {
        const randomIndex = Math.floor(Math.random() * sentences.length);
        return sentences[randomIndex].trim(); // Return the selected sentence
    }

    return ""; // Return null if no sentences found
}



export function generate_meta() :{ token_name: string, ticker: string,description: string,keyword:string}{
    const substrings = ['doge','tate', 'trump', 'billy', 'michi','wif','dog','cat','elon','neuralink','moon','Real','Biden','Gay','lgbt','frens','X','nigger','Nigger','Putin','Jesus','Ansem','Boden','Baby','Baby','Shib','Shiba','BTC','dog','cat','dog','cat','dog','cat','sol'];//can always add more here
    const maxLength = 12;
    const res = generateRandomWord(substrings, maxLength);
    const ticker = res.randomWord;
    const keyword = res.keywordforimg;
    const description = generateLoremIpsum();
    const token_name  = ticker;
    return {token_name,ticker,description,keyword};
}




//for now make ticker and name the same
