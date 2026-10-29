const puppeteer = require('puppeteer');
const path = require('path');
const FILE = 'file://' + path.resolve(__dirname, '..', 'index.html');
const OUT = path.resolve(__dirname, '..', 'scratch-shots');
const fs = require('fs');
fs.mkdirSync(OUT, { recursive: true });

(async () => {
  const b = await puppeteer.launch({
    headless: 'new',
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    args: ['--no-sandbox'],
  });
  const p = await b.newPage();
  await p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1.5 });
  await p.goto(FILE, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1600)); // fonts + intro anim

  await p.screenshot({ path: path.join(OUT, 'land-hero.png') });

  // scroll to load the scale (signature)
  await p.evaluate(() => window.scrollTo(0, window.innerHeight * 0.75));
  await new Promise(r => setTimeout(r, 500));
  await p.screenshot({ path: path.join(OUT, 'land-hero-loaded.png') });

  // features
  await p.evaluate(() => document.getElementById('features').scrollIntoView());
  await new Promise(r => setTimeout(r, 700));
  await p.screenshot({ path: path.join(OUT, 'land-features.png') });

  // showcase
  await p.evaluate(() => document.querySelector('.showcase').scrollIntoView());
  await new Promise(r => setTimeout(r, 700));
  await p.screenshot({ path: path.join(OUT, 'land-showcase.png') });

  // pricing
  await p.evaluate(() => document.getElementById('pricing').scrollIntoView());
  await new Promise(r => setTimeout(r, 700));
  await p.screenshot({ path: path.join(OUT, 'land-pricing.png') });

  // finale
  await p.evaluate(() => document.querySelector('.finale').scrollIntoView());
  await new Promise(r => setTimeout(r, 600));
  await p.screenshot({ path: path.join(OUT, 'land-finale.png') });

  await b.close();
  console.log('shot');
})().catch(e => { console.error(e); process.exit(1); });
