const express = require("express");
const app = express();
const nunjucks = require("nunjucks");
const fs = require('fs');
const winston = require('winston');
const config = require("exp-config");
const moment = require("moment");

const mmaStatsScraper = require('./backend/scrapeMmaStatsDotCom');
const { findRankAtTime } = require('./backend/findRank.js');
const wikipediaApi = require('./backend/wikipediaApi.js');
const viewBuilder = require('./backend/viewBuilder.js');
const fileHelper = require('./backend/fileHelper.js');
const { divisionAbbreviation } = require('./backend/stringAndHtmlHelper.js');

const mmaStatsJsonRaw = fs.readFileSync("data/mmaStats.json");
const mmaStatsJson = JSON.parse(mmaStatsJsonRaw);
const lastScapedStatsDate = mmaStatsJson.dates[0].date;
console.log(`The last rank is dated ${lastScapedStatsDate}. Maybe it's time to run 'npm run scrapeLatestRankings'`);

global.fightersWithProfileLinks = JSON.parse(fs.readFileSync("data/allFighters.json"));
global.rankData = JSON.parse(fs.readFileSync("data/mmaStats.json"));

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
  .addFilter("dateFormat", (str) => {
    try {
      const date = new Date(str);
      return moment(date.toISOString()).format("YYYY-MM");
    } catch(error) { //Can happen if tableParser took incorrect cell
      console.error(`This is an invalid date: ${str}`);
      return "Unknown date";
    }
  })
  .addFilter("getTime", (str) => {
    const date = new Date(str);
    return date.getTime();
  })
  .addFilter("inlineFileContent", (pathToFile) => {
    const fileContent = fs.readFileSync(pathToFile).toString();
    if (pathToFile.endsWith(".js")) {
      return fileContent.replace("sourceMappingURL=", "sourceMappingURL=/scripts/");
    }
    return fileContent;
  })
  .addFilter("divisionAbbreviation", (originalStr) => {
    return divisionAbbreviation(originalStr);
  })
  .addFilter("nicknameOrLastname", (fighter) => {
    if (!fighter?.fighterInfo?.name && !fighter?.fighterInfo?.nickname) {//Expects null for unknown fighters
      return "?";
    }
    
    if (fighter.fighterInfo.nickname) {
      return fighter.fighterInfo.nickname;
    } else {
      const splitName = fighter.fighterInfo.name.split(" ");
      return splitName[splitName.length -1];
    }
  })
  .addFilter("getFighterNameOrLinkHtml", (fighterName) => {
    return viewBuilder.getFighterNameOrLinkHtml(fighterName);
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

//name should a match a filename in data/fighters/*.json 
//Examples: "Jan_B%C5%82achowicz"  or "Jon_Jones" 
app.get('/fighter/:name', async function (req, res, next) {
  const name = req.params.name;
  let encodedName = encodeURIComponent(name);
  let fighter = await fileHelper.readFileByShortFileName(encodedName);
  if (!fighter) {
    return res.render("404.njk");
  }
  fighter = await viewBuilder.extendFighterApiDataWithRecordInfo(fighter, global.rankData);
  const viewModel = { 
    fighter
  }

  return res.render("fighter.njk", viewModel, (err, html) => {
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
    const fighters = await Promise.all(event.fighters.map(fighter => viewBuilder.extendFighterApiDataWithRecordInfo(fighter, rankingsData)));
    return { ...event, fighters };
  }));
  return asyncRes;
}

var port = process.env.PORT || 8001;
console.log('Server listening on:' + port);
app.listen(port);
console.info(`Navigate to http://localhost:${port}/`);