import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

const openaiApiKey = "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";

if (!openaiApiKey) {
  throw new Error('Missing OpenAI API key. Please set it in the .env file.');
}

const generateDescription = async (keyword: string): Promise<string> => {
  const prompt = `Generate a very short paragraph for the following keyword: ${keyword}`;

  const response = await axios.post(
    'https://api.openai.com/v1/engines/davinci-codex/completions',
    {
      prompt,
      max_tokens: 100,
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`,
      },
    }
  );

  const description = response.data.choices[0].text.trim();
  return description;
};

// Example usage
const keyword = 'tatewif';
generateDescription(keyword)
  .then(description => {
    console.log(`Description for "${keyword}": ${description}`);
  })
  .catch(error => {
    console.error('Error generating description:', error);
  });
