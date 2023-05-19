const fs = require('fs');
const config = require("exp-config");

const wikipediaApi = require('../backend/wikipediaApi.js');
const fileHelper = require('../backend/fileHelper.js');
const viewBuilder = require('../backend/viewBuilder.js');
const { uniqueBy } = require("../backend/arrHelper");


global.fightersWithProfileLinks = JSON.parse(fs.readFileSync("data/allFighters.json"));
global.rankData = JSON.parse(fs.readFileSync("data/mmaStats.json"));

async function scrapeListOfFighters() {
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

  const pastEventObj = await wikipediaApi.getNamesAndUrlsOfFightersInPastEvent("2023-04-23", "2023-05-18");
  const allEvents = pastEventObj.allEvents;
  let inputFighters = allEvents.map(event => event.fighters).flat().filter(x => x.url);
  inputFighters = uniqueBy(inputFighters, "url");
  console.log("inputFighters:", inputFighters);

  debugger; //Set a debugger here to grab the list of fighters that need scraping. Example data: [{ name: 'Matt Brown', url: '/wiki/Matt_Brown_(fighter)' } ]

  const readExistingFromFile = false;
  const allowFetchingMissingFighters = true;
  const fetchImages = false;
  const fighterBasicData = await wikipediaApi.fetchArrayOfFighters(inputFighters, readExistingFromFile, allowFetchingMissingFighters, fetchImages);
  const fighters = await Promise.all(fighterBasicData.map(fighter => viewBuilder.extendFighterApiDataWithRecordInfo(fighter, global.rankData)));
  fileHelper.updateListOfFighterFiles();
  console.log("done");
  return;
}

scrapeListOfFighters();