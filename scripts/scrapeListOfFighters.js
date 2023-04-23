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
  inputFighters = [
    // "/wiki/%C4%BDudov%C3%ADt_Klein",
    // "/wiki/Abdul_Razak_Alhassan",
    // "/wiki/Alexander_Romanov_(fighter)",
    // "/wiki/Alonzo_Menifield",
    // "/wiki/Andr%C3%A9_Muniz",
    // "/wiki/Anshul_Jubli",
    // "/wiki/Brendan_Allen",
    // "/wiki/Bruno_Gustavo_da_Silva",
    // "/wiki/Carlston_Harris",
    // "/wiki/Casey_O%27Neill",
    // "/wiki/Cody_Stamann",
    // "/wiki/Du%C5%A1ko_Todorovi%C4%87",
    // "/wiki/Elise_Reed",
    // "/wiki/Erin_Blanchfield",
    // "/wiki/Gregory_Rodrigues",
    // "/wiki/Guido_Cannetti",
    // "/wiki/Ian_Garry",
    // "/wiki/J%C3%A9ssica_Andrade",
    // "/wiki/J%C3%A9ssica_Andrade",
    // "/wiki/JJ_Aldrich",
    // "/wiki/Jack_Della_Maddalena",
    // "/wiki/Jack_Shore",
    // "/wiki/Jai_Herbert",
    // "/wiki/Jailton_Almeida",
    // "/wiki/Jamall_Emmers",
    // "/wiki/Jamie_Mullarkey",
    // "/wiki/Jamie_Pickett",
    // "/wiki/Jeka_Saragih",
    // "/wiki/Joe_Solecki",
    // "/wiki/Jonathan_Martinez",
    // "/wiki/Josh_Parisian",
    // "/wiki/Joshua_Culibao",
    // "/wiki/Julian_Marquez",
    // "/wiki/Jun_Yong_Park",
    // "/wiki/Justin_Tafa",
    // "/wiki/Ketlen_Vieira",
    // "/wiki/Kyle_Nelson_(fighter)",
    // "/wiki/Lauren_Murphy",
    // "/wiki/Lerone_Murphy",
    // "/wiki/Lina_L%C3%A4nsberg",
    // "/wiki/Loma_Lookboonmee",
    // "/wiki/Luana_Carolina",
    // "/wiki/Makwan_Amirkhani",
    // "/wiki/Marc-Andr%C3%A9_Barriault",
    // "/wiki/Marcin_Prachnio",
    // "/wiki/Marcin_Tybura",
    // "/wiki/Mario_Bautista",
    // "/wiki/Maur%C3%ADcio_Rua",
    // "/wiki/Mayra_Bueno_Silva",
    // "/wiki/Melsik_Baghdasaryan",
    // "/wiki/Modestas_Bukauskas",
    // "/wiki/Montana_De_La_Rosa",
    // "/wiki/Mounir_Lazzez",
    // "/wiki/Nassourdine_Imavov",
    // "/wiki/Philipe_Lins",
    // "/wiki/Punahele_Soriano",
    // "/wiki/Randy_Brown_(fighter)",
    // "/wiki/Raoni_Barcelos",
    // "/wiki/Rinya_Nakamura",
    // "/wiki/Roman_Dolidze",
    // "/wiki/Roman_Kopylov",
    // "/wiki/Sergey_Spivak",
    // "/wiki/Shamil_Abdurakhimov",
    // "/wiki/Shane_Young",
    // "/wiki/Song_Kenan",
    // "/wiki/Terrance_McKinney",
    // "/wiki/Thiago_Mois%C3%A9s",
    // "/wiki/Tony_Gravely",
    // "/wiki/Trevin_Jones",
    // "/wiki/Tyson_Nam",
  ];

//   Problematic
// "/wiki/Tatiana_Suarez",
// kron
  
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
  const fetchImages = false;
  const fighterBasicData = await wikipediaApi.fetchArrayOfFighters(inputFighters, readExistingFromFile, allowFetchingMissingFighters, fetchImages);
  const fighters = await Promise.all(fighterBasicData.map(fighter => viewBuilder.extendFighterApiDataWithRecordInfo(fighter, global.rankData)));
  fileHelper.updateListOfFighterFiles();
  console.log("done", fighters);
  return;
}

scrapeListOfFighters();