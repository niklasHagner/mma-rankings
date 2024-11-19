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

// Updated 2024-06-21
let inputFighters = [
    {
        "name": "Mike Davis",
        "url": "/wiki/Mike_Davis_(fighter)"
    },
    {
        "name": "Mike Malott",
        "url": "/wiki/Mike_Malott"
    },
    {
        "name": "Miles Johns",
        "url": "/wiki/Miles_Johns"
    },
    {
        "name": "Miranda Maverick",
        "url": "/wiki/Miranda_Maverick"
    },
    {
        "name": "Molly McCann",
        "url": "/wiki/Molly_McCann"
    },
    {
        "name": "Montana De La Rosa",
        "url": "/wiki/Montana_De_La_Rosa"
    },

    {
        "name": "Muhammad Naimov",
        "url": "/wiki/Muhammad_Naimov"
    },
    {
        "name": "Nassourdine Imavov",
        "url": "/wiki/Nassourdine_Imavov"
    },
    {
        "name": "Natália Silva",
        "url": "/wiki/Nat%C3%A1lia_Silva_(fighter)"
    },
    {
        "name": "Natan Levy",
        "url": "/wiki/Natan_Levy"
    },
    {
        "name": "Nate Landwehr",
        "url": "/wiki/Nate_Landwehr"
    },
    {
        "name": "Nate Maness",
        "url": "/wiki/Nate_Maness"
    },

    {
        "name": "Norma Dumont",
        "url": "/wiki/Norma_Dumont"
    },
    {
        "name": "Nursulton Ruziboev",
        "url": "/wiki/Nursulton_Ruziboev"
    },
    {
        "name": "Ode' Osbourne",
        "url": "/wiki/Ode%27_Osbourne"
    },
    {
        "name": "Ovince Saint Preux",
        "url": "/wiki/Ovince_Saint_Preux"
    },
    {
        "name": "Pannie Kianzad",
        "url": "/wiki/Pannie_Kianzad"
    },

    {
        "name": "Philip Rowe",
        "url": "/wiki/Philip_Rowe"
    },
    {
        "name": "Philipe Lins",
        "url": "/wiki/Philipe_Lins"
    },
    {
        "name": "Polyana Viana",
        "url": "/wiki/Polyana_Viana"
    },
    {
        "name": "Priscila Cachoeira",
        "url": "/wiki/Priscila_Cachoeira"
    },
    {
        "name": "Punahele Soriano",
        "url": "/wiki/Punahele_Soriano"
    },
    {
        "name": "Rafael dos Anjos",
        "url": "/wiki/Rafael_dos_Anjos"
    },
    {
        "name": "Ramiz Brahimaj",
        "url": "/wiki/Ramiz_Brahimaj"
    },
    {
        "name": "Randy Brown",
        "url": "/wiki/Randy_Brown_(fighter)"
    },
    {
        "name": "Rani Yahya",
        "url": "/wiki/Rani_Yahya"
    },
    {
        "name": "Raoni Barcelos",
        "url": "/wiki/Raoni_Barcelos"
    },
    {
        "name": "Raquel Pennington",
        "url": "/wiki/Raquel_Pennington"
    },
    {
        "name": "Rayanne dos Santos",
        "url": "/wiki/Rayanne_dos_Santos"
    },
    {
        "name": "Ricardo Ramos",
        "url": "/wiki/Ricardo_Ramos_(fighter)"
    },
    {
        "name": "Rinya Nakamura",
        "url": "/wiki/Rinya_Nakamura"
    },
    {
        "name": "Robelis Despaigne",
        "url": "/wiki/Robelis_Despaigne"
    },
    {
        "name": "Rodrigo Nascimento",
        "url": "/wiki/Rodrigo_Nascimento"
    },
    {
        "name": "Roman Kopylov",
        "url": "/wiki/Roman_Kopylov"
    },

    {
        "name": "Sam Hughes",
        "url": "/wiki/Sam_Hughes_(fighter)"
    },

    {
        "name": "Sean Woodson",
        "url": "/wiki/Sean_Woodson"
    },
    {
        "name": "Shayilan Nuerdanbieke",
        "url": "/wiki/Shayilan_Nuerdanbieke"
    },
    {
        "name": "Song Yadong",
        "url": "/wiki/Song_Yadong"
    },
    {
        "name": "Steve Erceg",
        "url": "/wiki/Steve_Erceg"
    },
    {
        "name": "Tabatha Ricci",
        "url": "/wiki/Tabatha_Ricci"
    },
    {
        "name": "Tai Tuivasa",
        "url": "/wiki/Tai_Tuivasa"
    },
    {
        "name": "Tatsuro Taira",
        "url": "/wiki/Tatsuro_Taira"
    },
    {
        "name": "Taylor Lapilus",
        "url": "/wiki/Taylor_Lapilus"
    },
    {
        "name": "Tecia Pennington",
        "url": "/wiki/Tecia_Pennington"
    },
    {
        "name": "Terrance McKinney",
        "url": "/wiki/Terrance_McKinney"
    },
    {
        "name": "Themba Gorimbo",
        "url": "/wiki/Themba_Gorimbo"
    },
    {
        "name": "Thiago Moisés",
        "url": "/wiki/Thiago_Mois%C3%A9s"
    },
    {
        "name": "Tim Means",
        "url": "/wiki/Tim_Means"
    },
    {
        "name": "Trevin Giles",
        "url": "/wiki/Trevin_Giles"
    },
    {
        "name": "Tyson Pedro",
        "url": "/wiki/Tyson_Pedro"
    },
    {
        "name": "Uroš Medić",
        "url": "/wiki/Uro%C5%A1_Medi%C4%87"
    },
    {
        "name": "Vanessa Demopoulos",
        "url": "/wiki/Vanessa_Demopoulos"
    },


    {
        "name": "Victor Henry",
        "url": "/wiki/Victor_Henry_(fighter)"
    },
    {
        "name": "Vinc Pichel",
        "url": "/wiki/Vinc_Pichel"
    },
    {
        "name": "Virna Jandiroba",
        "url": "/wiki/Virna_Jandiroba"
    },
    {
        "name": "Vitor Petrino",
        "url": "/wiki/Vitor_Petrino"
    },
    {
        "name": "Viviane Araújo",
        "url": "/wiki/Viviane_Ara%C3%BAjo_(fighter)"
    },
    {
        "name": "Warlley Alves",
        "url": "/wiki/Warlley_Alves"
    },
    {
        "name": "Yazmin Jauregui",
        "url": "/wiki/Yazmin_Jauregui"
    },
    {
        "name": "Youssef Zalal",
        "url": "/wiki/Youssef_Zalal"
    }
];

async function scrapeInBatchesWithWaits() {
    let minutes = 1;
    const clonedInputFighters = [...inputFighters];
    for (let i = 0; i < clonedInputFighters.length; i++) {
        const inputFighterBatch = clonedInputFighters.splice(0, 6);
        await scrapeListOfFighters(inputFighterBatch);
        minutes = minutes * 1.5;

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