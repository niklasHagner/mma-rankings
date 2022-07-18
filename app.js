const express = require("express");
const app = express();
const nunjucks = require("nunjucks");
const fs = require('fs');
const path = require('path');
const winston = require('winston');
const moment = require("moment");

const mmaStatsScraper = require('./backend/scrapeMmaStatsDotCom');
const { findRankAtTime } = require('./backend/findRank');
const wikipediaApi = require('./backend/wikipediaApi.js');

const viewBuilder = require('./backend/viewBuilder.js');
let existingData = fs.readFileSync("data/mmaStats.json");
let jsonData = JSON.parse(existingData);
let lastScapedDate = jsonData.dates[0].date;
console.log(`The last rank is dated ${lastScapedDate}. Maybe it's time to run /scrapeMissing `);

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(express.static('public'));

app.set("view engine", ".njk");

nunjucks.configure("views", {
  autoescape: true,
  trimBlocks: true,
  lstripBlocks: true,
  express: app
})
  .addFilter("classList", (classList) => classList.filter((x) => x).join(" "))
  .addFilter("inlineFileContent", (pathToFile) => {
    const fileContent = fs.readFileSync(pathToFile).toString();
    if (pathToFile.endsWith(".js")) {
      return fileContent.replace("sourceMappingURL=", "sourceMappingURL=/scripts/");
    }
    return fileContent;
  })

winston.configure({
  transports: [
    new (winston.transports.File)({ filename: 'app.log' })
  ]
})

var settings = {
  logOutputOnce: true,
  loggedResponses: 0,
  caching: false,
  storedResponses: {}, //keymap
}

app.get('/', async function (req, res, next) {
  const viewModel = {};
  const rankData = await getRankingsFromFile(req, res);

  const rankingsHtmlString = viewBuilder.buildRankingsHtml(rankData.dates);
  viewModel.rankings = {
      allRankings: {
        dates: rankData.dates,
        htmlString: rankingsHtmlString, 
      },
      latestRankings: {
        ...rankData.dates[0],
        htmlString: viewBuilder.buildRankingsHtml(rankData.dates.slice(0,1))
      },
  };
  const events = await getEvents(rankData);
  viewModel.events = events;
  res.render("base.njk", viewModel, (err, html) => {
    if (err) return next(err);
    res.send(html);
  });
});

const defaultResponse = {
  error: true
};

app.get('/searchfileforfighter', function (req, res) {
  const name = req.query.name || "Jon Jones";
  const date = req.query.date || "2016-01-02";

  let rawdata = fs.readFileSync("data/mmaStats.json");
  let data = JSON.parse(rawdata);
  const rank = findRankAtTime(data, name, date);
  const jsonResult = { "mostRecentMatch": rank };
  return res.json(jsonResult);
});

app.get('/scrapeMissing', async function (req, res) {
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

  const scrapeStatus = await mmaStatsScraper.scrapeRankingsForMultipleDates(startDate, today);
  return res.send(scrapeStatus);
});

app.get('/scrapeByQueryParams', async function (req, res) {
  const startDate = req.query.startDate;
  const endDate = req.query.endDate;
  const scrapeStatus = await mmaStatsScraper.scrapeRankingsForMultipleDates(startDate, endDate);
  res.send(scrapeStatus);
});

async function getRankingsFromFile(req, res) {
  let rawdata = fs.readFileSync("data/mmaStats.json");
  let jsonData = JSON.parse(rawdata);
  return jsonData;
}

app.get('/mma-stats-by-date', async function (req, res) {
  res.contentType('application/json');
  if (typeof req.query.date === 'undefined') {
    const errorMessage = " Error. Try something like this instead: /mma-stats-by-date?date=2019-02-30";
    console.error(errorMessage);
    res.send({ error: errorMessage });
    return;
  }
  console.log('called with query:', req.query);

  const json = await mmaStatsScraper.scrapeMmaStats(req.query.date);
  res.send(json);
});

// app.get('/search-fighter-by-name', function(req, response) {
//     response.contentType('application/json');

//     if (!req.query.name) {
//         console.error(" Error. Try something like this instead: /search-fighter-by-name?name=Fedor");
//         return response.send({error:true});
//     }

//     var fighterName = decodeURIComponent(req.query.name);

//     wikipediaApi.findFighterByName(fighterName).then(function (fighter) {
//         //append historical records
//         let allRankingsFromFile = fs.readFileSync("data/mmaStats.json");
//         let allRankingsData = JSON.parse(allRankingsFromFile);
//         fighter = mapFighterFromApiToExtraData(fighter, allRankingsData);
//         return response.render(`{{ fighterView.render(fighter) }}`, fighter);
//     }).catch(function (reason) {
//         console.error("fail", reason);
//         response.send("fail: " + reason);
//         return;
//     });
// });

async function getEvents(rankingsData) {
  if (!rankingsData) rankingsData = getRankingsFromFile();
  
  const data = await wikipediaApi.getInfoAndFightersFromNextEvents();
  //Extend fighter-objects with historical ranking data
  const events = data.events.map(event => {
    let fighters = event.fighters.map((fighter) => {
      return mapFighterFromApiToExtraData(fighter, rankingsData);
    });
    return { ...event, fighters };
  })
  return events;
}

function mapFighterFromApiToExtraData(fighter, allRankingsData) {
  const record = fighter.record;
  const extendedRecord = record.map((fight) => {
    const opponentInfoAtTheTime = findRankAtTime(allRankingsData, fight.opponentName, fight.date);
    return { ...fight, opponentInfoAtTheTime };
  });
  fighter.record = extendedRecord;
  return fighter;
}

var port = process.env.PORT || 8001;
console.log('Server listening on:' + port);
app.listen(port);
console.info(`Navigate to http://localhost:${port}/`);
// console.info("...To scrape data navigate to http://localhost:${port}/scrapeMissing");
// or http://localhost:${port}/scrape?startDate=2017-01-01&endDate=2017-12-31
// console.info("* Endpoint example: /search-fighter-by-name?name=Fedor");
