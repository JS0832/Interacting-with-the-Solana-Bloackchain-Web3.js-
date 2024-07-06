import { uniqueNamesGenerator, adjectives, colors, animals,Config} from 'unique-names-generator';
const config: Config = {
  dictionaries: [adjectives],
  separator: ' '
};

const output: string = uniqueNamesGenerator(config); // stable-crimson-porpoise


console.log(output);