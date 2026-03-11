const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch();
    const pages = [
        { file: 'sample-dependency-map.html', out: 'screenshot-dependency-map.png', waitMs: 2000 },
        { file: 'sample-complexity-dashboard.html', out: 'screenshot-complexity-dashboard.png', waitMs: 500 },
        { file: 'sample-comparative-table.html', out: 'screenshot-comparative-table.png', waitMs: 500 },
    ];

    for (const p of pages) {
        const page = await browser.newPage({ viewport: { width: 1000, height: 800 } });
        await page.goto(`file://${__dirname}/${p.file}`, { waitUntil: 'networkidle' });
        // Wait for D3 force simulation to settle
        await page.waitForTimeout(p.waitMs);
        // Screenshot just the article content
        const article = await page.$('article');
        if (article) {
            await article.screenshot({ path: `${__dirname}/${p.out}` });
        } else {
            await page.screenshot({ path: `${__dirname}/${p.out}`, fullPage: true });
        }
        await page.close();
        console.log(`Captured: ${p.out}`);
    }

    await browser.close();
})();
