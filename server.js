const express = require('express');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(express.json());

app.set('trust proxy', 1);

console.log("🔑 Loaded OPENAI_API_KEY:", process.env.OPENAI_API_KEY ? "✅ Loaded" : "❌ Missing");

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'qr-landing.html'));
});

const limiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: 'Too many requests, try again later.'
});
app.use('/api/', limiter);

app.post('/api/generate-multiple-reviews', async (req, res) => {
  const { language = 'English', treatment = 'Dental Treatment' } = req.body;
  console.log("🌐 Incoming request for:", language, "Treatment:", treatment);

  try {
    const promptLanguage =
      language === 'Hindi'
        ? 'in natural, polite Hindi'
        : language === 'Gujarati'
        ? 'in natural, polite Gujarati'
        : 'in English';

    let seoKeywords = `
      “best dental clinic in Anand”, “painless root canal”, “best dentist in town”, “dental implant”, “smile designing”, "best dentist"
    `;

    if (language === 'Hindi') {
      seoKeywords = `“आनंद का बेस्ट डेंटल क्लिनिक”, “पेनलेस रूट कैनाल”, “डेंटल इम्प्लांट”, “स्माइल डिजाइनिंग”`;
    } else if (language === 'Gujarati') {
      seoKeywords = `“આનંદમાં શ્રેષ્ઠ ડેન્ટલ ક્લિનિક”, “પેઇનલેસ રૂટ કેનાલ”, “બેસ્ટ ડેન્ટલ ઇમ્પ્લાન્ટ ક્લિનિક ”, “સ્માઇલ ડિઝાઇનિંગ”,“બેસ્ટ ડેન્ટિસ્ટ”`;
    }

    const promptPayload = {
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You write 80–100 word patient reviews for Smile Plus Dental Clinic. Reviews must sound natural, genuine, and like real Google reviews. Mention hygiene, staff friendliness, and patient comfort.'
        },
        {
          role: 'user',
          content: `Write five unique, SEO-friendly 80–100 word reviews for Smile Plus Dental Clinic ${promptLanguage}.
✅ Must mention the treatment: "${treatment}" as if the patient experienced it.
✅ Mention the trouble patient is going through before the dental treatment.
✅ Focus on real feelings, comfort, hygiene, friendliness, and modern dental care.
✅ Include 1–2 SEO phrases naturally: ${seoKeywords}
✅ Mention Dr. Ronak Dewani's polite nature, expertise, and professional approach.
✅ IMPORTANT: Use an emoji in ONLY ONE of the five reviews. Other 4 should have NO emoji.
✅ Separate each review with two blank lines.`
        }
      ],
      max_tokens: 650,
      temperature: 0.75
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
    const raw = responseBody?.choices?.[0]?.message?.content || '';
    const reviews = raw.split(/\n\n+/).filter(r => r.trim().length > 10);

    console.log(`✨ Extracted ${reviews.length} reviews`);
    res.json({ reviews });

  } catch (err) {
    console.error("❌ Error generating reviews:", err);
    res.status(500).json({ error: 'generate_failed' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
