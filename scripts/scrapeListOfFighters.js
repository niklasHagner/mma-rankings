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
  
  {
    name: "Malcolm Gordon",
    url: "/wiki/Malcolm_Gordon_(fighter)",
  },
  {
    name: "Joanne Wood",
    url: "/wiki/Joanne_Wood",
  },
  {
    name: "Luana Carolina",
    url: "/wiki/Luana_Carolina",
  },
  {
    name: "Jai Herbert",
    url: "/wiki/Jai_Herbert",
  },
  {
    name: "Ľudovít Klein",
    url: "/wiki/%C4%BDudov%C3%ADt_Klein",
  },
  {
    name: "Veronica Hardy",
    url: "/wiki/Veronica_Hardy",
  },
  {
    name: "JJ Aldrich",
    url: "/wiki/JJ_Aldrich",
  },
  {
    name: "Bruno Gustavo da Silva",
    url: "/wiki/Bruno_Gustavo_da_Silva",
  },
  {
    name: "Carlston Harris",
    url: "/wiki/Carlston_Harris",
  },
  {
    name: "Viviane Araújo",
    url: "/wiki/Viviane_Ara%C3%BAjo_(fighter)",
  },
  {
    name: "Marc-André Barriault",
    url: "/wiki/Marc-Andr%C3%A9_Barriault",
  },
  {
    name: "Julian Marquez",
    url: "/wiki/Julian_Marquez",
  },
  {
    name: "Song Kenan",
    url: "/wiki/Song_Kenan",
  },

  {
    name: "Brendan Allen",
    url: "/wiki/Brendan_Allen",
  },
  {
    name: "André Muniz",
    url: "/wiki/Andr%C3%A9_Muniz",
  },
  {
    name: "Augusto Sakai",
    url: "/wiki/Augusto_Sakai",
  },
  {
    name: "Don'Tale Mayes",
    url: "/wiki/Don%27Tale_Mayes",
  },
  {
    name: "Montana De La Rosa",
    url: "/wiki/Montana_De_La_Rosa",
  },
  {
    name: "Jordan Leavitt",
    url: "/wiki/Jordan_Leavitt",
  },
  {
    name: "Ode' Osbourne",
    url: "/wiki/Ode%27_Osbourne",
  },
  {
    name: "Joe Solecki",
    url: "/wiki/Joe_Solecki",
  },
  {
    name: "Erin Blanchfield",
    url: "/wiki/Erin_Blanchfield",
  },
  {
    name: "Josh Parisian",
    url: "/wiki/Josh_Parisian",
  },
  {
    name: "Marcin Prachnio",
    url: "/wiki/Marcin_Prachnio",
  },
  {
    name: "William Knight",
    url: "/wiki/William_Knight_(fighter)",
  },
  {
    name: "Alexander Hernandez",
    url: "/wiki/Alexander_Hernandez",
  },
  {
    name: "Mayra Bueno Silva",
    url: "/wiki/Mayra_Bueno_Silva",
  },
  {
    name: "Jamall Emmers",
    url: "/wiki/Jamall_Emmers",
  },
  {
    name: "Jack Della Maddalena",
    url: "/wiki/Jack_Della_Maddalena",
  },
  {
    name: "Randy Brown",
    url: "/wiki/Randy_Brown_(fighter)",
  },
  {
    name: "Justin Tafa",
    url: "/wiki/Justin_Tafa",
  },
  {
    name: "Parker Porter",
    url: "/wiki/Parker_Porter",
  },
  {
    name: "Alonzo Menifield",
    url: "/wiki/Alonzo_Menifield",
  },
  {
    name: "Modestas Bukauskas",
    url: "/wiki/Modestas_Bukauskas",
  },
  {
    name: "Joshua Culibao",
    url: "/wiki/Joshua_Culibao",
  },
  {
    name: "Melsik Baghdasaryan",
    url: "/wiki/Melsik_Baghdasaryan",
  },
  {
    name: "Jamie Mullarkey",
    url: "/wiki/Jamie_Mullarkey",
  },
  {
    name: "Loma Lookboonmee",
    url: "/wiki/Loma_Lookboonmee",
  },
  {
    name: "Elise Reed",
    url: "/wiki/Elise_Reed",
  },
  {
    name: "Shane Young",
    url: "/wiki/Shane_Young",
  },
  {
    name: "Zubaira Tukhugov",
    url: "/wiki/Zubaira_Tukhugov",
  },
  {
    name: "Kyle Nelson",
    url: "/wiki/Kyle_Nelson_(fighter)",
  },
  {
    name: "Anshul Jubli",
    url: "/wiki/Anshul_Jubli",
  },
  {
    name: "Jeka Saragih",
    url: "/wiki/Jeka_Saragih",
  },
  {
    name: "Rinya Nakamura",
    url: "/wiki/Rinya_Nakamura",
  },
  {
    name: "Jun Yong Park",
    url: "/wiki/Jun_Yong_Park",
  },
  {
    name: "Gregory Rodrigues",
    url: "/wiki/Gregory_Rodrigues",
  },
  {
    name: "Thiago Moisés",
    url: "/wiki/Thiago_Mois%C3%A9s",
  },
  {
    name: "Mounir Lazzez",
    url: "/wiki/Mounir_Lazzez",
  },
  {
    name: "Jailton Almeida",
    url: "/wiki/Jailton_Almeida",
  },
  {
    name: "Shamil Abdurakhimov",
    url: "/wiki/Shamil_Abdurakhimov",
  },

  {
    name: "Terrance McKinney",
    url: "/wiki/Terrance_McKinney",
  },
  {
    name: "Zarah Fairn dos Santos",
    url: "/wiki/Zarah_Fairn_Dos_Santos",
  },
  {
    name: "Nassourdine Imavov",
    url: "/wiki/Nassourdine_Imavov",
  },

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