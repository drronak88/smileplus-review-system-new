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
    ? 'in natural, polite Hindi (हिंदी में, सरल और स्वाभाविक अंदाज़ में लिखें जैसे मरीज असल में बोलते हैं)'
    : language === 'Gujarati'
    ? 'in natural, polite Gujarati (ગુજરાતીમાં, સહજ અને સ્વાભાવિક ભાષામાં લખો જેમ દર્દી સાચા અનુભવ શેર કરે છે)'
    : 'in English';


    // 🌍 Step 2 — Multilingual SEO keyword set
    let seoKeywords = `
    “best dental clinic in Anand”, “painless root canal”, “tooth-colored filling”, “dental implant”, “smile designing”
    `;
// 💬 Step — Add multilingual tone and emotion based on treatment (with emojis)
let toneHint = '';
let emojiHint = '';

const toneMap = {
  English: {
    'Dental Implants': {
      tone: 'Use a confident, happy tone showing restored smile and chewing comfort.',
      emoji: '😄'
    },
    'Root Canal Treatment': {
      tone: 'Use a relieved and grateful tone, mentioning painless experience and comfort.',
      emoji: '😊'
    },
    'Braces and Aligners': {
      tone: 'Use a cheerful, motivated tone about improved smile alignment and self-confidence.',
      emoji: '😁'
    },
    'Smile Makeover': {
      tone: 'Use an emotional and joyful tone showing pride in new smile and confidence.',
      emoji: '✨'
    },
    'General Dentistry': {
      tone: 'Use a calm, satisfied tone about regular checkups and preventive care.',
      emoji: '😊'
    },
    'Teeth Cleaning': {
      tone: 'Use a fresh, light tone describing clean feeling and hygiene.',
      emoji: '🪥'
    },
    'Tooth Removal': {
      tone: 'Use a relieved and comfortable tone about painless extraction and recovery.',
      emoji: '😅'
    },
    'Wisdom Tooth Surgery': {
      tone: 'Use a brave yet relaxed tone, mentioning expert handling and quick recovery.',
      emoji: '💪'
    }
  },
  Hindi: {
    'Dental Implants': { tone: 'एक आत्मविश्वासपूर्ण और खुशहाल लहजा रखें जो नए मुस्कान और आराम को दर्शाए।', emoji: '😄' },
    'Root Canal Treatment': { tone: 'एक राहत भरा और आभारी लहजा रखें, जिसमें बिना दर्द के अनुभव और आराम का उल्लेख हो।', emoji: '😊' },
    'Braces and Aligners': { tone: 'एक उत्साहित लहजा रखें, जिसमें बेहतर मुस्कान और आत्मविश्वास की भावना झलके।', emoji: '😁' },
    'Smile Makeover': { tone: 'एक भावनात्मक और खुश लहजा रखें, जिसमें नई मुस्कान और आत्मविश्वास की खुशी झलके।', emoji: '✨' },
    'General Dentistry': { tone: 'एक शांत और संतुष्ट लहजा रखें, जिसमें नियमित जांच और देखभाल का जिक्र हो।', emoji: '😊' },
    'Teeth Cleaning': { tone: 'एक हल्का और ताज़गी भरा लहजा रखें, जिसमें साफ़ दाँतों और स्वच्छता का उल्लेख हो।', emoji: '🪥' },
    'Tooth Removal': { tone: 'एक राहत भरा लहजा रखें, जिसमें दर्द-रहित अनुभव और तेजी से रिकवरी का जिक्र हो।', emoji: '😅' },
    'Wisdom Tooth Surgery': { tone: 'एक बहादुर लेकिन सहज लहजा रखें, जिसमें विशेषज्ञ देखभाल और तेज़ रिकवरी का उल्लेख हो।', emoji: '💪' }
  },
  Gujarati: {
    'Dental Implants': { tone: 'એક આત્મવિશ્વાસપૂર્ણ અને આનંદિત સ્વર રાખો જે નવી સ્મિત અને આરામ દર્શાવે.', emoji: '😄' },
    'Root Canal Treatment': { tone: 'રાહતભર્યો અને આભારી સ્વર રાખો, જે પેઇનલેસ અનુભવ અને આરામ પર ભાર આપે.', emoji: '😌' },
    'Braces and Aligners': { tone: 'ઉત્સાહપૂર્ણ સ્વર રાખો, જેમાં સુધારેલી સ્મિત અને આત્મવિશ્વાસની લાગણી દર્શાય.', emoji: '😁' },
    'Smile Makeover': { tone: 'ભાવનાત્મક અને ખુશ સ્વર રાખો, જે નવી સ્મિત અને આત્મવિશ્વાસની ખુશી દર્શાવે.', emoji: '✨' },
    'General Dentistry': { tone: 'શાંત અને સંતોષકારક સ્વર રાખો, જેમાં નિયમિત તપાસ અને કાળજીનો ઉલ્લેખ હોય.', emoji: '😊' },
    'Teeth Cleaning': { tone: 'હળવો અને તાજગીભર્યો સ્વર રાખો, જે સ્વચ્છતા અને તાજા દાંતની લાગણી આપે.', emoji: '🪥' },
    'Tooth Removal': { tone: 'રાહતભર્યો સ્વર રાખો, જે પેઇનલેસ એક્સટ્રેક્શન અને ઝડપી સાજા થવાની વાત કરે.', emoji: '😅' },
    'Wisdom Tooth Surgery': { tone: 'ધીરજપૂર્વકનો પરંતુ આરામદાયક સ્વર રાખો, જે નિષ્ણાત સંભાળ અને ઝડપી રિકવરી દર્શાવે.', emoji: '💪' }
  }
};

// ✅ Apply tone + emoji
if (toneMap[language]?.[treatment]) {
  toneHint = toneMap[language][treatment].tone;
  emojiHint = toneMap[language][treatment].emoji;
} else {
  toneHint = 'Use a friendly and natural tone focused on dental care quality.';
  emojiHint = '😊';
}


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
            'You are a friendly and natural-sounding AI that writes 80–100 word patient reviews for Smile Plus Dental Clinic. Each review must sound authentic, polite, and specific. Mention professionalism, hygiene, modern dental care, and patient comfort. Avoid using patient names or fake doctor names. Keep tone conversational and realistic like genuine Google reviews.'
        },
        {
          role: 'user',
          content: `Write five unique, SEO-friendly 80–100 word reviews for Smile Plus Dental Clinic ${promptLanguage}.
Each review should:
- Specifically mention the treatment: "${treatment}" as if the patient personally received it.
- Sound like a real patient sharing a positive experience related to that treatment.
- Naturally include 1–2 of these search-friendly phrases: ${seoKeywords}.
- Highlight friendliness of the staff, hygiene, and modern facilities.
- Mention Dr. Ronak Dewani’s friendly nature, expertise, and professional care during the ${treatment}.
- ${toneHint}- Include one relevant emoji like ${emojiHint} at the end of each review naturally.
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
