const fs = require('fs');
const config = require("exp-config");

const wikipediaApi = require('../backend/wikipediaApi.js');
const fileHelper = require('../backend/fileHelper.js');
const viewBuilder = require('../backend/viewBuilder.js');

global.fightersWithProfileLinks = JSON.parse(fs.readFileSync("data/allFighters.json"));
global.rankData = JSON.parse(fs.readFileSync("data/mmaStats.json"));

async function scrapeListOfFighters(inputFighters) {
  config.SAVE_JSON_TO_FILE = true;
  //expected input: [{ url: "wiki/Leon_Edwards" }, { url: "wiki/Jan_B%C5%82achowicz"} ]
  inputFighters = [
    // { url:"/wiki/Muhammad_Mokaev" },
    // { url:"/wiki/Tagir_Ulanbekov" },
    // { url:"/wiki/Karol_Rosa" },
    // { url:"/wiki/Julia_Avila" },
    // { url:"/wiki/Norma_Dumont" },
    // { url:"/wiki/Erin_Blanchfield" },
    // { url:"/wiki/Casey_O%27Neill" },
    // { url:"/wiki/Tracy_Cortez" },
    // { url:"/wiki/Virna_Jandiroba" },
    // { url:"/wiki/Michelle_Waterson" },
    // { url:"/wiki/Emily_Ducote" },
  ];
  //Note: avoid running this on a huge array to avoid scraper blockers
  console.log("scrapeListOfFighters", inputFighters);

  //Alternative: update from data/allFighters.json
  // const fileNames = pizza.map(x => x.fileName);
  // const inputFighters = fileNames.map((fileName) => {
  //   const fighter = JSON.parse(fs.readFileSync("data/fighters/" + fileName));
  //   const wikiUrl = fighter.fighterInfo.wikiUrl;
  //   return {url: wikiUrl};
  // });

  const readExistingFromFile = false;
  const allowFetchingMissingFighters = true;
  const fighterBasicData = await wikipediaApi.fetchArrayOfFighters(inputFighters, readExistingFromFile, allowFetchingMissingFighters);
  const fighters = await Promise.all(fighterBasicData.map(fighter => viewBuilder.extendFighterApiDataWithRecordInfo(fighter, global.rankData)));
  fileHelper.updateListOfFighterFiles();
  console.log("done", fighters);
  return;
}

scrapeListOfFighters();