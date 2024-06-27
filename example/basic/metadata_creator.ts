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

function generateRandomWord(substrings: string[], maxLength: number): string {
    // Shuffle the array of substrings
    const shuffledSubstrings = shuffleArray(substrings);

    // Initialize the random word and its current length
    let randomWord = '';
    let currentLength = 0;

    // Iterate through the shuffled substrings and add them to the word if they fit within maxLength
    for (let substring of shuffledSubstrings) {
        if (currentLength + substring.length <= maxLength) {
            randomWord += substring;
            currentLength += substring.length;
        }
        // Stop if the maximum length is reached
        if (currentLength >= maxLength) {
            break;
        }
    }

    return randomWord;
}



function generateLoremIpsum(length: number): string {
    const loremIpsum = `
    In the ever-evolving landscape of digital finance, cryptocurrency has emerged as a groundbreaking innovation that challenges traditional financial systems and promises a decentralized future. Cryptocurrencies are digital or virtual currencies that use cryptography for security and operate independently of a central authority, such as a government or financial institution. Bitcoin, the first and most well-known cryptocurrency, introduced the concept of a decentralized digital currency and paved the way for thousands of alternative cryptocurrencies that followed suit.
Cryptocurrencies gained popularity for several reasons. First and foremost, they offer the potential for financial inclusion by providing access to financial services for people who are unbanked or underbanked, especially in developing countries. Cryptocurrencies also facilitate faster and cheaper cross-border transactions compared to traditional banking systems, which can be slow and costly due to intermediaries and currency exchange fees.
Moreover, cryptocurrencies are based on blockchain technology, a distributed ledger that records all transactions across a network of computers. Blockchain technology ensures transparency, immutability, and security, as each transaction is verified and recorded by multiple nodes in the network. This eliminates the need for trust in a central authority and reduces the risk of fraud or manipulation.
Within the realm of cryptocurrencies, utility tokens are a category of digital assets that have a specific use within a blockchain platform or ecosystem. They can represent digital access rights, ownership stakes, or the ability to participate in decentralized applications (dApps) and protocols. Interestingly, hypothetical utility tokens named after popular animals like dogs and cats can help illustrate their functionality.
Why Dogs and Cats Make Ideal Utility Tokens
Imagine a blockchain platform dedicated to pet care services and products. In this ecosystem, "Dog" tokens and "Cat" tokens could serve as utility tokens with distinct functionalities.
Dog Tokens: These tokens could be used to access and pay for dog-related services within the platform. For example, dog grooming services, veterinary consultations, or even dog food purchases could all be facilitated using Dog tokens. This utility enhances the usability and demand for Dog tokens within the ecosystem, driving their value.
Cat Tokens: Similarly, Cat tokens could serve as the currency for cat owners to purchase cat-related products and services. This could include cat toys, litter boxes, or even virtual cat adoption services within the blockchain platform. Cat tokens would thus cater specifically to the needs of cat enthusiasts, fostering a community and enhancing their utility.
Advantages of Dogs and Cats as Utility Tokens
Utility tokens like Dog and Cat tokens offer several advantages.
Specific Use Cases: They cater to specific user needs within a dedicated ecosystem, providing clear utility and value.
Community Building: By aligning with popular interests (like pets), these tokens can foster strong communities of users and enthusiasts.
Tokenomics: The demand for utility tokens is driven by their utility within the platform, creating a natural market for their circulation and value appreciation.
Decentralization: Transactions involving Dog and Cat tokens would be decentralized and transparent, leveraging blockchain technology to ensure security and trust.
Cryptocurrencies and utility tokens like Dog and Cat tokens represent a significant advancement in digital finance and decentralized ecosystems. By leveraging blockchain technology and catering to specific user needs, these tokens can revolutionize industries ranging from finance to entertainment to pet care. As the crypto space continues to evolve, the potential for innovative utility tokens remains vast, promising a future where digital assets cater to diverse interests and communities worldwide.`;
    
    // Remove whitespace from the predefined Lorem Ipsum text
    const loremIpsumNoWhitespace = loremIpsum.replace(/\s+/g, ' ').trim();

    // Calculate the maximum starting index to ensure the generated text fits within the available text length
    const maxStartIndex = loremIpsumNoWhitespace.length - length;

    // Generate a random starting index
    const startIndex = Math.floor(Math.random() * maxStartIndex);

    // Extract the substring starting from the randomly chosen index
    const randomLoremIpsum = loremIpsumNoWhitespace.substring(startIndex, startIndex + length);

    return randomLoremIpsum;
}

// Example usage:
const max_length = 350; // Specify the desired length here
const loremIpsumText = generateLoremIpsum(max_length);
console.log(loremIpsumText);


// Example usage
const substrings = ['tate', 'trump', 'billy', 'michi','wif','dog','cat','elon','neuralink'];//can always add more here
const maxLength = 12;
const randomWord = generateRandomWord(substrings, maxLength);
console.log(randomWord);



//for now make ticker and name the same
