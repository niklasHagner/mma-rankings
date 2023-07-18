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

inputFighters = [
  { url: '/wiki/Gilbert_Melendez' },
  { url: '/wiki/Ricardo_Lamas' },
  { url: '/wiki/Azamat_Murzakanov' },
  { url: '/wiki/Jeremy_Stephens' },
  { url: '/wiki/John_Lineker' },
  { url: '/wiki/Ronda_Rousey' },
  { url: '/wiki/Liz_Carmouche' },



  // { name: 'Zhalgas Zhumagulov', url: '/wiki/Zhalgas_Zhumagulov' },
  // { name: 'Kang Kyung-ho', url: '/wiki/Kang_Kyung-ho' },
  // { name: 'Modestas Bukauskas', url: '/wiki/Modestas_Bukauskas' },
  // { name: 'Mike Malott', url: '/wiki/Mike_Malott' },
  // {
  //   name: 'Marc-André Barriault',
  //   url: '/wiki/Marc-Andr%C3%A9_Barriault'
  // },
  // { name: 'Nassourdine Imavov', url: '/wiki/Nassourdine_Imavov' },
  // { name: 'Aori Qileng', url: '/wiki/Aori_Qileng' },
  // { name: 'Kyle Nelson', url: '/wiki/Kyle_Nelson_(fighter)' },
  // { name: 'David Dvořák', url: '/wiki/David_Dvo%C5%99%C3%A1k' },
  // { name: 'Diana Belbiţă', url: '/wiki/Diana_Belbi%C5%A3%C4%83' },
  // { name: 'Amir Albazi', url: '/wiki/Amir_Albazi' },
  // { name: 'Daniel Pineda', url: '/wiki/Daniel_Pineda_(fighter)' },
  // { name: 'Ketlen Souza', url: '/wiki/Ketlen_Souza' },
  // {
  //   name: 'Elizeu Zaleski dos Santos',
  //   url: '/wiki/Elizeu_Zaleski_dos_Santos'
  // },
  // { name: 'Abubakar Nurmagomedov', url: '/wiki/Abubakar_Nurmagomedov' },
  // { name: 'Johnny Muñoz Jr.', url: '/wiki/Johnny_Mu%C3%B1oz_Jr.' },
  // { name: "Don'Tale Mayes", url: '/wiki/Don%27Tale_Mayes' },
  // { name: 'Andrei Arlovski', url: '/wiki/Andrei_Arlovski' },
  // { name: 'John Castañeda', url: '/wiki/John_Casta%C3%B1eda' },
  // { name: 'Jamie Mullarkey', url: '/wiki/Jamie_Mullarkey' },
  // { name: 'Elise Reed', url: '/wiki/Elise_Reed' },
  // { name: 'Jinh Yu Frey', url: '/wiki/Jinh_Yu_Frey' },
  // { name: 'Maxim Grishin', url: '/wiki/Maxim_Grishin' },
  // { name: 'Lupita Godinez', url: '/wiki/Lupita_Godinez' },
  // { name: 'Emily Ducote', url: '/wiki/Emily_Ducote' },
  // { name: 'Vanessa Demopoulos', url: '/wiki/Vanessa_Demopoulos' },
  // { name: 'Rodrigo Nascimento', url: '/wiki/Rodrigo_Nascimento' },
  // { name: 'Chase Hooper', url: '/wiki/Chase_Hooper' },
  // { name: 'Victoria Leonardo', url: '/wiki/Victoria_Leonardo' },
  // { name: 'Takashi Sato', url: '/wiki/Takashi_Sato' }

//   { name: 'Jessica-Rose Clark', url: '/wiki/Jessica-Rose_Clark' },
//   { name: 'Yan Xiaonan', url: '/wiki/Yan_Xiaonan' },
//   { name: 'Movsar Evloev', url: '/wiki/Movsar_Evloev' },
//   { name: 'Matt Frevola', url: '/wiki/Matt_Frevola' },
//   { name: 'Kennedy Nzechukwu', url: '/wiki/Kennedy_Nzechukwu' },
//   { name: 'Khaos Williams', url: '/wiki/Khaos_Williams' },
//   { name: 'Virna Jandiroba', url: '/wiki/Virna_Jandiroba' },
//   { name: 'Marina Rodriguez', url: '/wiki/Marina_Rodriguez' },
//   { name: 'Parker Porter', url: '/wiki/Parker_Porter' },
//   { name: 'Phil Hawes', url: '/wiki/Phil_Hawes' },
//   { name: 'Cody Brundage', url: '/wiki/Cody_Brundage' },
//   { name: 'Julian Erosa', url: '/wiki/Julian_Erosa' },
//   {
//     name: 'Marcos Rogério de Lima',
//     url: '/wiki/Marcos_Rog%C3%A9rio_de_Lima'
//   },
//   { name: 'Jake Collier', url: '/wiki/Jake_Collier' },
//   { name: 'Cody Durden', url: '/wiki/Cody_Durden' },
//   { name: 'Stephanie Egger', url: '/wiki/Stephanie_Egger' },
//   { name: 'Journey Newson', url: '/wiki/Journey_Newson' }
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
//   {
//     name: "Jamall Emmers",
//     url: "/wiki/Jamall_Emmers",
//   },
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


async function scrapeAndWait() {
  let minutes = 1;
  for (let i = 0; i < inputFighters.length; i++) {
    await scrapeListOfFighters(inputFighters);
    minutes += minutes * 1.5;
    console.log(`Iteration complete, waiting for ${minutes} minutes`);
    await wait(1*1000*60* minutes);
  }
  console.log("scrapeAndWait done");
}

function wait(ms) {
  return new Promise((resolve,reject) => {
    setTimeout(() => {
      resolve();
    }, ms)
  });
}

scrapeAndWait();