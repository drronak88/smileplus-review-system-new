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

    const prompt = `Write 3 simple, natural patient reviews for a dental clinic.
Treatment: ${treatment}
Language: ${language}
Each review should be 50-70 words.
Do NOT use numbering.
Separate each review with a blank line.`;

    // ✅ USING NATIVE FETCH (NO node-fetch)
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 300
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