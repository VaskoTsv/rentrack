const express = require('express');
const app = express();
const port = 3000;

// Get db, cron job handler and scrapers
const db = require('./db.js');
const cron = require('node-cron');
const scrapers = require('./scrapers.js');

// Add middleware
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); // disabled for security on local
    res.header("Access-Control-Allow-Headers", "Content-Type");
    next();
});

async function getScrapedOffers() {
    let offers = [];
    let response = [];

    // Await for results from scraping imot and olx sites.
    const imotPromise = new Promise((resolve) => {
        resolve(scrapers.imotScraper.scrape());
    });
    const olxPromise = new Promise((resolve) => {
        resolve(scrapers.olxScraper.scrape());
    })

    try {
        response = await Promise.all([imotPromise, olxPromise]);
    } catch (e) {
        const err = new Error(e);
        err.scrapingError = {message: e.message};
        throw err;
    }

    // Promise.all returns list of offers in following format - [[imotOffers], [olxOffers]].
    // Add them to offers list.
    for (const list of response) {
        offers = offers.concat(list);
    }

    return offers;
}

// Run cron job to scrape imot.bg and olx.bg every day at 08:00 Bulgarian time zone.
cron.schedule('0 8 * * *', async () => {
    let offers = [];

    try {
        offers = await getScrapedOffers();
    } catch (e) {
        res.send(e.scrapingError);
        return;
    }

    // Populate offers db with the newly scraped offers.
    await db.updateOffers(offers);
}, {
    scheduled: true,
    timezone: "Europe/Sofia"
});

// API routes
app.get('/offers', async (req, res) => {
    const data = await db.getOffers();
    res.send(data);
})

app.get('/scrape-offers', async (req, res) => {
    let offers = [];

    try {
        offers = await getScrapedOffers();
    } catch (e) {
        res.send(e.scrapingError);
        return;
    }

    // Populate offers db with the newly scraped offers.
    await db.updateOffers(offers);

    // Return all offers
    res.send(offers);
})

// Start server
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
})
