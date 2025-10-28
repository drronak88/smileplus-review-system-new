const express = require('express');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(express.json());

// ✅ Trust proxy (important for Render hosting)
app.set('trust proxy', 1);

// ✅ Check if OpenAI API key is loaded
console.log("🔑 Loaded OPENAI_API_KEY:", process.env.OPENAI_API_KEY ? "✅ Loaded" : "❌ Missing");

// ✅ Serve static frontend files (e.g., your QR landing page)
app.use(express.static(path.join(__dirname, 'public')));

// ✅ Default route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'qr-landing.html'));
});

// ✅ Apply rate limiter
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  message: 'Too many requests, try again later.'
});
app.use('/api/', limiter);

// ✅ API Endpoint: Generate multiple reviews
app.post('/api/generate-multiple-reviews', async (req, res) => {
  const { language = 'English', treatment = 'General Dentistry' } = req.body;
  console.log("🌐 Incoming request for:", language, "Treatment:", treatment);

  try {
    // 🔤 Step 1 — Set prompt language
    const promptLanguage =
      language === 'Hindi'
        ? 'in Hindi (हिंदी में लिखें)'
        : language === 'Gujarati'
        ? 'in Gujarati (ગુજરાતીમાં લખો)'
        : 'in English';

    // 🌍 Step 2 — Multilingual SEO keyword set
    let seoKeywords = `
    “best dental clinic in Anand”, “painless root canal”, “tooth-colored filling”, “dental implant”, “smile designing”
    `;

    if (language === 'Hindi') {
      seoKeywords = `“आनंद का बेस्ट डेंटल क्लिनिक”, “पेनलेस रूट कैनाल”, “डेंटल इम्प्लांट”, “स्माइल डिजाइनिंग”`;
    } else if (language === 'Gujarati') {
      seoKeywords = `“આનંદમાં શ્રેષ્ઠ ડેન્ટલ ક્લિનિક”, “પેઇનલેસ રૂટ કેનાલ”, “ડેન્ટલ ઇમ્પ્લાન્ટ”, “સ્માઇલ ડિઝાઇનિંગ”`;
    }

    // 🤖 Step 3 — Prompt Payload
    const promptPayload = {
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a friendly and natural-sounding AI that writes 50–80 word patient reviews for Smile Plus Dental Clinic. Each review must sound authentic, polite, and specific. Mention professionalism, hygiene, modern dental care, and patient comfort. Avoid using patient names or fake doctor names. Keep tone conversational and realistic like genuine Google reviews.'
        },
        {
          role: 'user',
          content: `Write five unique, SEO-friendly 50–80 word reviews for Smile Plus Dental Clinic ${promptLanguage}.
Each review should:
- Sound like a real patient sharing a positive experience.
- Naturally include 1–2 of these search-friendly phrases: ${seoKeywords}.
- Highlight friendliness of the staff, hygiene, and modern facilities.
- Mention Dr. Ronak Dewani’s friendly nature, expertise, and professional care.
Make each review distinct in tone, vocabulary, and structure.
Separate each review with two new lines.`
        }
      ],
      max_tokens: 650,
      temperature: 0.85
    };

    console.log("🧠 Sending request to OpenAI...");

    // 🧩 Step 4 — Send request to OpenAI
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

    // 🪄 Step 5 — Extract and clean reviews
    const raw = responseBody?.choices?.[0]?.message?.content || '';
    const reviews = raw.split(/\n\n+/).filter(r => r.trim().length > 10);

    console.log(`✨ Extracted ${reviews.length} reviews`);
    res.json({ reviews });

  } catch (err) {
    console.error("❌ Error generating reviews:", err);
    res.status(500).json({ error: 'generate_failed' });
  }
});

// ✅ Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
