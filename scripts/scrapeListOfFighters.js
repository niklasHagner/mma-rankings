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
 { name: 'Adrian Yañez', url: '/wiki/Adrian_Ya%C3%B1ez' },
  { name: 'Ailín Pérez', url: '/wiki/Ail%C3%ADn_P%C3%A9rez' },
  { name: 'Alexa Grasso', url: '/wiki/Alexa_Grasso' },
  { name: 'Amanda Lemos', url: '/wiki/Amanda_Lemos' },
  { name: 'Andre Fili', url: '/wiki/Andre_Fili' },
  { name: 'Ante Delija', url: '/wiki/Ante_Delija' },
  { name: 'Anthony Hernandez', url: '/wiki/Anthony_Hernandez' },
  { name: 'Austen Lane', url: '/wiki/Austen_Lane' },
  { name: 'Azamat Bekoev', url: '/wiki/Azamat_Bekoev' },
  { name: 'Beatriz Mesquita', url: '/wiki/Beatriz_Mesquita' },
  { name: 'Brad Tavares', url: '/wiki/Brad_Tavares' },
  { name: 'Brandon Moreno', url: '/wiki/Brandon_Moreno' },
  {
    name: 'Bruno Gustavo da Silva',
    url: '/wiki/Bruno_Gustavo_da_Silva'
  },
  { name: 'Caio Borralho', url: '/wiki/Caio_Borralho' },
  { name: "Casey O'Neill", url: '/wiki/Casey_O%27Neill' },
  { name: 'Charles Johnson', url: '/wiki/Charles_Johnson_(fighter)' },
  { name: 'Charles Oliveira', url: '/wiki/Charles_Oliveira' },
  { name: 'Chase Hooper', url: '/wiki/Chase_Hooper' },
  { name: 'Chidi Njokuani', url: '/wiki/Chidi_Njokuani' },
  { name: 'Chris Curtis', url: '/wiki/Chris_Curtis_(fighter)' },
  { name: 'Chris Duncan', url: '/wiki/Chris_Duncan_(fighter)' },
  {
    name: 'Christian Leroy Duncan',
    url: '/wiki/Christian_Leroy_Duncan'
  },
  { name: 'Cody Brundage', url: '/wiki/Cody_Brundage' },
  { name: 'Cody Durden', url: '/wiki/Cody_Durden' },
  { name: 'Cody Garbrandt', url: '/wiki/Cody_Garbrandt' },
  {
    name: 'Cristian Quiñónez',
    url: '/wiki/Cristian_Qui%C3%B1%C3%B3nez'
  },
  { name: 'Dan Ige', url: '/wiki/Dan_Ige' },
  { name: 'Daniel Zellhuber', url: '/wiki/Daniel_Zellhuber' },
  {
    name: 'David Martínez',
    url: '/wiki/David_Mart%C3%ADnez_(fighter)'
  },
  {
    name: 'Douglas Silva de Andrade',
    url: '/wiki/Douglas_Silva_de_Andrade'
  },
  { name: 'Drew Dober', url: '/wiki/Drew_Dober' },
  { name: 'Édgar Cháirez', url: '/wiki/%C3%89dgar_Ch%C3%A1irez' },
  { name: 'Eryk Anders', url: '/wiki/Eryk_Anders' },
  { name: 'Geoff Neal', url: '/wiki/Geoff_Neal' },
  { name: 'Gillian Robertson', url: '/wiki/Gillian_Robertson' },
  { name: 'Gregory Rodrigues', url: '/wiki/Gregory_Rodrigues' },
  { name: 'Ignacio Bahamondes', url: '/wiki/Ignacio_Bahamondes' },
  { name: 'Ion Cuțelaba', url: '/wiki/Ion_Cu%C8%9Belaba' },
  { name: 'Israel Adesanya', url: '/wiki/Israel_Adesanya' },
  { name: 'Iwo Baraniewski', url: '/wiki/Iwo_Baraniewski' },
  { name: 'Joe Pyfer', url: '/wiki/Joe_Pyfer' },
  { name: 'Jordan Leavitt', url: '/wiki/Jordan_Leavitt' },
  { name: 'Joselyne Edwards', url: '/wiki/Joselyne_Edwards' },
  { name: 'Josh Emmett', url: '/wiki/Josh_Emmett' },
  { name: 'Julian Erosa', url: '/wiki/Julian_Erosa' },
  { name: 'Kai Kamaka III', url: '/wiki/Kai_Kamaka_III' },
  { name: 'Kevin Vallejos', url: '/wiki/Kevin_Vallejos' },
  { name: 'King Green', url: '/wiki/King_Green' },
  { name: 'Kyle Nelson', url: '/wiki/Kyle_Nelson_(fighter)' },
  { name: 'Lando Vannata', url: '/wiki/Lando_Vannata' },
  { name: 'Lerone Murphy', url: '/wiki/Lerone_Murphy' },
  { name: "Lone'er Kavanagh", url: '/wiki/Lone%27er_Kavanagh' },
  { name: 'Losene Keita', url: '/wiki/Losene_Keita' },
  { name: 'Macy Chiasson', url: '/wiki/Macy_Chiasson' },
  { name: 'Marcin Tybura', url: '/wiki/Marcin_Tybura' },
  { name: 'Marlon Vera', url: '/wiki/Marlon_Vera' },
  { name: 'Mason Jones', url: '/wiki/Mason_Jones_(fighter)' },
  { name: 'Max Holloway (c)', url: '/wiki/Max_Holloway' },
  { name: 'Maycee Barber', url: '/wiki/Maycee_Barber' },
  { name: 'Melissa Gatto', url: '/wiki/Melissa_Gatto' },
  { name: 'Michael Chiesa', url: '/wiki/Michael_Chiesa' },
  { name: 'Michael Johnson', url: '/wiki/Michael_Johnson_(fighter)' },
  { name: 'Michael Page', url: '/wiki/Michael_Page' },
  { name: 'Michel Pereira', url: '/wiki/Michel_Pereira' },
  { name: 'Movsar Evloev', url: '/wiki/Movsar_Evloev' },
  { name: 'Myktybek Orolbai', url: '/wiki/Myktybek_Orolbai' },
  { name: 'Nathaniel Wood', url: '/wiki/Nathaniel_Wood_(fighter)' },
  { name: 'Niko Price', url: '/wiki/Niko_Price' },
  { name: 'Nora Cornolle', url: '/wiki/Nora_Cornolle' },
  { name: "Ode' Osbourne", url: '/wiki/Ode%27_Osbourne' },
  { name: 'Philip Rowe', url: '/wiki/Philip_Rowe' },
  { name: 'Punahele Soriano', url: '/wiki/Punahele_Soriano' },
  { name: 'Ramiz Brahimaj', url: '/wiki/Ramiz_Brahimaj' },
  { name: 'Raul Rosas Jr.', url: '/wiki/Raul_Rosas_Jr.' },
  { name: 'Reinier de Ridder', url: '/wiki/Reinier_de_Ridder' },
  { name: 'Renato Moicano', url: '/wiki/Renato_Moicano' },
  { name: 'Ricky Simón', url: '/wiki/Ricky_Sim%C3%B3n' },
  { name: 'Rob Font', url: '/wiki/Rob_Font' },
  { name: 'Robert Ruchała', url: '/wiki/Robert_Rucha%C5%82a' },
  { name: 'Roman Dolidze', url: '/wiki/Roman_Dolidze' },
  { name: 'Sam Hughes', url: '/wiki/Sam_Hughes_(fighter)' },
  { name: 'Sean Strickland', url: '/wiki/Sean_Strickland' },
  { name: 'Serghei Spivac', url: '/wiki/Serghei_Spivac' },
  { name: 'Su Mudaerji', url: '/wiki/Su_Mudaerji' },
  { name: 'Tabatha Ricci', url: '/wiki/Tabatha_Ricci' },
  { name: 'Terrance McKinney', url: '/wiki/Terrance_McKinney' },
  { name: 'Tofiq Musayev', url: '/wiki/Tofiq_Musayev' },
  { name: 'Uroš Medić', url: '/wiki/Uro%C5%A1_Medi%C4%87' },
  { name: 'Virna Jandiroba', url: '/wiki/Virna_Jandiroba' },
  { name: 'Vitor Petrino', url: '/wiki/Vitor_Petrino' },
  { name: 'Yousri Belgaroui', url: '/wiki/Yousri_Belgaroui' },
  { name: 'Zachary Reese', url: '/wiki/Zachary_Reese' }

];

function fillArrayWithRankedFightersMissingFiles() {
    const latestRankings = global.rankData.dates[0];

    // Initialize an array to hold fighters with undefined return values
    const missingRankedFighters = [];
    // Iterate through the fighters array
    latestRankings.divisions.forEach(division => {
        division.fighters.map(x => ({ name: x.name, url: x.link })).forEach(fighter => {
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

module.exports = {
    scrapeListOfFighters
}