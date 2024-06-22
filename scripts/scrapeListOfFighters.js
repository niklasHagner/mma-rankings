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
  const fetchImages = true;
  const fighterBasicData = await wikipediaApi.fetchArrayOfFighters(inputFighters, readExistingFromFile, allowFetchingMissingFighters, fetchImages);
  await Promise.allSettled(fighterBasicData.map(fighter => viewBuilder.extendFighterApiDataWithRecordInfo(fighter, global.rankData)));
  fileHelper.updateListOfFighterFiles();
  console.log("done");
  return;
}

//Potential name issues: Jacare Souza, Fabricio Werdum, Rogerio Nogueira

inputFighters = [
    //   {
    //     name: "Ricardo Ramos",
    //     url: "/wiki/Ricardo_Ramos_(fighter)",
    //   },
    //   {
    //     name: "Miles Johns",
    //     url: "/wiki/Miles_Johns",
    //   },
    //   {
    //     name: "Tim Means",
    //     url: "/wiki/Tim_Means",
    //   },
    //   {
    //     name: "André Fialho",
    //     url: "/wiki/Andr%C3%A9_Fialho",
    //   },
    //   {
    //     name: "Cody Brundage",
    //     url: "/wiki/Cody_Brundage",
    //   },
    //   {
    //     name: "Jacob Malkoun",
    //     url: "/wiki/Jacob_Malkoun",
    //   },
    //   {
    //     name: "Jake Collier",
    //     url: "/wiki/Jake_Collier",
    //   },
    //   {
    //     name: "Mizuki Inoue",
    //     url: "/wiki/Mizuki_Inoue",
    //   },
    //   {
    //     name: "Hannah Goldy",
    //     url: "/wiki/Hannah_Goldy",
    //   },
    //   {
    //     name: "Alexa Grasso (c)",
    //     url: "/wiki/Alexa_Grasso",
    //   },
    //   {
    //     name: "Valentina Shevchenko",
    //     url: "/wiki/Valentina_Shevchenko",
    //   },
    //   {
    //     name: "Jack Della Maddalena",
    //     url: "/wiki/Jack_Della_Maddalena",
    //   },
    //   {
    //     name: "Kevin Holland",
    //     url: "/wiki/Kevin_Holland",
    //   },
    //   {
    //     name: "Christos Giagos",
    //     url: "/wiki/Christos_Giagos",
    //   },
    //   {
    //     name: "Kyle Nelson",
    //     url: "/wiki/Kyle_Nelson_(fighter)",
    //   },
    //   {
    //     name: "Lupita Godinez",
    //     url: "/wiki/Lupita_Godinez",
    //   },
    //   {
    //     name: "Elise Reed",
    //     url: "/wiki/Elise_Reed",
    //   },
    //   {
    //     name: "Roman Kopylov",
    //     url: "/wiki/Roman_Kopylov",
    //   },
    //   {
    //     name: "Tracy Cortez",
    //     url: "/wiki/Tracy_Cortez",
    //   },
    //   {
    //     name: "Josefine Lindgren Knutsson",
    //     url: "/wiki/Josefine_Lindgren_Knutsson",
    //   },
    //   {
    //     name: "Alexander Volkov",
    //     url: "/wiki/Alexander_Volkov_(fighter)",
    //   },
    //   {
    //     name: "Tai Tuivasa",
    //     url: "/wiki/Tai_Tuivasa",
    //   },
    //   {
    //     name: "Manel Kape",
    //     url: "/wiki/Manel_Kape",
    //   },
    //   {
    //     name: "Justin Tafa",
    //     url: "/wiki/Justin_Tafa",
    //   },
    //   {
    //     name: "Austen Lane",
    //     url: "/wiki/Austen_Lane",
    //   },
    //   {
    //     name: "Carlos Ulberg",
    //     url: "/wiki/Carlos_Ulberg",
    //   },
    //   {
    //     name: "Jung Da-un",
    //     url: "/wiki/Da_Un_Jung",
    //   },
    //   {
    //     name: "Jamie Mullarkey",
    //     url: "/wiki/Jamie_Mullarkey",
    //   },
    //   {
    //     name: "John Makdessi",
    //     url: "/wiki/John_Makdessi",
    //   },
    //   {
    //     name: "Nasrat Haqparast",
    //     url: "/wiki/Nasrat_Haqparast",
    //   },
    //   {
    //     name: "Shane Young",
    //     url: "/wiki/Shane_Young",
    //   },
    //   {
    //     name: "Manon Fiorot",
    //     url: "/wiki/Manon_Fiorot",
    //   },
    //   {
    //     name: "Thiago Moisés",
    //     url: "/wiki/Thiago_Mois%C3%A9s",
    //   },
    //   {
    //     name: "Chris Weidman",
    //     url: "/wiki/Chris_Weidman",
    //   },
    //   {
    //     name: "Gregory Rodrigues",
    //     url: "/wiki/Gregory_Rodrigues",
    //   },
    //   {
    //     name: "Austin Hubbard",
    //     url: "/wiki/Austin_Hubbard",
    //   },
    //   {
    //     name: "Brad Katona",
    //     url: "/wiki/Brad_Katona",
    //   },
    //   {
    //     name: "Cody Gibson",
    //     url: "/wiki/Cody_Gibson",
    //   },
    //   {
    //     name: "Gerald Meerschaert",
    //     url: "/wiki/Gerald_Meerschaert",
    //   },
    //   {
    //     name: "Natália Silva",
    //     url: "/wiki/Nat%C3%A1lia_Silva_(fighter)",
    //   },
    //   {
    //     name: "Andrea Lee",
    //     url: "/wiki/Andrea_Lee_(fighter)",
    //   },
    //   {
    //     name: "Maryna Moroz",
    //     url: "/wiki/Maryna_Moroz",
    //   },
    //   {
    //     name: "Hakeem Dawodu",
    //     url: "/wiki/Hakeem_Dawodu",
    //   },
    //   {
    //     name: "Khalil Rountree Jr.",
    //     url: "/wiki/Khalil_Rountree_Jr.",
    //   },
    //   {
    //     name: "Chris Daukaus",
    //     url: "/wiki/Chris_Daukaus",
    //   },
    //   {
    //     name: "Polyana Viana",
    //     url: "/wiki/Polyana_Viana",
    //   },
    //   {
    //     name: "Tafon Nchukwi",
    //     url: "/wiki/Tafon_Nchukwi",
    //   },
    //   {
    //     name: "Jamie Pickett",
    //     url: "/wiki/Jamie_Pickett",
    //   },
    //   {
    //     name: "Terrance McKinney",
    //     url: "/wiki/Terrance_McKinney",
    //   },
    //   {
    //     name: "Josh Parisian",
    //     url: "/wiki/Josh_Parisian",
    //   },
    //   {
    //     name: "Montserrat Ruiz",
    //     url: "/wiki/Montserrat_Ruiz",
    //   },
    //   {
    //     name: "Rob Font",
    //     url: "/wiki/Rob_Font",
    //   },
    //   {
    //     name: "Tatiana Suarez",
    //     url: "/wiki/Tatiana_Suarez",
    //   },
    //   {
    //     name: "Jéssica Andrade",
    //     url: "/wiki/J%C3%A9ssica_Andrade",
    //   },
    //   {
    //     name: "Dustin Jacoby",
    //     url: "/wiki/Dustin_Jacoby",
    //   },
    //   {
    //     name: "Kennedy Nzechukwu",
    //     url: "/wiki/Kennedy_Nzechukwu",
    //   },
    //   {
    //     name: "Gavin Tucker",
    //     url: "/wiki/Gavin_Tucker",
    //   },
    //   {
    //     name: "Tanner Boser",
    //     url: "/wiki/Tanner_Boser",
    //   },
    //   {
    //     name: "Aleksa Camur",
    //     url: "/wiki/Aleksa_Camur",
    //   },
    //   {
    //     name: "Ľudovít Klein",
    //     url: "/wiki/%C4%BDudov%C3%ADt_Klein",
    //   },
    //   {
    //     name: "Ignacio Bahamondes",
    //     url: "/wiki/Ignacio_Bahamondes",
    //   },
    //   {
    //     name: "Kyler Phillips",
    //     url: "/wiki/Kyler_Phillips",
    //   },
    //   {
    //     name: "Raoni Barcelos",
    //     url: "/wiki/Raoni_Barcelos",
    //   },
    //   {
    //     name: "Carlston Harris",
    //     url: "/wiki/Carlston_Harris",
    //   },
    //   {
    //     name: "Jeremiah Wells",
    //     url: "/wiki/Jeremiah_Wells",
    //   },
    //   {
    //     name: "Billy Quarantillo",
    //     url: "/wiki/Billy_Quarantillo",
    //   },
    //   {
    //     name: "Damon Jackson",
    //     url: "/wiki/Damon_Jackson",
    //   },
    //   {
    //     name: "Cody Durden",
    //     url: "/wiki/Cody_Durden",
    //   },
    //   {
    //     name: "Sean Woodson",
    //     url: "/wiki/Sean_Woodson",
    //   },
    //   {
    //     name: "Ode' Osbourne",
    //     url: "/wiki/Ode%27_Osbourne",
    //   },
    //   {
    //     name: "Marcos Rogério de Lima",
    //     url: "/wiki/Marcos_Rog%C3%A9rio_de_Lima",
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
    //     name: "Roman Kopylov",
    //     url: "/wiki/Roman_Kopylov",
    //   },
    //   {
    //     name: "Jake Matthews",
    //     url: "/wiki/Jake_Matthews_(fighter)",
    //   },
    //   {
    //     name: "Uroš Medić",
    //     url: "/wiki/Uro%C5%A1_Medi%C4%87",
    //   },
    //   {
    //     name: "Matthew Semelsberger",
    //     url: "/wiki/Matthew_Semelsberger",
    //   },
    //   {
    //     name: "Miranda Maverick",
    //     url: "/wiki/Miranda_Maverick",
    //   },
    //   {
    //     name: "Priscila Cachoeira",
    //     url: "/wiki/Priscila_Cachoeira",
    //   },
    //   {
    //     name: "Marcin Tybura",
    //     url: "/wiki/Marcin_Tybura",
    //   },
    //   {
    //     name: "Julija Stoliarenko",
    //     url: "/wiki/Julija_Stoliarenko",
    //   },
    //   {
    //     name: "Molly McCann",
    //     url: "/wiki/Molly_McCann",
    //   },
    //   {
    //     name: "Nathaniel Wood",
    //     url: "/wiki/Nathaniel_Wood_(fighter)",
    //   },
    //   {
    //     name: "André Muniz",
    //     url: "/wiki/Andr%C3%A9_Muniz",
    //   },
    //   {
    //     name: "Farès Ziam",
    //     url: "/wiki/Far%C3%A8s_Ziam",
    //   },
    //   {
    //     name: "Jai Herbert",
    //     url: "/wiki/Jai_Herbert",
    //   },
    //   {
    //     name: "Lerone Murphy",
    //     url: "/wiki/Lerone_Murphy",
    //   },
    //   {
    //     name: "Joshua Culibao",
    //     url: "/wiki/Joshua_Culibao",
    //   },
    //   {
    //     name: "Davey Grant",
    //     url: "/wiki/Davey_Grant",
    //   },
    //   {
    //     name: "Danny Roberts",
    //     url: "/wiki/Danny_Roberts_(fighter)",
    //   },
    //   {
    //     name: "Joel Álvarez",
    //     url: "/wiki/Joel_%C3%81lvarez",
    //   },
    //   {
    //     name: "Marc Diakiese",
    //     url: "/wiki/Marc_Diakiese",
    //   },
    //   {
    //     name: "Makhmud Muradov",
    //     url: "/wiki/Makhmud_Muradov",
    //   },
    //   {
    //     name: "Ketlen Vieira",
    //     url: "/wiki/Ketlen_Vieira",
    //   },
    //   {
    //     name: "Pannie Kianzad",
    //     url: "/wiki/Pannie_Kianzad",
    //   },
    
    


    /*
Mike Easton
Chris Cariaso
Louis Gaudinot
Darren Uyenoyama
Sarah Kaufman
Julie Kedzie
Mark Munoz
Francis Carmont
Tim Boetsch
Jake Ellenberger
TJ Grant
Josh Thomson
Erik Koch
    
    */
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