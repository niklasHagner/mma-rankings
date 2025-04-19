const fs = require('fs');
const config = require("exp-config");

const wikipediaApi = require('../backend/wikipediaApi.js');
const fileHelper = require('../backend/fileHelper.js');
const viewBuilder = require('../backend/viewBuilder.js');

global.fightersWithProfileLinks = JSON.parse(fs.readFileSync("data/allFighters.json"));
global.rankData = JSON.parse(fs.readFileSync("data/mmaStats.json"));


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


//Potential name issues: Jacare Souza, Fabricio Werdum, Rogerio Nogueira
// { "name": "Carlston Harris", "url": "/wiki/Carlston_Harris" },

let inputFighters = [

    { name: 'Marcin Tybura', url: '/wiki/Marcin_Tybura' },
    { name: 'Marvin Vettori', url: '/wiki/Marvin_Vettori' },
    { name: 'Maurício Ruffy', url: '/wiki/Maur%C3%ADcio_Ruffy' },
    { name: 'Michael Chandler', url: '/wiki/Michael_Chandler' },
    {
      name: 'Michał Oleksiejczuk',
      url: '/wiki/Micha%C5%82_Oleksiejczuk'
    },
    { name: 'Mick Parkin', url: '/wiki/Mick_Parkin' },
    { name: 'Molly McCann', url: '/wiki/Molly_McCann' },
    { name: 'Nasrat Haqparast', url: '/wiki/Nasrat_Haqparast' },
    { name: 'Nathaniel Wood', url: '/wiki/Nathaniel_Wood_(fighter)' },
    { name: 'Nikita Krylov', url: '/wiki/Nikita_Krylov' },
    { name: 'Nora Cornolle', url: '/wiki/Nora_Cornolle' },
    { name: "Ode' Osbourne", url: '/wiki/Ode%27_Osbourne' },
    { name: 'Paddy Pimblett', url: '/wiki/Paddy_Pimblett' },
    { name: 'Pat Sabatini', url: '/wiki/Pat_Sabatini' },
    { name: 'Patrício Pitbull', url: '/wiki/Patr%C3%ADcio_Pitbull' },
    { name: 'Priscila Cachoeira', url: '/wiki/Priscila_Cachoeira' },
];

function fillArrayWithRankedFightersMissingFiles() {
    const latestRankings = global.rankData.dates[0];

    // Initialize an array to hold fighters with undefined return values
    const missingRankedFighters = [];
    // Iterate through the fighters array
    latestRankings.divisions.forEach(division => {
        division.fighters.map(x => ({name: x.name, url: x.link})).forEach(fighter => {
            if (!fighter.url) {
                console.log("This fighter lacks wikipedia url", fighter);
            } else {
                const result = fileHelper.readFileByFighterObj(fighter);
                if (!result) {
                    missingRankedFighters.push(fighter);
                }
            }
            
        });
    });

    return missingRankedFighters;
}

async function scrapeInBatchesWithWaits() {
    let minutes = 1;

    const missingRankedFighters = fillArrayWithRankedFightersMissingFiles();
    inputFighters = inputFighters.concat(missingRankedFighters);

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