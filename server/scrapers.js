const puppeteer = require('puppeteer');

async function scrapeSite(url, startPage, endPage, scrapePage) {
    let data = [];

    // Go to first page
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url + '1');

    // Scrape all pages and add the results in scrapedData.
    let currentPage = startPage;
    while (currentPage <= endPage) {
        const result = await scrapePage(url + String(currentPage));
        data = data.concat(result);
        currentPage++;
    }

    browser.close();

    return data;
}

// Imot.bg scraper
const imotScraper = (function () {
    const baseUrl = 'https://www.imot.bg/pcgi/imot.cgi?act=3&slink=5ubpy5&f1=';

    async function scrape() {
        return await scrapeSite(baseUrl, 1, 6, scrapePage);
    }

    async function scrapePage(url) {
        const offersData = [];

        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(url);

        const offerTables = await page.$x('/html/body/div[2]/table[1]/tbody/tr[1]/td[1]/table');

        let index = 1;
        for (const table of offerTables) {
            // Offer tables start from table number 3
            if (index < 3) {
                index += 1;
                continue;
            }

            const [titleEl] = await page.$x(`/html/body/div[2]/table[1]/tbody/tr[1]/td[1]/table[${index}]/tbody/tr[2]/td[2]/a[1]`);
            const [descriptionEl] = await page.$x(`/html/body/div[2]/table[1]/tbody/tr[1]/td[1]/table[${index}]/tbody/tr[3]/td`);
            const [linkEl] = await page.$x(`/html/body/div[2]/table[1]/tbody/tr[1]/td[1]/table[${index}]/tbody/tr[2]/td[2]/a[2]`);
            const [imgEl] = await page.$x(`/html/body/div[2]/table[1]/tbody/tr[1]/td[1]/table[${index}]/tbody/tr[2]/td[1]/table/tbody/tr/td/a/img`);
            const [addressEl] = await page.$x(`/html/body/div[2]/table[1]/tbody/tr[1]/td[1]/table[${index}]/tbody/tr[2]/td[2]/a[2]`);
            const [priceEl] = await page.$x(`/html/body/div[2]/table[1]/tbody/tr[1]/td[1]/table[${index}]/tbody/tr[2]/td[2]/div`);

            if (!titleEl) break; // There are no more offers to be scraped, for the current page.

            const [brokerEl] = await page.$x(`/html/body/div[2]/table[1]/tbody/tr[1]/td[1]/table[${index}]/tbody/tr[2]/td[4]`);
            const broker = await brokerEl.$('a.logoLink');

            if (broker) continue; // The offer is from broker, do not push it to offersData.

            const text = await titleEl.getProperty('textContent');
            const desc = await descriptionEl.getProperty('textContent');
            const linkUrl = await linkEl.getProperty('href');
            const src = await imgEl.getProperty('src');
            const addressText = await addressEl.getProperty('textContent');
            const priceText = await priceEl.getProperty('textContent');

            const title = await text.jsonValue();
            const description = await desc.jsonValue();
            const link = await linkUrl.jsonValue();
            const imageSrc = await src.jsonValue();
            const address = await addressText.jsonValue();
            const price = await priceText.jsonValue();

            offersData.push({title, description, link, imageSrc, address, price});
            index += 1;
        }

        browser.close();

        return offersData;
    }

    return {
        scrape: scrape,
    }
})();

// Olx.bg scraper
const olxScraper = (function () {
    const baseUrl = 'https://www.olx.bg/nedvizhimi-imoti/naemi/apartamenti/sofiya/?currency=BGN&search%5Bfilter_float_price%3Ato%5D=800&search%5Bdescription%5D=1&search%5Bprivate_business%5D=private&search%5Border%5D=filter_float_price%3Aasc&search%5Bfilter_enum_atype%5D%5B0%5D=2&search%5Bfilter_enum_atype%5D%5B1%5D=3&search%5Bfilter_enum_atype%5D%5B2%5D=mezonet&search%5Bfilter_enum_atype%5D%5B3%5D=atelie&search%5Bfilter_enum_furn%5D%5B0%5D=obzaveden&search%5Bfilter_enum_furn%5D%5B1%5D=poluobzaveden&page=';

    async function scrape() {
        return await scrapeSite(baseUrl, 1, 4, scrapePage);
    }

    async function scrapePage(url) {
        const offersData = [];

        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(url);

        const offerTables = await page.$x('/html/body/div[2]/div[7]/section/div[3]/div/div[1]/table[2]/tbody/tr');

        let index = 1;
        for (const table of offerTables) {
            // Offer tables start from table number 3
            if (index < 3) {
                index += 1;
                continue;
            }

            const [titleEl] = await page.$x(`/html/body/div[2]/div[7]/section/div[3]/div/div[1]/table[2]/tbody/tr[${index}]/td/div/table/tbody/tr[1]/td[2]/div/h3/a/strong`);
            const [linkEl] = await page.$x(`/html/body/div[2]/div[7]/section/div[3]/div/div[1]/table[2]/tbody/tr[${index}]/td/div/table/tbody/tr[1]/td[2]/div/h3/a`);
            const [imgEl] = await page.$x(`/html/body/div[2]/div[7]/section/div[3]/div/div[1]/table[1]/tbody/tr[${index}]/td/div/table/tbody/tr[1]/td[1]/a/img`);
            const [addressEl] = await page.$x(`/html/body/div[2]/div[7]/section/div[3]/div/div[1]/table[1]/tbody/tr[${index}]/td/div/table/tbody/tr[2]/td[1]/div/p/small[1]/span`);
            const [priceEl] = await page.$x(`/html/body/div[2]/div[7]/section/div[3]/div/div[1]/table[1]/tbody/tr[${index}]/td/div/table/tbody/tr[1]/td[3]/div/p/strong`);

            if (!titleEl || !linkEl || !imgEl || !addressEl || !priceEl) break; // There are no more offers to be scraped, for the current page.

            const text = await titleEl.getProperty('textContent');
            const linkUrl = await linkEl.getProperty('href');
            const src = await imgEl.getProperty('src');
            const addressText = await addressEl.getProperty('textContent');
            const priceText = await priceEl.getProperty('textContent');

            const title = await text.jsonValue();
            const description = ''; // Olx offer preview does NOT have a description.
            const link = await linkUrl.jsonValue();
            const imageSrc = await src.jsonValue();
            const address = await addressText.jsonValue();
            const price = await priceText.jsonValue();

            offersData.push({title, description, link, imageSrc, address, price});
            index += 1;
        }

        browser.close();

        return offersData;
    }

    return {
        scrape: scrape,
    }
})();

module.exports = {
    imotScraper,
    olxScraper,
};
