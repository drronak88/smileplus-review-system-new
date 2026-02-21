// Load environment variables first
require('dotenv').config();
console.log('🔹 OPENAI_API_KEY:', process.env.OPENAI_API_KEY); // DEBUG: check API key

const express = require('express');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args)); // Fix for node-fetch v3+

const app = express();
app.use(express.json());

// ✅ Serve static files from the "public" folder
app.use(express.static(path.join(__dirname, 'public')));

// ✅ Default route — open qr-landing.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'qr-landing.html'));
});

// ✅ Trust proxy to fix express-rate-limit with Render
app.set('trust proxy', 1);

// Limit requests to avoid spam
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: 'Too many requests, try later.',
});
app.use('/api/', limiter);

// Handle AI review generation
app.post('/api/generate-multiple-reviews', async (req, res) => {
  const { language = 'English' } = req.body;

  console.log('🌐 Incoming request for language:', language);

  try {
    const promptLanguage =
      language === 'Hindi'
        ? 'in Hindi (हिंदी में लिखें)'
        : language === 'Gujarati'
        ? 'in Gujarati (ગુજરાતીમાં લખો)'
        : 'in English';

    const promptPayload = {
     model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content:
            'You are a professional assistant that writes short, 40–50 word patient reviews for Smile Plus Dental Clinic. Always produce authentic-sounding text, avoid revealing private or medical details, and include relevant dental keywords such as: dental, dentist, clinic, hygiene, cleaning, crown, filling, root canal, implant, friendly staff, painless, modern equipment, consultation.',
        },
        {
          role: 'user',
          content: `Write Three different 40–50 word patient reviews for Smile Plus Dental Clinic ${promptLanguage}. Each review should sound polite, natural, and authentic, highlighting friendliness, professionalism, hygiene, and modern facilities. Do not include names or personal details. Output each review separated by two new lines.`,
        },
      ],
      max_tokens: 500,
      temperature: 0.8,
    };

    console.log('🧠 Sending request to OpenAI...');

    const openaiResp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(promptPayload),
    });

    console.log('✅ Response status:', openaiResp.status);

    const data = await openaiResp.json();
    console.log('🔍 OpenAI response body:', data);

    const raw = data?.choices?.[0]?.message?.content || '';
    const reviews = raw.split(/\n\n+/).filter((r) => r.trim().length > 20);

    console.log('✨ Extracted reviews:', reviews.length);
    res.json({ reviews });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'generate_failed' });
  }
});

// Start server on dynamic port (Render sets PORT env variable)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server is running on http://localhost:${PORT}`));
