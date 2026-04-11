// Load environment variables
require('dotenv').config();

const express = require('express');
const rateLimit = require('express-rate-limit');
const path = require('path');

// node-fetch fix for v3+
const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));

const app = express();
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Default route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'qr-landing.html'));
});

// Trust proxy (Render fix)
app.set('trust proxy', 1);

// Rate limiter
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 15,
  message: 'Too many requests, please try again later.',
});
app.use('/api/', limiter);

// 🔥 REVIEW GENERATION API
app.post('/api/generate-multiple-reviews', async (req, res) => {
  try {
    const { language = 'English', treatment = '' } = req.body;

    // 🌐 Language handling
   const promptLanguage =
  language === 'Hindi'
    ? 'in natural, polite Hindi (हिंदी में, सामान्य बोलचाल की भाषा में)'
    : language === 'Gujarati'
    ? 'in natural, polite Gujarati (ગુજરાતીમાં, સરળ અને સ્વાભાવિક ભાષામાં)'
    : 'in natural, conversational English';
    // 🎯 SEO + Treatment keywords
    let treatmentKeyword = '';
    let gujaratiKeyword = '';

    if (treatment === 'Root Canal Treatment') {
      treatmentKeyword = 'best root canal dentist in Anand, painless root canal treatment in Anand';
      gujaratiKeyword = 'આણંદમાં શ્રેષ્ઠ રૂટ કેનલ ડેન્ટિસ્ટ';
    } else if (treatment === 'Dental Implants') {
      treatmentKeyword = 'best dental implant clinic in Anand, affordable dental implants in Anand';
      gujaratiKeyword = 'આણંદમાં શ્રેષ્ઠ ડેન્ટલ ઇમ્પ્લાન્ટ ક્લિનિક';
    } else if (treatment === 'Braces and Aligners') {
      treatmentKeyword = 'best orthodontist in Anand, invisible aligners in Anand';
      gujaratiKeyword = 'આણંદમાં શ્રેષ્ઠ ઓર્થોડોન્ટિસ્ટ';
    } else if (treatment === 'Teeth Cleaning') {
      treatmentKeyword = 'best teeth cleaning in Anand, dental scaling in Anand';
      gujaratiKeyword = 'આણંદમાં દાંત સફાઈ માટે શ્રેષ્ઠ ક્લિનિક';
    } else if (treatment === 'Tooth Removal') {
      treatmentKeyword = 'painless tooth extraction in Anand, wisdom tooth removal in Anand';
      gujaratiKeyword = 'આણંદમાં પેઇનલેસ દાંત કાઢવાની સારવાર';
    } else if (treatment === 'Smile Makeover') {
      treatmentKeyword = 'smile makeover clinic in Anand, cosmetic dentistry in Anand';
      gujaratiKeyword = 'આણંદમાં સ્માઇલ મેકઓવર ક્લિનિક';
    } else {
      treatmentKeyword = 'best dental treatment in Anand, dental clinic in Anand, best dentist in Anand';
      gujaratiKeyword = 'આણંદમાં શ્રેષ્ઠ ડેન્ટલ ક્લિનિક';
    }

    const extraGujarati =
      language === 'Gujarati'
        ? `Also naturally include Gujarati SEO keywords like: ${gujaratiKeyword}`
        : '';

// 🧠 FINAL PROMPT 
messages: [
  {
    role: 'system',
    content: 'You are a friendly AI that writes natural, human-like patient reviews for Smile Plus Dental Clinic. Reviews must sound genuine, conversational, and like real Google reviews. Focus on patient comfort, hygiene, and modern dental care. Never include patient names or fake doctor names.'
  },
  {
    role: 'user',
    content: `Write exactly 3 unique, natural-sounding patient reviews for Smile Plus Dental Clinic ${promptLanguage}.

Each review must:
- Mix format:
   • 1 short review (50-60 words)
   • 2 detailed reviews (80-100 words)
- Sound completely natural and human
- Include a short "before condition" (pain, fear, broken tooth, sensitivity, etc.)
- Clearly mention the treatment: ${treatment || 'dental treatment'}
- Include SEO keywords naturally: ${treatmentKeyword}
- Mention Dr. Ronak Dewani's expertise, calm nature, and friendly behaviour
- Highlight hygiene, modern equipment, and painless experience
- End with a positive, satisfied tone

${extraGujarati}

Additional rules:
- No patient names
- No repetition
- Make all 3 reviews clearly different
- Add 1–2 emojis in ONLY ONE review
- Do NOT use numbering, bullets, or labels

Return exactly 3 reviews separated by two blank lines.
Only return plain review text.`
  }
],

    // 🔗 OpenAI API call
    const openaiResp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You generate high-quality, realistic dental patient reviews.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 600,
        temperature: 0.8,
      }),
    });

    const data = await openaiResp.json();

    // 🧹 Clean response parsing
    let raw = data?.choices?.[0]?.message?.content || '';

   let reviews = raw
  .split(/\n\s*\n/) // split by blank lines
  .map((r) => r.trim())
  .filter((r) => r.length > 40);

// extra safety: remove numbering if AI still adds it
reviews = reviews.map(r => r.replace(/^\d+\.\s*/, ''));

reviews = reviews.slice(0, 3);
    res.json({ reviews });

  } catch (err) {
    console.error('❌ Error:', err);
    res.status(500).json({ error: 'generate_failed' });
  }
});

// 🚀 Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));