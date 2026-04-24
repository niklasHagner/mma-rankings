const fs = require('fs');
const config = require("exp-config");

const wikipediaApi = require('../backend/wikipediaApi.js');
const fileHelper = require('../backend/fileHelper.js');
const viewBuilder = require('../backend/viewBuilder.js');
const { getEvents } = require("../app.js");
const { uniqueBy } = require("../backend/arrHelper");
const { scrapeListOfFighters } = require("./scrapeListOfFighters.js");

global.fightersWithProfileLinks = JSON.parse(fs.readFileSync("data/allFighters.json"));
global.rankData = JSON.parse(fs.readFileSync("data/mmaStats.json"));

async function updateFighters() {
  config.SAVE_JSON_TO_FILE = true;

//Example output: 
//   {
//     allEvents: [
//       {
//         fighters: [
//           {
//             name: "Edmen Shahbazyan",
//             url: "/wiki/Edmen_Shahbazyan",
//           }
//         ],
//         eventName: "UFC Fight Night 225",
//         url: "https://en.wikipedia.org/wiki/UFC_Fight_Night_225",
//         date: "May 20, 2023",
//         venue: "TBD",
//         location: "TBD",
//       },
//     ]
//   }

  const pastEventObj = await wikipediaApi.getNamesAndUrlsOfFightersInPastEvents();
  const allEvents = pastEventObj.allEvents;
  let inputFighters = allEvents.map(event => event.fighters).flat().filter(x => x.url);
  inputFighters = uniqueBy(inputFighters, "url");
  inputFighters = inputFighters.sort((a, b) => a.name.localeCompare(b.name));
  console.log("inputFighters:", inputFighters);

  await scrapeInBatchesWithWaits(inputFighters);
  global.SCRAPE_FUTURE_EVENT_DETAILS=true;
  await getEvents(global.rankData);

//   fs.writeFileSync("data/fightersToScrape.js", JSON.stringify(inputFighters, null, 2));
//   const readExistingFromFile = false;
//   const allowFetchingMissingFighters = true;
//   const fetchImages = false;
//   const fighterBasicData = await wikipediaApi.fetchArrayOfFighters(inputFighters, readExistingFromFile, allowFetchingMissingFighters, fetchImages);
//   const fighters = await Promise.all(fighterBasicData.map(fighter => viewBuilder.extendFighterApiDataWithRecordInfo(fighter, global.rankData)));
//   fileHelper.updateListOfFighterFiles();
//   console.log("done");
//   return;
}

async function scrapeInBatchesWithWaits(inputFighters) {
  let minutes = 1;
  const fightersToScrape = [...inputFighters];

  while (fightersToScrape.length > 0) {
    const inputFighterBatch = fightersToScrape.splice(0, 6);
    await scrapeListOfFighters(inputFighterBatch);
    minutes = Math.min(minutes * 1.5, 6);

    if (fightersToScrape.length > 0) {
      console.log(`Iteration complete, waiting for ${minutes} minutes`);
      await wait(1 * 1000 * 60 * minutes);
    }
  }

  console.log("scrapeInBatchesWithWaits done");
}

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

updateFighters().catch((error) => {
  console.error(error);
  process.exit(1);
});