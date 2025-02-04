const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');


dotenv.config();

const app = express();
//const port = 3000;

// Middleware to serve static files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to parse JSON bodies
app.use(express.json());

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Function to handle OpenAI requests with retries
const MAX_RETRIES = 3;
async function getOpenAIResponse(message, retries = 0) {
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions', // Correct endpoint
      {
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: message }],
        max_tokens: 250,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
      }
    );
    return response.data.choices[0].message.content;
  } catch (error) {
    if (error.response && error.response.status === 429) {
      // Rate limit error: retry after waiting a bit
      if (retries < MAX_RETRIES) {
        const retryAfter = error.response.headers['retry-after'] || 1; // Retry after the time specified in the header (default to 1 second)
        console.log(`Rate limit reached. Retrying in ${retryAfter} seconds...`);
        sleep.sleep(retryAfter); // Wait for retryAfter seconds
        return await getOpenAIResponse(message, retries + 1);
      } else {
        throw new Error('Max retries reached. Please try again later.');
      }
    }
    throw error; // Re-throw if it's another type of error
  }
}

// Route for interacting with ChatGPT
app.post('/chat', async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).send('Message is required');
  }

  try {
    const chatResponse = await getOpenAIResponse(message);
    res.json({ reply: chatResponse });
  } catch (error) {
    console.error('Error contacting OpenAI API:', error);
    res.status(500).send(error.message || 'Internal server error');
  }
});

// Start server
//app.listen(port, () => {
//  console.log(`Server running on http://localhost:${port}`);
});
