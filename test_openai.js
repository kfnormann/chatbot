const axios = require('axios');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

async function testOpenAI() {
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: 'Hello, how are you?' }],
        max_tokens: 50,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        }
      }
    );

    console.log('API is working! Response:', response.data);
  } catch (error) {
    console.error('API test failed:', error.response ? error.response.data : error.message);
  }
}

testOpenAI();
