const config = require("exp-config");
const wikipediaApi = require('../backend/wikipediaApi.js');
const fileHelper = require('../backend/fileHelper.js');

async function scrapeListOfFighters(inputFighters) {
  console.log("scrapeListOfFighters");
  //expected input: [{ url: "wiki/Leon_Edwards" }, { url: "wiki/Jan_B%C5%82achowicz"} ]
  //Note: avoid running this on a huge array to avoid scraper blockers

  //Alternative: update from data/allFighters.json
  // const fileNames = pizza.map(x => x.fileName);
  // const inputFighters = fileNames.map((fileName) => {
  //   const fighter = JSON.parse(fs.readFileSync("data/fighters/" + fileName));
  //   const wikiUrl = fighter.fighterInfo.wikiUrl;
  //   return {url: wikiUrl};
  // });

  const alwaysFetchFromNetwork = true;
  const fighterBasicData = await wikipediaApi.fetchArrayOfFighters(inputFighters, alwaysFetchFromNetwork);
  const rankingsData = await getRankingsFromFile();
  const extendedFighters = await Promise.all(fighterBasicData.map(fighter => extendFighterApiDataWithRecordInfo(fighter, rankingsData)));
  fileHelper.updateListOfFighterFiles();
  console.log("done");
  return;
}

scrapeListOfFighters();