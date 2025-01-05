const fs = require('fs');
const config = require("exp-config");

const wikipediaApi = require('../backend/wikipediaApi.js');
const fileHelper = require('../backend/fileHelper.js');
const viewBuilder = require('../backend/viewBuilder.js');

global.fightersWithProfileLinks = JSON.parse(fs.readFileSync("data/allFighters.json"));
global.rankData = JSON.parse(fs.readFileSync("data/mmaStats.json"));

/* Fighters with problematic wikipedia pages that we struggle to scrape:*/
// { name: 'Austen Lane', url: '/wiki/Austen_Lane' },
// "/wiki/Tatiana_Suarez",
// Low amount of wikipediaTable cells (9) for Raoni Barcelos
// Low amount of wikipediaTable cells (9) for Marcin Tybura

// error parsing
// {
//     name: "Chidi Njokuani",
//     url: "/wiki/Chidi_Njokuani",
//   },

// emtpy file

// {
//     "name": "Derrick Lewis",
//     "url": "/wiki/Derrick_Lewis"
// },


// {
//     "name": "Diana Belbiţă",
//     "url": "/wiki/Diana_Belbi%C5%A3%C4%83"
// },

async function scrapeListOfFighters(inputFighters) {
    config.SAVE_JSON_TO_FILE = true;
    //Example input: [{ url: "wiki/Leon_Edwards" }, { url: "wiki/Jan_B%C5%82achowicz"} ]
    //Note: avoid running this on a huge array to avoid scraper blockers

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
// { "name": "Carlston Harris", "url": "/wiki/Carlston_Harris" },



let inputFighters = [
   
];

async function scrapeInBatchesWithWaits() {
    let minutes = 1;
    const clonedInputFighters = [...inputFighters];
    for (let i = 0; i < clonedInputFighters.length; i++) {
        const inputFighterBatch = clonedInputFighters.splice(0, 6);
        await scrapeListOfFighters(inputFighterBatch);
        minutes = Math.min(minutes * 1.5, 6);

        if (clonedInputFighters.length > 0) {
            console.log(`Iteration complete, waiting for ${minutes} minutes`);
            await wait(1 * 1000 * 60 * minutes);
        }
    }
    console.log("scrapeInBatchesWithWaits done");
}

function wait(ms) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve();
        }, ms)
    });
}

scrapeInBatchesWithWaits();