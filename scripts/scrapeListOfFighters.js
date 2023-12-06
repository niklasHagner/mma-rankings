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
  const fetchImages = true;
  const fighterBasicData = await wikipediaApi.fetchArrayOfFighters(inputFighters, readExistingFromFile, allowFetchingMissingFighters, fetchImages);
  await Promise.allSettled(fighterBasicData.map(fighter => viewBuilder.extendFighterApiDataWithRecordInfo(fighter, global.rankData)));
  fileHelper.updateListOfFighterFiles();
  console.log("done");
  return;
}

//Potential name issues: Jacare Souza, Fabricio Werdum, Rogerio Nogueira

inputFighters = [
    { url: '/wiki/Alex_Oliveira' },
    { url: '/wiki/Antonina_Shevchenko' },
    { url: '/wiki/Mara_Romero_Borella' },
    { url: '/wiki/Omari_Akhmedov' },



    /*
Mike Easton
Chris Cariaso
Louis Gaudinot
Darren Uyenoyama
Sarah Kaufman
Julie Kedzie
Mark Munoz
Francis Carmont
Tim Boetsch
Jake Ellenberger
TJ Grant
Josh Thomson
Erik Koch
    
    */
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