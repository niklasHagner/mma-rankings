const fs = require('fs');
const moment = require("moment");
const getMmaStatsUrl = (date) => `http://www.mma-stats.com/rankings/${date}`;
const jsdom = require('jsdom');
const { uniqueBy } = require("./arrHelper");

function saveToFile(newArrayOfDates) {
  const fileName = "data/mmaStats.json";
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

// Scrape startDate, then once per month, and also scrape the endDate if it's more than 4 days ahead of the previous date.
async function scrapeRankingsForMultipleDates(startDate, endDate) {
  let date = moment(startDate);
  const dateStrings = [];
  for(let i=0; date.isBefore(endDate); i++) {
      dateStrings.push(date.format("YYYY-MM-DD"));
      date.add(1, "M");
  }
  const diffLastAndEndDate = moment(dateStrings[dateStrings.length-1]).diff(moment(endDate), "days");
  if (Math.abs(diffLastAndEndDate) > 4) {
    dateStrings.push(moment(endDate).format("YYYY-MM-DD"));
  }
  if (dateStrings.length < 1) {
    console.log("nothing to scrape");
    return;
  }

  console.log("dates to scrape", dateStrings);
  const promises = dateStrings.map(date => scrapeMmaStats(date))
  Promise.all(promises).then((data) => {
      console.log("resolved all scraping promises", data);
      saveToFile(data);
  });
}


/*
  Scrape a single page on mma-stats.com for a selected dateString like "2016-12-19"

  mma-stats.com is perfect for navigation via urls
  If you navigate to a date that doesn't exist like http://www.mma-stats.com/rankings/2019-11-01
  they'll redirect to the closest available date (http://www.mma-stats.com/rankings/2019-10-28)
*/
async function scrapeMmaStats(date = "2016-12-19") {
  const url = getMmaStatsUrl(date);
  console.log("scraping url:", url);
  // await page.goto(url, { waitUntil: 'networkidle0' });

  return new Promise((resolve) => {
    jsdom.JSDOM.fromURL(url).then(dom => {
      // console.log(dom.serialize());
      let document = dom.window.document;
      const divisionElements = [...document.querySelectorAll(".weight-rankings")];
      const divisions = divisionElements.map((division) => { 
        return { 
          name: division.querySelector("h3").textContent, 
          fighters:  [...division.querySelectorAll(".fighter")].map((fighter) => {
            let rankText = fighter.querySelector(".rank").textContent;
            if (rankText.toLowerCase() === "champion") {
              rankText = "C";
            }
              return {
              rank: rankText,
              link: "https://mma-stats.com" + fighter.querySelector("a").getAttribute("href"),
              name: fighter.querySelector("a").textContent
            };
          })
        }
      });
  
      const selectedDate = document.querySelector("#date_select").selectedOptions[0].textContent;
  
      const json = {
        date: selectedDate,
        divisions
      }
  
      console.log("finished scraping mma-stats");
      resolve(json);
    });
  })
 
}

module.exports = {
  scrapeMmaStats,
  scrapeRankingsForMultipleDates
}