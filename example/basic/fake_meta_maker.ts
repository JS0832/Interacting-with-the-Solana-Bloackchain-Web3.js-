import * as metamaker from './metadata_creator'

function generateFakeLinks(token_name: string): { telegramLink: string, websiteLink: string, twitterLink: string } {
    // Generate random parts for links
    const randomId = Math.floor(Math.random() * 1000000); // Random ID for Telegram group
    const randomDomain = 'example.com'; // Random domain for website
    const randomTwitterHandle = 'fake_twitter'; // Random Twitter handle

    const tele_ending_array = ['_ENTRY','SOL','SOLANA','Sol','_ON_SOL']
    const website_ending_array = ['.com','SOL.xyz','SOLANA.fun','Sol.xyz','_ON_SOL.com']
    const twitter_ending_array = ['SOL','SOLANA','Sol','_ON_SOL']
    // Construct fake links
    const  telegramLink:string = `https://t.me/${token_name}${pickRandomItem(tele_ending_array)}`;
    const websiteLink:string = `https://${token_name}${pickRandomItem(website_ending_array)}`;
    const twitterLink:string = `https://twitter.com/${token_name}${pickRandomItem(twitter_ending_array)}`;

    return { telegramLink, websiteLink, twitterLink };
}

function pickRandomItem<T>(items: T[]): T | undefined {
    if (items.length === 0) {
        return undefined; // Return undefined if the array is empty
    }
    const randomIndex = Math.floor(Math.random() * items.length);
    return items[randomIndex];
}

interface Metadata {
    name: string;
    ticker: string;
    description:string;
    telegramLink: string;
    websiteLink: string;
    twitterLink: string;
    keyword:string;
}


export function return_fake_metadata(): Metadata {
    const temp_meta = metamaker.generate_meta()
    const name = temp_meta.token_name;
    const ticker = name;
    const description = temp_meta.description;
    const keyword = temp_meta.keyword;
    const links = generateFakeLinks(name);
    return {name,ticker,description,keyword,telegramLink:links.telegramLink, websiteLink: links.websiteLink,twitterLink: links.twitterLink}; // I have a problem it says "," expected i dont know why
}



console.log(return_fake_metadata());
