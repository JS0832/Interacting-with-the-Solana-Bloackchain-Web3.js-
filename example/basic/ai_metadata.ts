import nlp from 'compromise';
import { uniqueNamesGenerator, adjectives, colors, animals,Config} from 'unique-names-generator';
//crypto nouns 

const crypto_nouns = ['Trump','cat','dog','doge','pepe','kitty','doggo']//add more as needed
// colours and adjectives will be generate using the libabry 

function getRandomElement<T>(arr: T[]): T {
  const randomIndex = Math.floor(Math.random() * arr.length);
  return arr[randomIndex];
}

function generate_adjective(){
  const config: Config = {
    dictionaries: [adjectives],
    separator: ' '
  };
  const output: string = uniqueNamesGenerator(config);
  return output;
}

// Function to categorize a keyword
function categorizeKeyword(keyword: string): string | null {
    // Use compromise to parse the keyword
    const parsed = nlp(keyword);

    // Get the POS tags for each word in the keyword
    const tags = parsed.out('tags');
    
    console.log(tags);
    // Determine the type based on the first tag found
    for (const tag of tags) {
        var elements_arr = tag[`${keyword}`];
        console.log(elements_arr);
        if (elements_arr.includes('Noun')) {
            return 'Noun';
        } else if (elements_arr.includes('Verb')) {
            return 'Verb';
        } else if (elements_arr.includes('Adjective')) {
            return 'Adjective';
        }
    }

    return null; // Unknown category
}


export function generate_name_ticker(keyword:string): {coinName:string,ticker:string} | null{
  //determine the strings type.
  const category = categorizeKeyword(keyword.toLowerCase());
  var coinName = '';
  var ticker = '';
  if (category == 'Noun'){
    var adj = generate_adjective();
    coinName = `${adj} ${keyword}`;
    ticker = (adj.charAt(0)+keyword).toUpperCase();
    return {coinName,ticker};
  }else if(category == 'Adjective' ){
    var special_noun = getRandomElement(crypto_nouns);
    coinName = `${keyword} ${special_noun}`;
    ticker = (keyword.charAt(0)+special_noun).toUpperCase();
    return {coinName,ticker};
  }
  return null;
}

console.log(generate_name_ticker('MOM'));