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
//   {
//     name: "Daniel Pineda",
//     url: "/wiki/Daniel_Pineda_(fighter)",
//   },
//   {
//     name: "Steven Peterson",
//     url: "/wiki/Steven_Peterson",
//   },
//   {
//     name: "Trevin Giles",
//     url: "/wiki/Trevin_Giles",
//   },
//   {
//     name: "C.J. Vergara",
//     url: "/wiki/C.J._Vergara",
//   },
//   {
//     name: "Casey O'Neill",
//     url: "/wiki/Casey_O%27Neill",
//   },
//   {
//     name: "Roman Dolidze",
//     url: "/wiki/Roman_Dolidze",
//   },
//   {
//     name: "Jack Shore",
//     url: "/wiki/Jack_Shore",
//   },
//   {
//     name: "Makwan Amirkhani",
//     url: "/wiki/Makwan_Amirkhani",
//   },
//   {
//     name: "Omar Morales",
//     url: "/wiki/Omar_Morales_(fighter)",
//   },
//   {
//     name: "Lerone Murphy",
//     url: "/wiki/Lerone_Murphy",
//   },
//   {
//     name: "Duško Todorović",
//     url: "/wiki/Du%C5%A1ko_Todorovi%C4%87",
//   },
//   {
//     name: "Malcolm Gordon",
//     url: "/wiki/Malcolm_Gordon_(fighter)",
//   },
//   {
//     name: "Joanne Wood",
//     url: "/wiki/Joanne_Wood",
//   },
//   {
//     name: "Luana Carolina",
//     url: "/wiki/Luana_Carolina",
//   },
//   {
//     name: "Jai Herbert",
//     url: "/wiki/Jai_Herbert",
//   },
//   {
//     name: "Ľudovít Klein",
//     url: "/wiki/%C4%BDudov%C3%ADt_Klein",
//   },
//   {
//     name: "Veronica Hardy",
//     url: "/wiki/Veronica_Hardy",
//   },
//   {
//     name: "JJ Aldrich",
//     url: "/wiki/JJ_Aldrich",
//   },
//   {
//     name: "Bruno Gustavo da Silva",
//     url: "/wiki/Bruno_Gustavo_da_Silva",
//   },
//   {
//     name: "Carlston Harris",
//     url: "/wiki/Carlston_Harris",
//   },
//   {
//     name: "Viviane Araújo",
//     url: "/wiki/Viviane_Ara%C3%BAjo_(fighter)",
//   },
//   {
//     name: "Marc-André Barriault",
//     url: "/wiki/Marc-Andr%C3%A9_Barriault",
//   },
//   {
//     name: "Julian Marquez",
//     url: "/wiki/Julian_Marquez",
//   },
//   {
//     name: "Song Kenan",
//     url: "/wiki/Song_Kenan",
//   },

//   {
//     name: "Brendan Allen",
//     url: "/wiki/Brendan_Allen",
//   },
//   {
//     name: "André Muniz",
//     url: "/wiki/Andr%C3%A9_Muniz",
//   },
//   {
//     name: "Augusto Sakai",
//     url: "/wiki/Augusto_Sakai",
//   },
//   {
//     name: "Don'Tale Mayes",
//     url: "/wiki/Don%27Tale_Mayes",
//   },
  {
    name: "Tatiana Suarez",
    url: "/wiki/Tatiana_Suarez",
  },
//   {
//     name: "Montana De La Rosa",
//     url: "/wiki/Montana_De_La_Rosa",
//   },
//   {
//     name: "Jordan Leavitt",
//     url: "/wiki/Jordan_Leavitt",
//   },
//   {
//     name: "Ode' Osbourne",
//     url: "/wiki/Ode%27_Osbourne",
//   },
//   {
//     name: "Joe Solecki",
//     url: "/wiki/Joe_Solecki",
//   },
//   {
//     name: "Erin Blanchfield",
//     url: "/wiki/Erin_Blanchfield",
//   },

  {
    name: "Jordan Wright",
    url: "/wiki/Jordan_Wright",
  },
//   {
//     name: "Josh Parisian",
//     url: "/wiki/Josh_Parisian",
//   },
//   {
//     name: "Marcin Prachnio",
//     url: "/wiki/Marcin_Prachnio",
//   },
//   {
//     name: "William Knight",
//     url: "/wiki/William_Knight_(fighter)",
//   },
//   {
//     name: "Alexander Hernandez",
//     url: "/wiki/Alexander_Hernandez",
//   },
//   {
//     name: "Mayra Bueno Silva",
//     url: "/wiki/Mayra_Bueno_Silva",
//   },
  {
    name: "Lina Länsberg",
    url: "/wiki/Lina_L%C3%A4nsberg",
  },
