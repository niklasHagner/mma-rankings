const puppeteer = require('puppeteer');
const fs = require('fs');
const moment = require("moment");
const getMmaStatsUrl = (date) => `http://www.mma-stats.com/rankings/${date}`;

function uniqueBy(arr, prop){
  return arr.reduce((a, d) => {
    if (!a.includes(d[prop])) { a.push(d); }
    return a;
  }, []);
}

function saveToFile(newArrayOfDates) {
  const fileName = "data/data2.json";
  let rawdata = fs.readFileSync(fileName);
  let data = JSON.parse(rawdata);
  if (data && data.dates) {
    console.log("Reading", fileName, "\nIt contains", data.dates.length);
  }

  const concatted = data.dates.concat(newArrayOfDates);
  const sorted = concatted.sort((a,b) => new Date(b.date) - new Date(a.date));
  const unique = uniqueBy(sorted, "date");
  data.dates = unique;
  const dateLogText = data.dates.map(x => x.date).join(", ");
  console.log("File now contains", data.dates.length, "dates:", dateLogText);
  fs.writeFileSync(fileName, JSON.stringify(data));
  console.log (`File ${fileName} updated successfully`);
  return { scrapedUrlCount: newArrayOfDates.length };
}

async function scrapeRankingsForMultipleDates(_startDate, _endDate) {
  const startDate = _startDate || new Date("2019-01-01");
  const endDate = _endDate || new Date("2020-03-08");
  
  let date = moment(startDate);
  const dateStrings = [];
  for(let i=0; date.isBefore(endDate); i++) {
      dateStrings.push(date.format("YYYY-MM-DD"));
      date.add(1, "M");
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