const express = require("express");
const app = express();
const nunjucks = require("nunjucks");
const fs = require('fs');
const path = require('path');
const winston = require('winston');
const moment = require("moment");

const mmaStatsScraper = require('./backend/scrapeMmaStatsDotCom');
const { findRankAtTime, getCurrentRank } = require('./backend/findRank.js');
const { search } = require('./backend/search.js');
const wikipediaApi = require('./backend/wikipediaApi.js');
const viewBuilder = require('./backend/viewBuilder.js');
const fileHelper = require('./backend/fileHelper.js');
const { divisionAbbreviation, removeDiacritics } = require('./backend/stringAndHtmlHelper.js');
const { missingFightersHashMap, aliasesToFileNameHashMap } = require('./data/allFightersMissingOrAliased.js');

const mmaStatsJsonRaw = fs.readFileSync("data/mmaStats.json");
const mmaStatsJson = JSON.parse(mmaStatsJsonRaw);
global.rankData = mmaStatsJson;
global.fightersWithProfileLinks = JSON.parse(fs.readFileSync("data/allFighters.json"));
global.missingFightersHashMap = missingFightersHashMap;
global.aliasesToFileNameHashMap = aliasesToFileNameHashMap;
global.fightersWithProfileLinks_hashMap = global.fightersWithProfileLinks.reduce((map, obj) => { // Use fileName as key - to simplify lookups. Example: 'Jos%C3%A9Aldo.json
    map[obj.fileName] = obj;
    return map;
}, {});
global.fightersWithProfiles_optimizedMap = preprocessFighters(global.fightersWithProfileLinks); // Preprocess the fighters list for faster access
function preprocessFighters(fighters) {
  const fightersMap = new Map();

  fighters.forEach(fighter => {
    const namesToConsider = [
    fighter.fighterAnsiName,
    fighter.wikipediaNameWithDiacritics,
    fighter.alternativeName,
    fighter.mmaStatsName,
    ].filter(Boolean); // Remove undefined or null values

    namesToConsider.forEach(name => {
    const lowerCaseName = removeDiacritics(name.toLowerCase());
    // Store the reference to the fighter object against each name variant
    fightersMap.set(lowerCaseName, fighter);
    });
  });

  return fightersMap;
}

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
  express: app })
  .addGlobal("getFighterNameOrLinkHtml", viewBuilder.getFighterNameOrLinkHtml)
  .addGlobal("getCurrentRank", getCurrentRank)
  .addGlobal("isDateInPast", (date) => { 
    const now = new Date();
    const inputDate = new Date(date);
    const isOld = moment(inputDate).isBefore(now, "day");
    return isOld;
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

winston.configure({
  transports: [
    new (winston.transports.File)({ filename: 'app.log' })
  ]
});

// This function has two variants
// Static: index.html
// Dynamic: events.njk. This takes about 25 seconds to render due to hundreds of fighter lookup calls
app.get('/', async function (req, res, next) {
  // --- STATIC index.html ---
//   const storedHtml = path.join(__dirname, 'data', 'index.html');
//   // Send the file to the client
//   return res.sendFile(storedHtml);
  
  // --- DYNAMIC TEMPLATE RENDERING ---
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
  const timeBeforeRender = performance.now();
  
  res.render("events.njk", viewModel, (err, html) => {
    if (err) return next(err);
    const timeAfterRender = performance.now();
    const secondsTaken = ((timeAfterRender - timeBeforeRender) / 1000).toFixed(2);; // Convert milliseconds to seconds
    console.log(`Rendering events.njk took ${secondsTaken} seconds.`)
    res.send(html);
  });
});

// user input search
app.get('/search', search);
  
// Look up ranking of an opponent at the time of the fight
app.get('/searchForNameAndDate', function (req, res) {
  const name = req.query.name || "Jon Jones";
  const date = req.query.date || "2016-01-02";

  const rank = findRankAtTime(global.rankData, name, date);
  return res.json({ "mostRecentMatch": rank });
});

// Used by viewBuilder to render fighter.njk
// name should a match a filename in data/fighters/*.json 
// Examples: "Jan_B%C5%82achowicz"  or "Jon_Jones" 
app.get('/fighter/:name', async function (req, res, next) {
  const name = req.params.name;
  let encodedName = encodeURIComponent(name);
  let fighter = await fileHelper.readFileByShortFileName(encodedName);
  if (!fighter) {
    return res.status(404).render("404.njk");
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

app.get('/rankings', async function (req, res, next) {
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

    return res.render("rankings.njk", viewModel, (err, html) => {
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

// Catch-all for routes that are not found
app.use((req, res, next) => {
    return res.status(404).render("404.njk");
});

async function getEvents(rankingsData) {
  const data = await wikipediaApi.getInfoAndFightersFromNextEvents();
  data.events = data.events.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const t1 = performance.now();
  const asyncRes = await Promise.all(data.events.map(async (event) => {
    const fighters = await Promise.all(event.fighters.map(fighter => viewBuilder.extendFighterApiDataWithRecordInfo(fighter, rankingsData)));
    return { ...event, fighters };
  }));
  const t2 = performance.now();
  const secondsTaken = ((t2 - t1) / 1000, 2).toFixed(2); // Convert milliseconds to seconds
  console.log(`Fetching event data took ${secondsTaken} seconds.`)
  return asyncRes;
}

// Startup 
const lastScapedStatsDate = global.rankData.dates[0].date;
console.log(`The last rank is dated ${lastScapedStatsDate}. Maybe it's time to run 'npm run scrapeLatestRankings'`);

var port = process.env.PORT || 8001;
console.log('Server listening on:' + port);
app.listen(port);
console.info(`Navigate to http://localhost:${port}/`);
