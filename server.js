const express = require('express');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.static('public'));

app.post('/generate', async (req, res) => {
  try {
    const { treatment, language } = req.body;

    // 🌐 Language handling
    const promptLanguage =
      language === 'Hindi'
        ? 'in natural, polite Hindi'
        : language === 'Gujarati'
        ? 'in natural, polite Gujarati'
        : 'in English';

    // 🔑 SEO Keywords
    let treatmentKeyword =
      'best dental clinic in Anand, painless dental treatment, smile designing, dental implant, tooth colored filling';

    if (treatment && treatment.toLowerCase().includes('root')) {
      treatmentKeyword += ', best root canal dentist in Anand, painless root canal';
    }

    if (treatment && treatment.toLowerCase().includes('implant')) {
      treatmentKeyword += ', best dental implant clinic in Anand';
    }

    // 🟡 Gujarati SEO
    let extraGujarati = '';
    if (language === 'Gujarati') {
      extraGujarati = `
Also include Gujarati SEO keywords naturally like:
“આનંદમાં શ્રેષ્ઠ ડેન્ટલ ક્લિનિક”, “પેઇનલેસ રૂટ કેનાલ”, “ડેન્ટલ ઇમ્પ્લાન્ટ”, “સ્માઇલ ડિઝાઇનિંગ”
`;
    }

    // 🧠 FINAL PROMPT
    const promptPayload = {
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a friendly AI that writes natural, human-like patient reviews for Smile Plus Dental Clinic. Reviews must sound genuine, conversational, and like real Google reviews. Focus on comfort, hygiene, and modern dental care. Never include patient names.'
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

    const data = await openaiResp.json();

    let reviewsText = data.choices[0].message.content;

    // 🧼 REMOVE numbering if any (extra safety)
    reviewsText = reviewsText.replace(/^\d+\.\s*/gm, '');

    res.json({ reviews: reviewsText });

  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});