const puppeteer = require('puppeteer');

const getMmaStatsUrl = (date) => `http://www.mma-stats.com/rankings/${date}`;

async function scrapeMmaStats(date = "2016-12-19") {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  /*
    mma-stats.com is perfect for guessing urls
    If you navigate to a date that doesn't exist like http://www.mma-stats.com/rankings/2019-11-01
    their site will automatically redirect you to the closest available date http://www.mma-stats.com/rankings/2019-10-28 
  */
  const url = getMmaStatsUrl(date);
  console.log("uhm", url);
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
  scrapeMmaStats
}