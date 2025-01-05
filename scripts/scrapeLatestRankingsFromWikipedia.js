const fs = require('fs');
const moment = require("moment");
const wikipediaRankScraper = require('../backend/scrapeWikipediaRankings.js');
const { uniqueBy } = require("../backend/arrHelper");

/*
    EXAMPLE DATA:
    newRankDateObj example: {date: 'May 16, 2023', divisions: Array(12)}

    REQUIREMENTS:
    The date-string must incoude year
*/
function saveToFile(newRankDateObj) {
    const fileName = "data/mmaStats.json";
    let rawdata = fs.readFileSync(fileName);
    let data = JSON.parse(rawdata);
    if (data && data.dates) {
      console.log("Reading", fileName, "\nIt contains", data.dates.length);
    }
  
    const concatted = data.dates.concat(newRankDateObj);
    const sorted = concatted.sort((a,b) => new Date(b.date) - new Date(a.date));
    const unique = uniqueBy(sorted, "date");
    data.dates = unique;
    console.log("File now contains", data.dates.length, "dates:", data.dates.map(x => x.date).join(", "));
    fs.writeFileSync(fileName, JSON.stringify(data));
    console.log (`File ${fileName} updated successfully`);
    return { scrapedUrlCount: newRankDateObj.length };
  }

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

  //Example: { date: '', data: |]}
  const scrapedData = await wikipediaRankScraper.scrapeRankings(startDate, today);
  saveToFile(scrapedData);
}

scrapeLatestRankings();