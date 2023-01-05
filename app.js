const express = require("express");
const app = express();
const nunjucks = require("nunjucks");
const fs = require('fs');
const winston = require('winston');
const config = require("exp-config");

const mmaStatsScraper = require('./backend/scrapeMmaStatsDotCom');
const { findRankAtTime } = require('./backend/findRank');
const wikipediaApi = require('./backend/wikipediaApi.js');
const viewBuilder = require('./backend/viewBuilder.js');
const fileHelper = require('./backend/fileHelper.js');

const SAVE_JSON_TO_FILE = process.env.SAVE_JSON_TO_FILE || config.SAVE_JSON_TO_FILE;

const mmaStatsJsonRaw = fs.readFileSync("data/mmaStats.json");
const mmaStatsJson = JSON.parse(mmaStatsJsonRaw);
const lastScapedStatsDate = mmaStatsJson.dates[0].date;
console.log(`The last rank is dated ${lastScapedStatsDate}. Maybe it's time to run 'npm run scrapeLatestRankings'`);

const fightersWithProfileLinksRaw = fs.readFileSync("data/allFighters.json");
global.fightersWithProfileLinks = JSON.parse(fightersWithProfileLinksRaw);

let mmaStatsRaw = fs.readFileSync("data/mmaStats.json");
global.rankData = JSON.parse(mmaStatsRaw);

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
  .addFilter("divisionAbbreviation", (originalStr) => {
    const str = originalStr.toLowerCase().trim().replace(" ", "").replace("women's", "");
    if (str ==="flyweight") return "FlyW"; 
    else if (str ==="strawweight") return "SW";
    else if (str ==="bantamweight") return "BW";
    else if (str ==="featherweight") return "FW";
    else if (str ==="lightweight") return "LW";
    else if (str ==="welterweight") return "WW";
    else if (str ==="middleweight") return "MW";
    else if (str ==="lightheavyweight") return "LHW";
    else if (str ==="heavyweight") return "HW";
    else return originalStr;
  })
  .addFilter("nicknameOrLastname", (fighter) => {
    if (fighter.fighterInfo.nickname) return fighter.fighterInfo.nickname;
    
    const splitName = fighter.fighterInfo.name.split(" ");
    return splitName[splitName.length -1];
  })
  .addFilter("getFighterNameOrLinkHtml", (fighter) => {
    return viewBuilder.getFighterNameOrLinkHtml(fighter);
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
  const rankData = global.rankData;
  const rankingsHtmlString = viewBuilder.buildRankingsHtml(rankData.dates);
  const viewModel = {};
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
  viewModel.events = await getEvents(rankData);
  viewModel.fightersWithProfileLinks = global.fightersWithProfileLinks;
  res.render("events.njk", viewModel, (err, html) => {
    if (err) return next(err);
    res.send(html);
  });
});

app.get('/searchForNameAndDate', function (req, res) {
  const name = req.query.name || "Jon Jones";
  const date = req.query.date || "2016-01-02";

  let rawdata = fs.readFileSync("data/mmaStats.json");
  let data = JSON.parse(rawdata);
  const rank = findRankAtTime(data, name, date);
  const jsonResult = { "mostRecentMatch": rank };
  return res.json(jsonResult);
});

//shortFileName should a match a filename in data/fighters/*.json 
//Examples: "Jan_B%C5%82achowicz"  or "Jon_Jones" 
app.get('/fighter/:name', async function (req, res, next) {
  const name = req.params.name;
  let encodedName = encodeURIComponent(name);
  const viewModel = { 
    fighter: await fileHelper.readFileByShortFileName(encodedName)
  }
  res.render("fighter.njk", viewModel, (err, html) => {
    if (err) return next(err);
    res.send(html);
  });
});

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

async function getEvents(rankingsData) {
  const data = await wikipediaApi.getInfoAndFightersFromNextEvents();

  const asyncRes = await Promise.all(data.events.map(async (event) => {
    const fighters = await Promise.all(event.fighters.map(fighter => extendFighterApiDataWithRecordInfo(fighter, rankingsData)));
    return { ...event, fighters };
  }));
  return asyncRes;
}

async function extendFighterApiDataWithRecordInfo(fighter, allRankingsData) {
  const record = fighter.record;
  const extendedRecord = record.map((fight) => {
    const opponentInfoAtTheTime = findRankAtTime(allRankingsData, fight.opponentName, fight.date);
    return { ...fight, opponentInfoAtTheTime };
  });
  fighter.record = extendedRecord;

  // if (SAVE_JSON_TO_FILE) {
  //   fileHelper.saveFighter(fighter);
  // }
  
  return fighter;
}

var port = process.env.PORT || 8001;
console.log('Server listening on:' + port);
app.listen(port);
console.info(`Navigate to http://localhost:${port}/`);