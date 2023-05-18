const fs = require('fs');
const moment = require("moment");
const wikipediaRankScraper = require('../backend/scrapeWikipediaRankings.js');

async function scrapeLatestRankings() {
  let existingData = fs.readFileSync("data/mmaStats.json");
  let jsonData = JSON.parse(existingData);
  let lastScapedJsonBlob = jsonData.dates[0];
  const lastScrapedDate = lastScapedJsonBlob.date;
  const today = new Date().toISOString().split('T')[0];

  let startDate;
  const lastScrapedMoment = moment(lastScrapedDate, "MMM DD, YYYY");
  const diff = lastScrapedMoment.diff(moment(today), "days");

  if (Math.abs(diff) >= 7) {
    const startDateMoment = lastScrapedMoment.add(1, "M");
    startDate = startDateMoment.format("YYYY-MM-DD");
  } else {
    startDate = today;
  }

  if (moment(startDate).isAfter(moment(today))) {
    startDate = today;
  }

  const scrapeStatus = await wikipediaRankScraper.scrapeRankings(startDate, today);
  return scrapeStatus;
}

scrapeLatestRankings();