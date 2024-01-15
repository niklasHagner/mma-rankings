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
    
      {
        name: "Drew Dober",
        url: "/wiki/Drew_Dober",
      },
      {
        name: "Ricky Glenn",
        url: "/wiki/Ricky_Glenn",
      },
      {
        name: "Bill Algeo",
        url: "/wiki/Bill_Algeo",
      },
      {
        name: "Alexander Hernandez",
        url: "/wiki/Alexander_Hernandez",
      },
      {
        name: "Karolina Kowalkiewicz",
        url: "/wiki/Karolina_Kowalkiewicz",
      },
      {
        name: "Diana Belbiţă",
        url: "/wiki/Diana_Belbi%C5%A3%C4%83",
      },
      {
        name: "Nate Maness",
        url: "/wiki/Nate_Maness",
      },
      {
        name: "Vanessa Demopoulos",
        url: "/wiki/Vanessa_Demopoulos",
      },
      {
        name: "Kanako Murata",
        url: "/wiki/Kanako_Murata",
      },
      {
        name: "Aori Qileng",
        url: "/wiki/Aori_Qileng",
      },
      {
        name: "Johnny Muñoz Jr.",
        url: "/wiki/Johnny_Mu%C3%B1oz_Jr.",
      },
      {
        name: "JJ Aldrich",
        url: "/wiki/JJ_Aldrich",
      },
      {
        name: "Montana De La Rosa",
        url: "/wiki/Montana_De_La_Rosa",
      },
      {
        name: "Mateusz Gamrot",
        url: "/wiki/Mateusz_Gamrot",
      },
      {
        name: "Rafael Fiziev",
        url: "/wiki/Rafael_Fiziev",
      },
      {
        name: "Bryce Mitchell",
        url: "/wiki/Bryce_Mitchell",
      },
      {
        name: "Dan Ige",
        url: "/wiki/Dan_Ige",
      },
      {
        name: "Marina Rodriguez",
        url: "/wiki/Marina_Rodriguez",
      },
      {
        name: "Michelle Waterson-Gomez",
        url: "/wiki/Michelle_Waterson-Gomez",
      },
      {
        name: "Charles Jourdain",
        url: "/wiki/Charles_Jourdain",
      },
      {
        name: "Ricardo Ramos",
        url: "/wiki/Ricardo_Ramos_(fighter)",
      },
      {
        name: "Miles Johns",
        url: "/wiki/Miles_Johns",
      },
      {
        name: "Tim Means",
        url: "/wiki/Tim_Means",
      },
      {
        name: "André Fialho",
        url: "/wiki/Andr%C3%A9_Fialho",
      },
      {
        name: "Cody Brundage",
        url: "/wiki/Cody_Brundage",
      },
      {
        name: "Jacob Malkoun",
        url: "/wiki/Jacob_Malkoun",
      },
      {
        name: "Jake Collier",
        url: "/wiki/Jake_Collier",
      },
      {
        name: "Mizuki Inoue",
        url: "/wiki/Mizuki_Inoue",
      },
      {
        name: "Hannah Goldy",
        url: "/wiki/Hannah_Goldy",
      },
      {
        name: "Alexa Grasso (c)",
        url: "/wiki/Alexa_Grasso",
      },
      {
        name: "Valentina Shevchenko",
        url: "/wiki/Valentina_Shevchenko",
      },
      {
        name: "Jack Della Maddalena",
        url: "/wiki/Jack_Della_Maddalena",
      },
      {
        name: "Kevin Holland",
        url: "/wiki/Kevin_Holland",
      },
      {
        name: "Christos Giagos",
        url: "/wiki/Christos_Giagos",
      },
      {
        name: "Kyle Nelson",
        url: "/wiki/Kyle_Nelson_(fighter)",
      },
      {
        name: "Lupita Godinez",
        url: "/wiki/Lupita_Godinez",
      },
      {
        name: "Elise Reed",
        url: "/wiki/Elise_Reed",
      },
      {
        name: "Roman Kopylov",
        url: "/wiki/Roman_Kopylov",
      },
      {
        name: "Tracy Cortez",
        url: "/wiki/Tracy_Cortez",
      },
      {
        name: "Josefine Lindgren Knutsson",
        url: "/wiki/Josefine_Lindgren_Knutsson",
      },
      {
        name: "Sean Strickland",
        url: "/wiki/Sean_Strickland",
      },
      {
        name: "Israel Adesanya (c)",
        url: "/wiki/Israel_Adesanya",
      },
      {
        name: "Alexander Volkov",
        url: "/wiki/Alexander_Volkov_(fighter)",
      },
      {
        name: "Tai Tuivasa",
        url: "/wiki/Tai_Tuivasa",
      },
      {
        name: "Manel Kape",
        url: "/wiki/Manel_Kape",
      },
      {
        name: "Justin Tafa",
        url: "/wiki/Justin_Tafa",
      },
      {
        name: "Austen Lane",
        url: "/wiki/Austen_Lane",
      },
      {
        name: "Tyson Pedro",
        url: "/wiki/Tyson_Pedro",
      },
      {
        name: "Carlos Ulberg",
        url: "/wiki/Carlos_Ulberg",
      },
      {
        name: "Jung Da-un",
        url: "/wiki/Da_Un_Jung",
      },
      {
        name: "Jamie Mullarkey",
        url: "/wiki/Jamie_Mullarkey",
      },
      {
        name: "John Makdessi",
        url: "/wiki/John_Makdessi",
      },
      {
        name: "Nasrat Haqparast",
        url: "/wiki/Nasrat_Haqparast",
      },
      {
        name: "Shane Young",
        url: "/wiki/Shane_Young",
      },
      {
        name: "Ciryl Gane",
        url: "/wiki/Ciryl_Gane",
      },
      {
        name: "Sergey Spivak",
        url: "/wiki/Sergey_Spivak",
      },
      {
        name: "Manon Fiorot",
        url: "/wiki/Manon_Fiorot",
      },
      {
        name: "Rose Namajunas",
        url: "/wiki/Rose_Namajunas",
      },
      {
        name: "Benoît Saint-Denis",
        url: "/wiki/Beno%C3%AEt_Saint-Denis",
      },
      {
        name: "Thiago Moisés",
        url: "/wiki/Thiago_Mois%C3%A9s",
      },
      {
        name: "Volkan Oezdemir",
        url: "/wiki/Volkan_Oezdemir",
      },
      {
        name: "Taylor Lapilus",
        url: "/wiki/Taylor_Lapilus",
      },
      {
        name: "Joselyne Edwards",
        url: "/wiki/Joselyne_Edwards",
      },
      {
        name: "Zarah Fairn",
        url: "/wiki/Zarah_Fairn",
      },
      {
        name: "Max Holloway",
        url: "/wiki/Max_Holloway",
      },
      {
        name: "Jung Chan-sung",
        url: "/wiki/The_Korean_Zombie",
      },
      {
        name: "Anthony Smith",
        url: "/wiki/Anthony_Smith_(fighter)",
      },
      {
        name: "Ryan Spann",
        url: "/wiki/Ryan_Spann",
      },
      {
        name: "Giga Chikadze",
        url: "/wiki/Giga_Chikadze",
      },
      {
        name: "Alex Caceres",
        url: "/wiki/Alex_Caceres",
      },
      {
        name: "Rinya Nakamura",
        url: "/wiki/Rinya_Nakamura",
      },
      {
        name: "Erin Blanchfield",
        url: "/wiki/Erin_Blanchfield",
      },
      {
        name: "Taila Santos",
        url: "/wiki/Taila_Santos",
      },
      {
        name: "Parker Porter",
        url: "/wiki/Parker_Porter",
      },
      {
        name: "Michał Oleksiejczuk",
        url: "/wiki/Micha%C5%82_Oleksiejczuk",
      },
      {
        name: "Chidi Njokuani",
        url: "/wiki/Chidi_Njokuani",
      },
      {
        name: "Song Kenan",
        url: "/wiki/Song_Kenan",
      },
      {
        name: "JJ Aldrich",
        url: "/wiki/JJ_Aldrich",
      },
      {
        name: "Choi Seung-woo",
        url: "/wiki/Seung_Woo_Choi",
      },
      {
        name: "Sean O'Malley",
        url: "/wiki/Sean_O%27Malley_(fighter)",
      },
      {
        name: "Aljamain Sterling (c)",
        url: "/wiki/Aljamain_Sterling",
      },
      {
        name: "Zhang Weili (c)",
        url: "/wiki/Zhang_Weili",
      },
      {
        name: "Amanda Lemos",
        url: "/wiki/Amanda_Lemos",
      },
      {
        name: "Ian Machado Garry",
        url: "/wiki/Ian_Machado_Garry",
      },
      {
        name: "Neil Magny",
        url: "/wiki/Neil_Magny",
      },
      {
        name: "Mario Bautista",
        url: "/wiki/Mario_Bautista",
      },
      {
        name: "Marlon Vera",
        url: "/wiki/Marlon_Vera",
      },
      {
        name: "Pedro Munhoz",
        url: "/wiki/Pedro_Munhoz",
      },
      {
        name: "Brad Tavares",
        url: "/wiki/Brad_Tavares",
      },
      {
        name: "Chris Weidman",
        url: "/wiki/Chris_Weidman",
      },
      {
        name: "Gregory Rodrigues",
        url: "/wiki/Gregory_Rodrigues",
      },
      {
        name: "Kurt Holobaugh",
        url: "/wiki/Kurt_Holobaugh_(fighter)",
      },
      {
        name: "Austin Hubbard",
        url: "/wiki/Austin_Hubbard",
      },
      {
        name: "Brad Katona",
        url: "/wiki/Brad_Katona",
      },
      {
        name: "Cody Gibson",
        url: "/wiki/Cody_Gibson",
      },
      {
        name: "Andre Petroski",
        url: "/wiki/Andre_Petroski",
      },
      {
        name: "Gerald Meerschaert",
        url: "/wiki/Gerald_Meerschaert",
      },
      {
        name: "Natália Silva",
        url: "/wiki/Nat%C3%A1lia_Silva_(fighter)",
      },
      {
        name: "Andrea Lee",
        url: "/wiki/Andrea_Lee_(fighter)",
      },
      {
        name: "Karine Silva",
        url: "/wiki/Karine_Silva",
      },
      {
        name: "Maryna Moroz",
        url: "/wiki/Maryna_Moroz",
      },
      {
        name: "Vicente Luque",
        url: "/wiki/Vicente_Luque",
      },
      {
        name: "Rafael dos Anjos",
        url: "/wiki/Rafael_dos_Anjos",
      },
      {
        name: "Cub Swanson",
        url: "/wiki/Cub_Swanson",
      },
      {
        name: "Hakeem Dawodu",
        url: "/wiki/Hakeem_Dawodu",
      },
      {
        name: "Khalil Rountree Jr.",
        url: "/wiki/Khalil_Rountree_Jr.",
      },
      {
        name: "Chris Daukaus",
        url: "/wiki/Chris_Daukaus",
      },
      {
        name: "Polyana Viana",
        url: "/wiki/Polyana_Viana",
      },
      {
        name: "Tafon Nchukwi",
        url: "/wiki/Tafon_Nchukwi",
      },
      {
        name: "Jamie Pickett",
        url: "/wiki/Jamie_Pickett",
      },
      {
        name: "Terrance McKinney",
        url: "/wiki/Terrance_McKinney",
      },
      {
        name: "Josh Parisian",
        url: "/wiki/Josh_Parisian",
      },
      {
        name: "Montserrat Ruiz",
        url: "/wiki/Montserrat_Ruiz",
      },
      {
        name: "Cory Sandhagen",
        url: "/wiki/Cory_Sandhagen",
      },
      {
        name: "Rob Font",
        url: "/wiki/Rob_Font",
      },
      {
        name: "Tatiana Suarez",
        url: "/wiki/Tatiana_Suarez",
      },
      {
        name: "Jéssica Andrade",
        url: "/wiki/J%C3%A9ssica_Andrade",
      },
      {
        name: "Dustin Jacoby",
        url: "/wiki/Dustin_Jacoby",
      },
      {
        name: "Kennedy Nzechukwu",
        url: "/wiki/Kennedy_Nzechukwu",
      },
      {
        name: "Gavin Tucker",
        url: "/wiki/Gavin_Tucker",
      },
      {
        name: "Tanner Boser",
        url: "/wiki/Tanner_Boser",
      },
      {
        name: "Aleksa Camur",
        url: "/wiki/Aleksa_Camur",
      },
      {
        name: "Ľudovít Klein",
        url: "/wiki/%C4%BDudov%C3%ADt_Klein",
      },
      {
        name: "Ignacio Bahamondes",
        url: "/wiki/Ignacio_Bahamondes",
      },
      {
        name: "Kyler Phillips",
        url: "/wiki/Kyler_Phillips",
      },
      {
        name: "Raoni Barcelos",
        url: "/wiki/Raoni_Barcelos",
      },
      {
        name: "Carlston Harris",
        url: "/wiki/Carlston_Harris",
      },
      {
        name: "Jeremiah Wells",
        url: "/wiki/Jeremiah_Wells",
      },
      {
        name: "Billy Quarantillo",
        url: "/wiki/Billy_Quarantillo",
      },
      {
        name: "Damon Jackson",
        url: "/wiki/Damon_Jackson",
      },
      {
        name: "Cody Durden",
        url: "/wiki/Cody_Durden",
      },
      {
        name: "Sean Woodson",
        url: "/wiki/Sean_Woodson",
      },
      {
        name: "Ode' Osbourne",
        url: "/wiki/Ode%27_Osbourne",
      },
      {
        name: "Justin Gaethje",
        url: "/wiki/Justin_Gaethje",
      },
      {
        name: "Dustin Poirier",
        url: "/wiki/Dustin_Poirier",
      },
      {
        name: "Alex Pereira",
        url: "/wiki/Alex_Pereira",
      },
      {
        name: "Jan Błachowicz",
        url: "/wiki/Jan_B%C5%82achowicz",
      },
      {
        name: "Derrick Lewis",
        url: "/wiki/Derrick_Lewis",
      },
      {
        name: "Marcos Rogério de Lima",
        url: "/wiki/Marcos_Rog%C3%A9rio_de_Lima",
      },
      {
        name: "Tony Ferguson",
        url: "/wiki/Tony_Ferguson",
      },
      {
        name: "Kevin Holland",
        url: "/wiki/Kevin_Holland",
      },
      {
        name: "Michael Chiesa",
        url: "/wiki/Michael_Chiesa",
      },
      {
        name: "Trevin Giles",
        url: "/wiki/Trevin_Giles",
      },
      {
        name: "C.J. Vergara",
        url: "/wiki/C.J._Vergara",
      },
      {
        name: "Roman Kopylov",
        url: "/wiki/Roman_Kopylov",
      },
      {
        name: "Jake Matthews",
        url: "/wiki/Jake_Matthews_(fighter)",
      },
      {
        name: "Uroš Medić",
        url: "/wiki/Uro%C5%A1_Medi%C4%87",
      },
      {
        name: "Matthew Semelsberger",
        url: "/wiki/Matthew_Semelsberger",
      },
      {
        name: "Miranda Maverick",
        url: "/wiki/Miranda_Maverick",
      },
      {
        name: "Priscila Cachoeira",
        url: "/wiki/Priscila_Cachoeira",
      },
      {
        name: "Tom Aspinall",
        url: "/wiki/Tom_Aspinall",
      },
      {
        name: "Marcin Tybura",
        url: "/wiki/Marcin_Tybura",
      },
      {
        name: "Julija Stoliarenko",
        url: "/wiki/Julija_Stoliarenko",
      },
      {
        name: "Molly McCann",
        url: "/wiki/Molly_McCann",
      },
      {
        name: "Nathaniel Wood",
        url: "/wiki/Nathaniel_Wood_(fighter)",
      },
      {
        name: "Andre Fili",
        url: "/wiki/Andre_Fili",
      },
      {
        name: "Paul Craig",
        url: "/wiki/Paul_Craig",
      },
      {
        name: "André Muniz",
        url: "/wiki/Andr%C3%A9_Muniz",
      },
      {
        name: "Farès Ziam",
        url: "/wiki/Far%C3%A8s_Ziam",
      },
      {
        name: "Jai Herbert",
        url: "/wiki/Jai_Herbert",
      },
      {
        name: "Lerone Murphy",
        url: "/wiki/Lerone_Murphy",
      },
      {
        name: "Joshua Culibao",
        url: "/wiki/Joshua_Culibao",
      },
      {
        name: "Davey Grant",
        url: "/wiki/Davey_Grant",
      },
      {
        name: "Danny Roberts",
        url: "/wiki/Danny_Roberts_(fighter)",
      },
      {
        name: "Joel Álvarez",
        url: "/wiki/Joel_%C3%81lvarez",
      },
      {
        name: "Marc Diakiese",
        url: "/wiki/Marc_Diakiese",
      },
      {
        name: "Makhmud Muradov",
        url: "/wiki/Makhmud_Muradov",
      },
      {
        name: "Bryan Barberena",
        url: "/wiki/Bryan_Barberena",
      },
      {
        name: "Ketlen Vieira",
        url: "/wiki/Ketlen_Vieira",
      },
      {
        name: "Pannie Kianzad",
        url: "/wiki/Pannie_Kianzad",
      },
    
    


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