//   {
//     name: "Jamall Emmers",
//     url: "/wiki/Jamall_Emmers",
//   },
  {
    name: "Philipe Lins",
    url: "/wiki/Philipe_Lins",
  },
//   {
//     name: "Jack Della Maddalena",
//     url: "/wiki/Jack_Della_Maddalena",
//   },
//   {
//     name: "Randy Brown",
//     url: "/wiki/Randy_Brown_(fighter)",
//   },
//   {
//     name: "Justin Tafa",
//     url: "/wiki/Justin_Tafa",
//   },
//   {
//     name: "Parker Porter",
//     url: "/wiki/Parker_Porter",
//   },
//   {
//     name: "Alonzo Menifield",
//     url: "/wiki/Alonzo_Menifield",
//   },
//   {
//     name: "Modestas Bukauskas",
//     url: "/wiki/Modestas_Bukauskas",
//   },
//   {
//     name: "Joshua Culibao",
//     url: "/wiki/Joshua_Culibao",
//   },
//   {
//     name: "Melsik Baghdasaryan",
//     url: "/wiki/Melsik_Baghdasaryan",
//   },
//   {
//     name: "Jamie Mullarkey",
//     url: "/wiki/Jamie_Mullarkey",
//   },
//   {
//     name: "Loma Lookboonmee",
//     url: "/wiki/Loma_Lookboonmee",
//   },
//   {
//     name: "Elise Reed",
//     url: "/wiki/Elise_Reed",
//   },
//   {
//     name: "Shane Young",
//     url: "/wiki/Shane_Young",
//   },
//   {
//     name: "Zubaira Tukhugov",
//     url: "/wiki/Zubaira_Tukhugov",
//   },
//   {
//     name: "Kyle Nelson",
//     url: "/wiki/Kyle_Nelson_(fighter)",
//   },
//   {
//     name: "Anshul Jubli",
//     url: "/wiki/Anshul_Jubli",
//   },
//   {
//     name: "Jeka Saragih",
//     url: "/wiki/Jeka_Saragih",
//   },
//   {
//     name: "Rinya Nakamura",
//     url: "/wiki/Rinya_Nakamura",
//   },
//   {
//     name: "Jun Yong Park",
//     url: "/wiki/Jun_Yong_Park",
//   },
//   {
//     name: "Gregory Rodrigues",
//     url: "/wiki/Gregory_Rodrigues",
//   },
//   {
//     name: "Thiago Moisés",
//     url: "/wiki/Thiago_Mois%C3%A9s",
//   },
//   {
//     name: "Mounir Lazzez",
//     url: "/wiki/Mounir_Lazzez",
//   },
//   {
//     name: "Jailton Almeida",
//     url: "/wiki/Jailton_Almeida",
//   },
//   {
//     name: "Shamil Abdurakhimov",
//     url: "/wiki/Shamil_Abdurakhimov",
//   },

//   {
//     name: "Terrance McKinney",
//     url: "/wiki/Terrance_McKinney",
//   },
//   {
//     name: "Zarah Fairn dos Santos",
//     url: "/wiki/Zarah_Fairn_Dos_Santos",
//   },
//   {
//     name: "Nassourdine Imavov",
//     url: "/wiki/Nassourdine_Imavov",
//   },
//   {
//     name: "Damon Jackson",
//     url: "/wiki/Damon_Jackson",
//   },
//   {
//     name: "Roman Kopylov",
//     url: "/wiki/Roman_Kopylov",
//   },

  ];

//---Problematic fighters---
// "/wiki/Tatiana_Suarez",
// Low amount of wikipediaTable cells (9) for Raoni Barcelos

//Failed
// {
//     name: "Umar Nurmagomedov",
//     url: "/wiki/Umar_Nurmagomedov",
//   },
  
//   {
//     name: "Raquel Pennington",
//     url: "/wiki/Raquel_Pennington",
//   },


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
  const fighters = await Promise.all(fighterBasicData.map(fighter => viewBuilder.extendFighterApiDataWithRecordInfo(fighter, global.rankData)));
  fileHelper.updateListOfFighterFiles();
  console.log("done");
  return;
}

scrapeListOfFighters();