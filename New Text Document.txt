const express = require('express');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(express.json());

// ✅ Trust proxy for Render hosting
app.set('trust proxy', 1);

// ✅ Debug log for API key check
console.log("🔑 Loaded OPENAI_API_KEY:", process.env.OPENAI_API_KEY ? "✅ Loaded" : "❌ Missing");

// ✅ Serve static files (frontend)
app.use(express.static(path.join(__dirname, 'public')));

// ✅ Default route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'qr-landing.html'));
});

// ✅ Rate limiter
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: 'Too many requests, try again later.'
});
app.use('/api/', limiter);

// ✅ API endpoint for generating reviews
app.post('/api/generate-multiple-reviews', async (req, res) => {
  const { language = 'English', treatment = 'General Dentistry' } = req.body;
  console.log("🌐 Incoming request for:", language, "Treatment:", treatment);

  try {
    const promptLanguage =
      language === 'Hindi'
        ? 'in Hindi (हिंदी में लिखें)'
        : language === 'Gujarati'
        ? 'in Gujarati (ગુજરાતીમાં લખો)'
        : 'in English';

    const promptPayload = {
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a friendly AI that writes natural, 50–80 word patient reviews for Smile Plus Dental Clinic. Each review should sound real, polite, and mention professionalism, hygiene, and modern care. Never include patient names or fake doctor names.'
        },
        {
          role: 'user',
          content: `Write five unique, natural-sounding 50-80 word reviews for Smile Plus Dental Clinic ${promptLanguage}, specifically about ${treatment}. Highlight friendliness, modern facilities, hygiene, and painless experience. Each review must sound genuine and human-like include Dr.Ronak Dewani's behaviour,expertice and experience. Separate reviews with two new lines.`
        }
      ],
      max_tokens: 700,
      temperature: 0.8
    };

    console.log("🧠 Sending request to OpenAI...");

    const openaiResp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(promptPayload)
    });

    console.log("✅ Response status:", openaiResp.status);
    const responseBody = await openaiResp.json();
    console.log("🔍 OpenAI response body:", JSON.stringify(responseBody, null, 2));

    const raw = responseBody?.choices?.[0]?.message?.content || '';
    const reviews = raw.split(/\n\n+/).filter(r => r.trim().length > 10);

    console.log(`✨ Extracted ${reviews.length} reviews`);
    res.json({ reviews });
  } catch (err) {
    console.error("❌ Error generating reviews:", err);
    res.status(500).json({ error: 'generate_failed' });
  }
});

// ✅ Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`✅ Server running on http://localhost:${PORT}`)
);
