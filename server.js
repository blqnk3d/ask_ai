
const express = require('express');
const puppeteer = require('puppeteer');
const app = express();

app.use(express.json());

async function askAI(question, headless = true) {
  const browser = await puppeteer.launch({
headless,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36');

  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
  });

  console.log('🌐 Gehe zur Seite...');
  await page.goto('https://duckduckgo.com/?q=DuckDuckGo+AI+Chat&ia=chat&duckai=1', { waitUntil: 'networkidle2' });

  const clickButtonByText = async (text) => {
    console.log(`🔎 Suche Button: "${text}"`);
    const button = await page.evaluateHandle((t) => {
      return Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === t);
    }, text);
    const el = button.asElement();
    if (el) {
      console.log(`✅ Button "${text}" gefunden, klicke...`);
      await el.click();
    } else {
      console.warn(`⚠️ Button "${text}" nicht gefunden!`);
    }
  };

  await clickButtonByText('Ausprobieren');
  await clickButtonByText('Ich stimme zu');

  console.log('⌨️ Warte auf Textarea und tippe Frage:');
  await page.waitForSelector('textarea');
  console.log('✍️ Frage:', question);
  await page.type('textarea', question);

  console.log('⏳ Warte 500ms vor dem Absenden...');
  await new Promise(resolve => setTimeout(resolve, 500));

  console.log('📨 Frage absenden (Enter drücken)...');
  await page.keyboard.press('Enter');

  let response = 'Keine Antwort gefunden.';
  try {
    console.log('⏳ Warte auf Antwort (max 30 Sekunden)...');
    await page.waitForFunction(() => {
      const el = document.querySelector('[data-activeresponse="true"]');
      return el && el.innerText.trim().length > 0;
    }, { timeout: 30000 });

    response = await page.evaluate(() => {
      const el = document.querySelector('[data-activeresponse="true"]');
      return el ? el.innerText.trim() : 'Keine Antwort.';
    });
    console.log('✅ Antwort erhalten!');
  } catch (err) {
    console.warn('⚠️ Timeout oder Fehler beim Warten auf Antwort:', err.message);
  }

  await browser.close();

  console.log('📤 Antwort wird zurückgegeben.');
  return response;
}

// POST /ask { question: "..." }
app.post('/ask', async (req, res) => {
  const { question, headless = true } = req.body;
  if (!question || question.length > 500) {
    return res.status(400).json({ error: 'Missing or invalid question' });
  }

  try {
    const answer = await askAI(question, headless);
    res.json({ question, answer });
  } catch (err) {
    console.error('❌ Fehler im askAI:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /ask?question=...
app.get('/ask', async (req, res) => {
  const question = req.query.question || 'Was ist die Hauptstadt von Österreich?';

  try {
    const answer = await askAI(question);
    res.json({ question, answer });
  } catch (err) {
    console.error('❌ Fehler im askAI:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/', (_, res) => {
  res.send('👋 Puppeteer AI API läuft! Nutze /ask?question=DeineFrage');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server listening on port ${PORT}`));
