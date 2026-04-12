const express = require('express');
const response = await fetch('https://api.openai.com/v1/chat/completions', {require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.static('public'));

app.post('/generate', async (req, res) => {
  try {
    const { treatment, language } = req.body;

    if (!process.env.OPENAI_API_KEY) {
      console.error("❌ Missing OpenAI API Key");
      return res.status(500).json({ error: "API key not configured" });
    }

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
            'You are a friendly AI that writes natural, human-like patient reviews for Smile Plus Dental Clinic. Reviews must sound genuine, conversational, and like real Google reviews.'
        },
        {
          role: 'user',
          content: `Write exactly 3 unique patient reviews for Smile Plus Dental Clinic ${promptLanguage}.

Each review must:
- Mention treatment: ${treatment || 'dental treatment'}
- Include keywords: ${treatmentKeyword}
- Mention Dr. Ronak Dewani
- Highlight hygiene and painless treatment
- Sound natural and human

${extraGujarati}

Return exactly 3 reviews separated by two blank lines.
Only return plain text.`
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

    console.log("📦 OpenAI Response:", JSON.stringify(data, null, 2));

    // ❌ HANDLE API ERROR PROPERLY
    if (!data || data.error) {
      console.error("❌ OpenAI API Error:", data.error);
      return res.status(500).json({
        error: data.error?.message || "OpenAI API failed"
      });
    }

    if (!data.choices || !data.choices[0]) {
      console.error("❌ Invalid OpenAI response structure");
      return res.status(500).json({ error: "Invalid response from OpenAI" });
    }

    let reviewsText = data.choices[0].message.content || "";

    // 🧼 Clean formatting
    reviewsText = reviewsText
      .replace(/^\d+\.\s*/gm, '')
      .trim();

    if (!reviewsText) {
      return res.status(500).json({ error: "Empty response from AI" });
    }

    res.json({ reviews: reviewsText });

  } catch (error) {
    console.error('❌ Server Error:', error);
    res.status(500).json({ error: 'Server crashed' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});