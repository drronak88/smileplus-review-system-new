const express = require('express');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.static('public'));

// ✅ API
app.post('/generate', async (req, res) => {
  try {
    console.log("👉 Request received:", req.body);

    const { treatment, language } = req.body;

// 🌐 Language
const promptLanguage =
  language === 'Hindi'
    ? 'in natural, polite Hindi'
    : language === 'Gujarati'
    ? 'in natural, natural Gujarati'
    : 'in English';

// 🔑 SEO Keywords
let treatmentKeyword = 'best dentist in Anand, dental clinic in Anand';

if (treatment === 'Root Canal Treatment') {
  treatmentKeyword += ', best root canal dentist in Anand, painless root canal';
} else if (treatment === 'Dental Implants') {
  treatmentKeyword += ', best dental implant clinic in Anand';
} else if (treatment === 'Teeth Cleaning') {
  treatmentKeyword += ', dental cleaning in Anand, scaling treatment';
}

// 🟡 Gujarati SEO
let extraGujarati = '';
if (language === 'Gujarati') {
  extraGujarati = `
Also include Gujarati SEO keywords like:
“આણંદમાં શ્રેષ્ઠ ડેન્ટલ ક્લિનિક”, “પેઇનલેસ રૂટ કેનાલ”, “ડેન્ટલ ઇમ્પ્લાન્ટ”
`;
}

// 🧠 FINAL PROMPT
const prompt = `
Write exactly 3 high-quality patient reviews for Smile Plus Dental Clinic ${promptLanguage}.

🎯 Objective:
These reviews should feel 100% real and emotionally convincing so that other patients trust the clinic and feel confident visiting.

Each review must:

🟢 Structure:
- 1 short review (60–80 words)
- 2 detailed reviews (80–100 words)

🟢 Content:
- Start with a relatable "before condition" (pain, fear, hesitation, broken tooth, bad past experience)
- Clearly mention the treatment: ${treatment || 'dental treatment'}
- Describe the experience step-by-step (consultation → treatment → result)
- Highlight:
  • Dr. Ronak Dewani’s calm nature, expertise, and friendly behavior  
  • Cleanliness and hygiene  
  • Modern equipment and painless treatment  
  • Staff behaviour and friendliness
  • affordabable treatment charges 


- End with strong satisfaction and recommendation

🟢 SEO Optimization:
- Naturally include keywords:
  ${treatmentKeyword}
- Make them flow naturally (NOT forced)

${extraGujarati}

🟢 Human Psychology:
- Make each review feel like written by a different person
- Use slightly different tone in each (one emotional, one practical, one simple)
- Add 1–2 emojis in ONLY ONE review

🟢 Rules:
- No patient names
- No repetition
- No numbering or bullet points
- No robotic language
- Keep it natural and believable

Return ONLY 3 reviews separated by two blank lines.
`;    // ✅ USING NATIVE FETCH (NO node-fetch)
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'user', content: prompt }
    ],
    max_tokens: 700,
    temperature: 0.85
  })
});
    const data = await response.json();
    console.log("👉 OpenAI response:", data);

    if (!data.choices) {
      return res.status(500).json({ error: 'AI failed', details: data });
    }

    const text = data.choices[0].message.content;

    res.json({ reviews: text });

  } catch (err) {
    console.error("❌ Server Error:", err);
    res.status(500).json({ error: 'Server crashed' });
  }
});

// ✅ START SERVER
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("🚀 Server running on port " + PORT));