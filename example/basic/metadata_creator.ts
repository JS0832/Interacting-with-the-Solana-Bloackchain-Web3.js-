
import {getRandomEmojis} from  './rand_emoji';


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



function getRandomSentences(text: string, numberOfSentences: number): string {
    // Split the text into sentences. This regex assumes sentences end with '.', '!', or '?' followed by a space or the end of the string.
    const sentences = text.match(/[^.!?]*[.!?]/g);

    if (!sentences || sentences.length < numberOfSentences) {
        throw new Error("Not enough sentences in the input text to form the desired number of sentences.");
    }

    // Shuffle the array of sentences
    for (let i = sentences.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [sentences[i], sentences[j]] = [sentences[j], sentences[i]];
    }

    // Take the first 'numberOfSentences' sentences from the shuffled array
    const selectedSentences = sentences.slice(0, numberOfSentences);

    // Join the selected sentences into a single string with spaces between them
    return selectedSentences.join(" "); //emojis not allowed??

}





export function generate_meta() :{ token_name: string, ticker: string,description: string,keyword:string}{
    const substrings = ['LIVE','LIVE','CTO','GME','GME','CTO','kitty','cat','pepe','pepe','meme','book','doge', 'trump', 'billy','cat','dog','cat','elon','neuralink','moon','Biden','Boden','Baby','Baby','dog','cat','dog','cat','dog','cat','sol','pepe'];//can always add more here
    const input_string = 'Meme coins, the wild west of the cryptocurrency world, are like the love children of internet memes and digital cash, as unpredictable as a cat on catnip. Leading the pack or should I say the kennel are the dog-themed tokens Dogecoin DOGE and Shiba Inu SHIB which have gone from being the punchline of a joke to the main act in a circus of crypto chaos. Dogecoin the brainchild of software engineers Billy Markus and Jackson Palmer sprang to life in with a Shiba Inu dog from the Doge meme as its mascot embodying the essence of much wow and very invest. Initially people thought why invest in a joke But then came Elon Musk the self-proclaimed Dogefather tweeting about it like a man possessed and suddenly Dogecoin was mooning faster than a streaker at a football game. Shiba Inu not to be outdone strutted onto the scene in August branding itself as the Dogecoin killer. With its arsenal of tokens like LEASH and BONE and a decentralized exchange called ShibaSwap it aimed to be the Chuck Norris of meme coins. The Shiba Inu community known as the Shib Army rallied around this underdog pun intended driving its value up and causing pandemonium in the crypto sphere. The excitement around these coins is less about their technical prowess and more about the rollercoaster of social media hype where a single tweet can send prices soaring or plummeting faster than you can say blockchain. But why stop at dogs The meme coin zoo soon expanded to include cat-themed tokens like Catcoin CAT which tried to capitalize on our collective obsession with internet felines. Picture this a crypto world where dogs and cats are vying for dominance each coin trying to out-meme the other in a race to the moon. Investing in these coins feels a bit like adopting a pet from a shelter run by internet trolls you never quite know what youre going to get but its sure to be entertaining. Despite the inherent risks and the fact that meme coins often have the stability of a Jenga tower in an earthquake their charm lies in the tantalizing possibility of turning pocket change into a fortune. Critics grumble that meme coins are a mockery of the serious world of cryptocurrencies but enthusiasts argue that they represent the ultimate form of financial freedom a world where anyone with a sense of humor and a bit of luck can strike it rich. As this madcap market evolves the meme coin menagerie will likely continue to defy expectations proving that in the realm of digital finance reality is often stranger and funnier than fiction';
    const maxLength = 12;
    const res = generateRandomWord(substrings, maxLength);
    const ticker = res.randomWord;
    const keyword = res.keywordforimg;
    const description = getRandomSentences(input_string,1)+getRandomEmojis(6);
    const token_name  = ticker;
    return {token_name,ticker,description,keyword};
}


//console.log(generate_meta());

//for now make ticker and name the same
