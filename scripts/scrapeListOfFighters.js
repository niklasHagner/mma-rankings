const fs = require('fs');
const config = require("exp-config");

const wikipediaApi = require('../backend/wikipediaApi.js');
const fileHelper = require('../backend/fileHelper.js');
const viewBuilder = require('../backend/viewBuilder.js');

global.fightersWithProfileLinks = JSON.parse(fs.readFileSync("data/allFighters.json"));
global.rankData = JSON.parse(fs.readFileSync("data/mmaStats.json"));

/*Problematic*/
// { name: 'Austen Lane', url: '/wiki/Austen_Lane' },


async function scrapeListOfFighters(inputFighters) {
  config.SAVE_JSON_TO_FILE = true;
  //Example input: [{ url: "wiki/Leon_Edwards" }, { url: "wiki/Jan_B%C5%82achowicz"} ]
  //Note: avoid running this on a huge array to avoid scraper blockers

  //---Problematic fighters---
  // "/wiki/Tatiana_Suarez",
  // Low amount of wikipediaTable cells (9) for Raoni Barcelos

  // error parsing
  // {
  //     name: "Chidi Njokuani",
  //     url: "/wiki/Chidi_Njokuani",
  //   },

  console.log("scrapeListOfFighters", inputFighters);


  const readExistingFromFile = false;
  const allowFetchingMissingFighters = true;
  const fetchImages = false;
  const fighterBasicData = await wikipediaApi.fetchArrayOfFighters(inputFighters, readExistingFromFile, allowFetchingMissingFighters, fetchImages);
  await Promise.allSettled(fighterBasicData.map(fighter => viewBuilder.extendFighterApiDataWithRecordInfo(fighter, global.rankData)));
  fileHelper.updateListOfFighterFiles();
  console.log("done");
  return;
}

inputFighters = [
    { url: '/wiki/Roxanne_Modafferi' },
    { url: '/wiki/Jessica_Eye' },
    { url: '/wiki/Alexis_Davis_(fighter)' },
    { url: '/wiki/Marion_Reneau' },
    { url: '/wiki/Henrique_da_Silva_(fighter)' },
    { url: '/wiki/Gleison_Tibau' },
    { url: '/wiki/Felice_Herrig' },
    { url: '/wiki/Fábio_Maldonado' },


];

async function scrapeInBatchesWithWaits() {
  let minutes = 1;
  const clonedInputFighters = [...inputFighters];
  for (let i = 0; i < clonedInputFighters.length; i++) {
    const inputFighterBatch = clonedInputFighters.splice(0,6);
    await scrapeListOfFighters(inputFighterBatch);
    minutes = minutes * 1.5;

    if (clonedInputFighters.length > 0) {
      console.log(`Iteration complete, waiting for ${minutes} minutes`);
      await wait(1*1000*60* minutes);
    }
  }
  console.log("scrapeInBatchesWithWaits done");
}

function wait(ms) {
  return new Promise((resolve,reject) => {
    setTimeout(() => {
      resolve();
    }, ms)
  });
}

scrapeInBatchesWithWaits();