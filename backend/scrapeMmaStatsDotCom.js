const puppeteer = require('puppeteer');
const fs = require('fs');
const moment = require("moment");
const getMmaStatsUrl = (date) => `http://www.mma-stats.com/rankings/${date}`;

function saveToFile(newArrayOfDates) {
  let rawdata = fs.readFileSync("data/dataDump.json");
  let data = JSON.parse(rawdata);
  const conc = data.dates.concat(newArrayOfDates);
  sorted = conc.sort((a,b) => new Date(b.date) - new Date(a.date));
  data.dates = sorted;
  const writeStatus = fs.writeFileSync("data/data2.json", JSON.stringify(data));
  console.log ("write to file status:", writeStatus);
  return { scrapedUrlCount: newArrayOfDates.length, saveToFileStatus: writeStatus };
}

async function scrapeRankingsForMultipleDates() {
  const today = moment();
  const dateStrings = [];
  const date = moment(new Date("2013-03-01"));
  for(let i=0; date.isBefore(today); i++) {
      dateStrings.push(date.format("YYYY-MM-DD"));
      date.add(12, "M");
  }
  console.log("dates to scrape", dateStrings);
  const promises = dateStrings.map(date => scrapeMmaStats(date))
  Promise.all(promises).then((data) => {
      console.log("resolved all scraping promises", data);
      saveToFile(data);
  });
}


/*
  mma-stats.com is perfect for navigation via urls
  If you navigate to a date that doesn't exist like http://www.mma-stats.com/rankings/2019-11-01
  they'll redirect to the closest available date (http://www.mma-stats.com/rankings/2019-10-28)
*/
async function scrapeMmaStats(date = "2016-12-19") {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const url = getMmaStatsUrl(date);
  console.log("scraping url:", url);
  await page.goto(url, { waitUntil: 'networkidle0' });

  let data = { hello : "world" };
  data = await page.evaluate(() => {
    const divisionElements = [...document.querySelectorAll(".weight-rankings")];
    const divisions = divisionElements.map((division) => { 
      return { 
        name: division.querySelector("h3").innerText, 
        fighters:  [...division.querySelectorAll(".fighter")].map((fighter) => {
          return {
            rank: fighter.querySelector(".rank").innerText,
            link: "https://mma-stats.com" + fighter.querySelector("a").getAttribute("href"),
            name: fighter.querySelector("a").innerText
          };
        })
      }
    });

    const selectedDate = document.querySelector("#date_select").selectedOptions[0].innerText;

    const json = {
      date: selectedDate,
      divisions
    }
    return json;
  });

  await browser.close();
  
  console.log("finished scraping mma-stats");
  console.log(data);
  return data;
}

module.exports = {
  scrapeMmaStats,
  scrapeRankingsForMultipleDates
}