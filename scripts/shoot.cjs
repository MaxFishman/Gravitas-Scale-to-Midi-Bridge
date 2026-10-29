/* Screenshot capture for GRAVITAS README. Renders index.html and injects a
   simulated "live" state so the UI reads as a working product. */
const puppeteer = require('puppeteer');
const path = require('path');

const FILE = 'file://' + path.resolve(__dirname, '..', 'index.html');
const OUT = path.resolve(__dirname, '..', 'docs', 'screenshots');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    args: ['--no-sandbox'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1180, height: 900, deviceScaleFactor: 2 });
  await page.goto(FILE, { waitUntil: 'networkidle0' });
  // let fonts settle
  await new Promise(r => setTimeout(r, 900));

  // ── Capture 1: idle / connect state ──────────────────────────
  await page.screenshot({ path: path.join(OUT, 'interface-idle.png') });

  // ── Inject a convincing live state ───────────────────────────
  await page.evaluate(() => {
    // status pills green
    const setPill = (which, text) => {
      const p = document.getElementById('pill-' + which);
      p.classList.add('ok'); p.classList.remove('err');
      document.getElementById('pill-' + which + '-text').textContent = text;
    };
    setPill('hid', 'U.S. Solid Balance');
    setPill('midi', 'IAC Driver Bus 1');

    // match scale dropdown to the connected device in the log/pills
    const st = document.getElementById('scale-type-select');
    st.value = 'ussolid';
    st.dispatchEvent(new Event('change'));

    // scale + midi "LIVE" tags
    for (const id of ['hid-tag', 'midi-tag']) {
      const t = document.getElementById(id);
      t.textContent = 'LIVE'; t.classList.add('live');
    }

    // weight + midi readout
    const w = document.getElementById('weight-display');
    w.textContent = '342.6'; w.classList.add('active');
    document.getElementById('unit-display').textContent = 'g';
    document.getElementById('midi-val').textContent = '87';
    document.getElementById('midi-float').textContent = '0.685';
    document.getElementById('osc-count').textContent = '14,208';

    const vu = document.getElementById('vu-fill');
    vu.style.width = '68.5%';

    // disable connect / enable disconnect for realism
    document.getElementById('btn-connect-scale').disabled = true;
    document.getElementById('btn-disconnect-scale').disabled = false;

    // populate midi output dropdown
    const sel = document.getElementById('midi-output-select');
    sel.innerHTML = '<option>IAC Driver Bus 1</option>';
    document.getElementById('btn-connect-midi').textContent = 'Refresh Devices';

    // seed a believable log
    const log = document.getElementById('log');
    log.innerHTML = '';
    const lines = [
      ['14:02:09', 'U.S. Solid Precision Balance connected @ 9600 baud', 'ok'],
      ['14:02:09', 'MIDI access granted — IAC Driver Bus 1 selected', 'ok'],
      ['14:02:11', 'MIDI CC → Ch1 CC1, Ch1 CC7 [71]', 'midi'],
      ['14:02:11', 'MIDI CC → Ch1 CC1, Ch1 CC7 [78]', 'midi'],
      ['14:02:12', 'MIDI CC → Ch1 CC1, Ch1 CC7 [83]', 'midi'],
      ['14:02:12', 'MIDI CC → Ch1 CC1, Ch1 CC7 [87]', 'midi'],
    ];
    for (const [ts, msg, type] of lines) {
      const d = document.createElement('div');
      d.className = 'log-line ' + (type || '');
      d.innerHTML = '<span class="ts">' + ts + '</span><span class="msg">' + msg + '</span>';
      log.appendChild(d);
    }
    log.scrollTop = log.scrollHeight;
  });
  await new Promise(r => setTimeout(r, 300));

  // ── Capture 2: full live interface (hero) ────────────────────
  await page.screenshot({ path: path.join(OUT, 'interface-live.png') });

  // grow viewport so tall element crops aren't clipped
  await page.setViewport({ width: 1180, height: 1700, deviceScaleFactor: 2 });
  await new Promise(r => setTimeout(r, 200));

  // ── Capture 3: cropped live-weight panel ─────────────────────
  const panel = await page.$('main > div:first-child .panel');
  if (panel) await panel.screenshot({ path: path.join(OUT, 'weight-panel.png') });

  // ── Capture 4: cropped controls column ───────────────────────
  const controls = await page.$('main > div:nth-child(2)');
  if (controls) await controls.screenshot({ path: path.join(OUT, 'controls-panel.png') });

  await browser.close();
  console.log('done');
})().catch(e => { console.error(e); process.exit(1); });
