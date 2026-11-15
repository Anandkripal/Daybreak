/* eslint-disable @typescript-eslint/no-require-imports -- standalone CommonJS runner resolves isolated tools through NODE_PATH */
// Run with NODE_PATH pointing to a separate install of playwright and @axe-core/playwright.
const { chromium, firefox, webkit } = require('playwright');
const AxeBuilder = require('@axe-core/playwright').default;
const assert = require('node:assert/strict');
(async () => {
  for (const [name, engine] of Object.entries({ chromium, firefox, webkit })) {
    if (process.env.BROWSER && process.env.BROWSER !== name) continue;
    const browser = await engine.launch({ timeout: 15000 });
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, acceptDownloads: true });
    const page = await context.newPage();
    const scanWithAxe = process.env.DAYBREAK_FUNCTIONAL_ONLY !== '1';
    async function checkAccessibility() {
      if (!scanWithAxe) return;
      const axe = new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']);
      assert.deepEqual((await axe.analyze()).violations, []);
    }
    const leaked = [];
    page.on('request', (request) => { if ((request.url() + (request.postData() || '')).includes('PRIVATE_SENTINEL')) leaked.push(request.url()); });
    await page.goto('http://localhost:3027');
    await page.getByRole('heading', { name: 'Real help. One step at a time.' }).waitFor();
    const urgentHousing = page.getByRole('region', { name: 'Need somewhere to stay tonight?' });
    assert.equal(await urgentHousing.getByRole('link', { name: '1800 152 152' }).getAttribute('href'), 'tel:1800152152');
    assert.equal(await urgentHousing.getByRole('link', { name: /elsewhere in Australia/ }).getAttribute('href'), 'https://askizzy.org.au/');
    await page.getByText(/Evidence ID: food/).waitFor();
    const food = page.getByRole('link', { name: 'Food and everyday essentials' });
    assert.equal(await food.getAttribute('href'), 'https://askizzy.org.au/');
    // Reduced CSS viewports approximate reflow space at 200% and 400% on a 1280px window.
    for (const width of [640, 320]) {
      await page.setViewportSize({ width, height: 844 });
      for (const route of ['/', '/budget', '/transactions']) {
        await page.goto(`http://localhost:3027${route}`);
        assert.equal(await page.locator('main h1').count(), 1);
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `${route} reflow at ${width}px`);
      }
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('http://localhost:3027');
    const add = page.getByRole('button', { name: 'Add to my follow-up list' });
    await add.focus(); await page.keyboard.press('Enter');
    await page.getByLabel('Next step or outcome').fill('PRIVATE_SENTINEL');
    await page.getByLabel('Progress').selectOption('Contacted');
    await page.getByLabel('Follow-up date').fill('2026-12-01');
    const exportEvent = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Export my private notes' }).click();
    const download = await exportEvent;
    const json = JSON.parse(require('node:fs').readFileSync(await download.path(), 'utf8'));
    assert.equal(json.entries[0].notes, 'PRIVATE_SENTINEL');
    await page.getByRole('button', { name: 'Delete this entry' }).focus(); await page.keyboard.press('Enter');
    assert.equal(await add.evaluate((el) => el === document.activeElement), true);
    assert.equal(await page.getByLabel('Next step or outcome').count(), 0);
    await add.click(); await page.getByRole('button', { name: 'Delete all notes' }).click();
    assert.equal(await add.evaluate((el) => el === document.activeElement), true);
    await checkAccessibility();
    await page.goto('http://localhost:3027/transactions');
    const header = 'date,kind,amount,currency,recurring\n';
    await page.getByLabel('Choose CSV').setInputFiles({ name: 'synthetic.csv', mimeType: 'text/csv', buffer: Buffer.from(header + '2026-10-01,income,3000.00,AUD,no\n2026-10-02,expense,1200.00,AUD,yes') });
    await page.getByRole('heading', { name: 'Monthly cash flow' }).waitFor();
    assert.match(await page.locator('table').innerText(), /1,800.00/);
    await checkAccessibility();
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    await page.getByRole('button', { name: 'Delete imported figures' }).click();
    assert.equal(await page.locator('table').count(), 0);
    await page.getByLabel('Choose CSV').setInputFiles({ name: 'bad.csv', mimeType: 'text/csv', buffer: Buffer.from(header + '2026-02-30,income,1,AUD,no') });
    await page.getByRole('status').filter({ hasText: 'Check row 2' }).waitFor();
    assert.equal(await page.locator('table').count(), 0);
    assert.deepEqual(await page.evaluate(() => ({ local: localStorage.length, session: sessionStorage.length })), { local: 0, session: 0 });
    assert.deepEqual(leaked, []);
    await browser.close(); console.log(`${name}: contact, keyboard focus, export/delete, CSV validation, mobile and storage/network checks passed (axe: ${scanWithAxe ? 'passed' : 'not run'})`);
  }
})().catch((error) => { console.error(error); process.exit(1); });
