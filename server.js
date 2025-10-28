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
// 💬 Step — Add multilingual tone and emotion based on treatment
let toneHint = '';

switch (treatment) {
  case 'Dental Implants':
    toneHint = 'Use a confident, happy tone showing restored smile and chewing comfort.';
    break;
  case 'Root Canal Treatment':
    toneHint = 'Use a relieved and grateful tone, mentioning painless experience and comfort.';
    break;
  case 'Braces and Aligners':
    toneHint = 'Use a cheerful, motivated tone about improved smile alignment and self-confidence.';
    break;
  case 'Smile Makeover':
    toneHint = 'Use an excited, emotional tone showing joy of transformation and newfound confidence.';
    break;
  case 'General Dentistry':
    toneHint = 'Use a calm, satisfied tone about regular checkups and preventive care.';
    break;
  case 'Teeth Cleaning':
    toneHint = 'Use a fresh, light tone describing clean feeling and professional hygiene.';
    break;
  case 'Tooth Removal':
    toneHint = 'Use a relieved and comfortable tone about painless extraction and recovery.';
    break;
  case 'Wisdom Tooth Surgery':
    toneHint = 'Use a brave yet relaxed tone, mentioning expert handling and quick recovery.';
    break;
 Hindi: {
    'Dental Implants': 'एक आत्मविश्वासपूर्ण और खुशहाल लहजा रखें जो नए मुस्कान और चबाने में आराम को दर्शाए।',
    'Root Canal Treatment': 'एक राहत भरा और आभारी लहजा रखें, जिसमें बिना दर्द के अनुभव और आराम का उल्लेख हो।',
    'Braces and Aligners': 'एक उत्साहित लहजा रखें, जिसमें बेहतर मुस्कान और आत्मविश्वास की भावना झलके।',
    'Smile Makeover': 'एक भावनात्मक और खुश लहजा रखें, जिसमें नई मुस्कान और आत्मविश्वास की खुशी झलके।',
    'General Dentistry': 'एक शांत और संतुष्ट लहजा रखें, जिसमें नियमित जांच और देखभाल का जिक्र हो।',
    'Teeth Cleaning': 'एक हल्का और ताज़गी भरा लहजा रखें, जिसमें साफ़ दाँतों और स्वच्छता का उल्लेख हो।',
    'Tooth Removal': 'एक राहत भरा लहजा रखें, जिसमें दर्द-रहित अनुभव और तेजी से रिकवरी का जिक्र हो।',
    'Wisdom Tooth Surgery': 'एक बहादुर लेकिन सहज लहजा रखें, जिसमें विशेषज्ञ देखभाल और तेज़ रिकवरी का उल्लेख हो।'
  },
  Gujarati: {
    'Dental Implants': 'એક આત્મવિશ્વાસપૂર્ણ અને આનંદિત સ્વર રાખો જે નવી સ્મિત અને આરામદાયક ચાવવાની લાગણી દર્શાવે.',
    'Root Canal Treatment': 'રાહતભર્યો અને આભારી સ્વર રાખો, જે પેઇનલેસ અનુભવ અને આરામ પર ભાર આપે.',
    'Braces and Aligners': 'ઉત્સાહપૂર્ણ સ્વર રાખો, જેમાં સુધારેલી સ્મિત અને આત્મવિશ્વાસની લાગણી દર્શાય.',
    'Smile Makeover': 'ભાવનાત્મક અને ખુશ સ્વર રાખો, જે નવી સ્મિત અને આત્મવિશ્વાસની ખુશી દર્શાવે.',
    'General Dentistry': 'શાંત અને સંતોષકારક સ્વર રાખો, જેમાં નિયમિત તપાસ અને કાળજીનો ઉલ્લેખ હોય.',
    'Teeth Cleaning': 'હળવો અને તાજગીભર્યો સ્વર રાખો, જે સ્વચ્છતા અને તાજા દાંતની લાગણી આપે.',
    'Tooth Removal': 'રાહતભર્યો સ્વર રાખો, જે પેઇનલેસ એક્સટ્રેક્શન અને ઝડપી સાજા થવાની વાત કરે.',
    'Wisdom Tooth Surgery': 'ધીરજપૂર્વકનો પરંતુ આરામદાયક સ્વર રાખો, જે નિષ્ણાત સંભાળ અને ઝડપી રિકવરી દર્શાવે.'
  }
};
  // ✅ Select tone based on current language and treatment
toneHint = toneMap[language]?.[treatment] || 'Use a friendly and natural tone focused on dental care quality.';


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
- ${toneHint}
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
