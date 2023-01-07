const fs = require('fs');

const wikipediaApi = require('../backend/wikipediaApi.js');
const fileHelper = require('../backend/fileHelper.js');
const viewBuilder = require('../backend/viewBuilder.js');

const fightersWithProfileLinksRaw = fs.readFileSync("data/allFighters.json");
global.fightersWithProfileLinks = JSON.parse(fightersWithProfileLinksRaw);

let mmaStatsRaw = fs.readFileSync("data/mmaStats.json");
global.rankData = JSON.parse(mmaStatsRaw);

async function scrapeListOfFighters(inputFighters) {
  //expected input: [{ url: "wiki/Leon_Edwards" }, { url: "wiki/Jan_B%C5%82achowicz"} ]
  inputFighters = [{ url: "wiki/Jan_B%C5%82achowicz"} ];
  //Note: avoid running this on a huge array to avoid scraper blockers
  console.log("scrapeListOfFighters", inputFighters);

  //Alternative: update from data/allFighters.json
  // const fileNames = pizza.map(x => x.fileName);
  // const inputFighters = fileNames.map((fileName) => {
  //   const fighter = JSON.parse(fs.readFileSync("data/fighters/" + fileName));
  //   const wikiUrl = fighter.fighterInfo.wikiUrl;
  //   return {url: wikiUrl};
  // });

  const alwaysFetchFromNetwork = true;
  const fighterBasicData = await wikipediaApi.fetchArrayOfFighters(inputFighters, alwaysFetchFromNetwork);
  const fighters = await Promise.all(fighterBasicData.map(fighter => viewBuilder.extendFighterApiDataWithRecordInfo(fighter, global.rankData)));
  fileHelper.updateListOfFighterFiles();
  console.log("done", fighters);
  return;
}

scrapeListOfFighters();