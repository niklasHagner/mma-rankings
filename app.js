const express = require("express");
const app = express();
const nunjucks = require("nunjucks");
const fs = require('fs');
const winston = require('winston');
const config = require("exp-config");
const moment = require("moment");

const mmaStatsScraper = require('./backend/scrapeMmaStatsDotCom');
const { findRankAtTime, findAllRanksForFighter } = require('./backend/findRank');
const wikipediaApi = require('./backend/wikipediaApi.js');
const viewBuilder = require('./backend/viewBuilder.js');
const fileHelper = require('./backend/fileHelper.js');
const { divisionAbbreviation } = require('./backend/stringAndHtmlHelper.js');

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
  .addFilter("dateFormat", (str) => {
    const date = new Date(str);
    return moment(date.toISOString()).format("YYYY-MM");
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
    if (fighter.fighterInfo.nickname) return fighter.fighterInfo.nickname;
    
    const splitName = fighter.fighterInfo.name.split(" ");
    return splitName[splitName.length -1];
  })
  .addFilter("getFighterNameOrLinkHtml", (fighter) => {
    return viewBuilder.getFighterNameOrLinkHtml(fighter);
  })
  .addFilter("limitRankHistoryToFewerDataPoints", (rankHistory) => {
    
    const rankObjects = rankHistory.map(rankObj => {
      return { rank: rankObj.fighter.rank, date: rankObj.date, division: rankObj.division.trim() };
    }).filter(rankObj => {
      
    })

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
    const fighterRankAtTheTime = findRankAtTime(allRankingsData, fighter.fighterInfo.name, fight.date);
    const opponentInfoAtTheTime = findRankAtTime(allRankingsData, fight.opponentName, fight.date);
    return { ...fight, opponentInfoAtTheTime, fighterRankAtTheTime };
  });
  fighter.record = extendedRecord;

  // if (SAVE_JSON_TO_FILE) {
  //   fileHelper.saveFighter(fighter);
  // }

  fighter.rankHistory = findAllRanksForFighter(global.rankData, fighter.fighterInfo.name);

  const series=[];
  fighter.rankHistory
    .forEach(dataPoint => {
      const dateObj = new Date(dataPoint.date)
      const dataItemToAdd = {isoDate: dateObj.getTime(), dateObj, rank: Number(dataPoint.fighter.rank)};  
      const trimmedDivisionStr = dataPoint.division.trim();
      const matchingSeries = series.find(seriesItem => seriesItem.divisionFullName === trimmedDivisionStr)
      if (matchingSeries) {
        matchingSeries.data.push(dataItemToAdd);
      } else {
        series.push({divisionShortName: divisionAbbreviation(trimmedDivisionStr), data: [dataItemToAdd] });
      }
    });
  fighter.allRankHistoryPerDivision = series;

  const limitedSeries=[];
  const MAX_MONTH_DIFF = 4;
  series.forEach(seriesItem => {
    seriesItem.data.forEach(dataPoint => {
      let matchingSeries = limitedSeries.find(x => x.divisionShortName === seriesItem.divisionShortName);
      if (!matchingSeries) {
        const newSeriesItemWithoutRankData = { ...seriesItem}; 
        newSeriesItemWithoutRankData.data = newSeriesItemWithoutRankData.data.slice(0,1); //Add first ranking, but nothing more
        limitedSeries.push(newSeriesItemWithoutRankData);
      } else {
        const prevDataInThisSeriesItem = matchingSeries.data.length > 0 ? matchingSeries.data[matchingSeries.data.length - 1] : null;
        if (prevDataInThisSeriesItem) {
          const absoluteMonthDiff = Math.abs((dataPoint.dateObj.getFullYear()*12 + dataPoint.dateObj.getMonth() ) - (prevDataInThisSeriesItem.dateObj.getFullYear()*12 + prevDataInThisSeriesItem.dateObj.getMonth() ));
          if (absoluteMonthDiff > MAX_MONTH_DIFF) {
            const dataPointToPush = {...dataPoint};
            matchingSeries.data.push(dataPointToPush);
          }
        }
      }
    });
  });
  fighter.limitedRankHistoryPerDivision = limitedSeries;

  return fighter;
}

var port = process.env.PORT || 8001;
console.log('Server listening on:' + port);
app.listen(port);
console.info(`Navigate to http://localhost:${port}/`);