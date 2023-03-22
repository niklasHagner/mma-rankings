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
    // "/wiki/Alexa_Grasso",
    // "/wiki/Alexander_Hernandez",
    // "/wiki/Alexander_Romanov_(fighter)",
    // "/wiki/Alexander_Volkov_(fighter)",
    // "/wiki/Alonzo_Menifield",
    // "/wiki/Amanda_Ribas",
    // "/wiki/Andr%C3%A9_Muniz",
    // "/wiki/Anshul_Jubli",
    // "/wiki/Ariane_Lipski",
    // "/wiki/Augusto_Sakai",
    // "/wiki/Blagoy_Ivanov",
    // "/wiki/Bo_Nickal",
    // "/wiki/Brandon_Moreno",
    // "/wiki/Brendan_Allen",
    // "/wiki/Bruno_Gustavo_da_Silva",
    // "/wiki/Bryan_Barberena",
    // "/wiki/Carlston_Harris",
    // "/wiki/Casey_O%27Neill",
    // "/wiki/Choi_Doo-ho",
    // "/wiki/Ciryl_Gane",
    // "/wiki/Cody_Garbrandt",
    // "/wiki/Cody_Stamann",
    // "/wiki/Da_Un_Jung",
    // "/wiki/Damon_Jackson",
    // "/wiki/Dan_Ige",
    // "/wiki/Davey_Grant",
    // "/wiki/Deiveson_Figueiredo",
    // "/wiki/Derek_Brunson",
    // "/wiki/Derrick_Lewis",
    // "/wiki/Devin_Clark_(fighter)",
    // "/wiki/Don%27Tale_Mayes",
    // "/wiki/Dricus_du_Plessis",
    // "/wiki/Du%C5%A1ko_Todorovi%C4%87",
    // "/wiki/Elise_Reed",
    // "/wiki/Erin_Blanchfield",
    "/wiki/Geoff_Neal",
    "/wiki/Gilbert_Burns",
    // "/wiki/Glover_Teixeira",
    // "/wiki/Gregory_Rodrigues",
    // "/wiki/Guido_Cannetti",
    // "/wiki/Gunnar_Nelson_(fighter)",
    // "/wiki/Ian_Garry",
    // "/wiki/Islam_Makhachev",
    // "/wiki/J%C3%A9ssica_Andrade",
    // "/wiki/J%C3%A9ssica_Andrade",
    // "/wiki/JJ_Aldrich",
    // "/wiki/Jack_Della_Maddalena",
    // "/wiki/Jack_Shore",
    // "/wiki/Jai_Herbert",
    // "/wiki/Jailton_Almeida",
    // "/wiki/Jalin_Turner",
    // "/wiki/Jamahal_Hill",
    // "/wiki/Jamall_Emmers",
    // "/wiki/Jamie_Mullarkey",
    // "/wiki/Jamie_Pickett",
    // "/wiki/Jared_Gooden",
    // "/wiki/Jeka_Saragih",
    // "/wiki/Jennifer_Maia",
    // "/wiki/Jessica_Penne",
    // "/wiki/Jim_Miller_(fighter)",
    // "/wiki/Jimmy_Crute",
    // "/wiki/Joanne_Wood",
    // "/wiki/Joe_Solecki",
    // "/wiki/Johnny_Walker_(fighter)",
    // "/wiki/Jon_Jones",
    // "/wiki/Jonathan_Martinez",
    // "/wiki/Jordan_Leavitt",
    // "/wiki/Jordan_Wright",
    "/wiki/Josh_Emmett",
    // "/wiki/Josh_Parisian",
    // "/wiki/Joshua_Culibao",
    // "/wiki/Julian_Marquez",
    // "/wiki/Jun_Yong_Park",
    // "/wiki/Justin_Gaethje",
    // "/wiki/Justin_Tafa",
    // "/wiki/Kamaru_Usman",
    // "/wiki/Ketlen_Vieira",
    // "/wiki/Kyle_Nelson_(fighter)",
    // "/wiki/Lauren_Murphy",
    "/wiki/Leon_Edwards",
    // "/wiki/Lerone_Murphy",
    // "/wiki/Lina_L%C3%A4nsberg",
    // "/wiki/Loma_Lookboonmee",
    // "/wiki/Luana_Carolina",
    // "/wiki/Makwan_Amirkhani",
    // "/wiki/Malcolm_Gordon_(fighter)",
    // "/wiki/Marc-Andr%C3%A9_Barriault",
    // "/wiki/Marcin_Prachnio",
    // "/wiki/Marcin_Tybura",
    // "/wiki/Mario_Bautista",
    // "/wiki/Marvin_Vettori",
    // "/wiki/Mateusz_Gamrot",
    // "/wiki/Maur%C3%ADcio_Rua",
    // "/wiki/Mayra_Bueno_Silva",
    // "/wiki/Melsik_Baghdasaryan",
    // "/wiki/Merab_Dvalishvili",
    // "/wiki/Modestas_Bukauskas",
    // "/wiki/Montana_De_La_Rosa",
    // "/wiki/Mounir_Lazzez",
    // "/wiki/Muhammad_Mokaev",
    // "/wiki/Nassourdine_Imavov",
    // "/wiki/Neil_Magny",
    // "/wiki/Nicolas_Dalby",
    // "/wiki/Nikita_Krylov",
    // "/wiki/Ode%27_Osbourne",
    // "/wiki/Omar_Morales_(fighter)",
    // "/wiki/Ovince_Saint_Preux",
    // "/wiki/Parker_Porter",
    // "/wiki/Paul_Craig",
    // "/wiki/Petr_Yan",
    // "/wiki/Philipe_Lins",
    // "/wiki/Punahele_Soriano",
    // "/wiki/Rafael_Fiziev",
    // "/wiki/Randy_Brown_(fighter)",
    // "/wiki/Raoni_Barcelos",
    // "/wiki/Raphael_Assun%C3%A7%C3%A3o",
    // "/wiki/Raquel_Pennington",
    // "/wiki/Rinya_Nakamura",
    // "/wiki/Roman_Dolidze",
    // "/wiki/Roman_Kopylov",
    // "/wiki/Ryan_Spann",
    // "/wiki/Said_Nurmagomedov",
    // "/wiki/Sean_Strickland",
    // "/wiki/Sergey_Spivak",
    // "/wiki/Shamil_Abdurakhimov",
    // "/wiki/Shane_Young",
    // "/wiki/Shavkat_Rakhmonov",
    // "/wiki/Song_Kenan",
    // "/wiki/Tabatha_Ricci",
    // "/wiki/Tatiana_Suarez",
    // "/wiki/Terrance_McKinney",
    // "/wiki/Thiago_Mois%C3%A9s",
    // "/wiki/Tony_Gravely",
    // "/wiki/Trevin_Jones",
    // "/wiki/Tyson_Nam",
    // "/wiki/Tyson_Pedro",
    // "/wiki/Umar_Nurmagomedov",
    // "/wiki/Valentina_Shevchenko",
    // "/wiki/Veronica_Hardy",
    // "/wiki/Viviane_Ara%C3%BAjo_(fighter)",
    // "/wiki/Warlley_Alves",
    // "/wiki/William_Knight_(fighter)",
    // "/wiki/Yair_Rodr%C3%ADguez",
    // "/wiki/Zarah_Fairn_Dos_Santos",
    // "/wiki/Zubaira_Tukhugov"
  ];
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
  const fetchImages = true;
  const fighterBasicData = await wikipediaApi.fetchArrayOfFighters(inputFighters, readExistingFromFile, allowFetchingMissingFighters, fetchImages);
  const fighters = await Promise.all(fighterBasicData.map(fighter => viewBuilder.extendFighterApiDataWithRecordInfo(fighter, global.rankData)));
  fileHelper.updateListOfFighterFiles();
  console.log("done", fighters);
  return;
}

scrapeListOfFighters();