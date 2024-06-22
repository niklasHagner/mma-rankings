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

    // emtpy file

    // {
    //     "name": "Derrick Lewis",
    //     "url": "/wiki/Derrick_Lewis"
    // },


// {
//     "name": "Diana Belbiţă",
//     "url": "/wiki/Diana_Belbi%C5%A3%C4%83"
// },

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

// Updated 2024-06-22
let inputFighters = [
    
    {
        "name": "Don'Tale Mayes",
        "url": "/wiki/Don%27Tale_Mayes"
    },
    {
        "name": "Douglas Silva de Andrade",
        "url": "/wiki/Douglas_Silva_de_Andrade"
    },
    {
        "name": "Drakkar Klose",
        "url": "/wiki/Drakkar_Klose"
    },
    {
        "name": "Dricus du Plessis",
        "url": "/wiki/Dricus_du_Plessis"
    },
    {
        "name": "Dustin Jacoby",
        "url": "/wiki/Dustin_Jacoby"
    },
    {
        "name": "Dustin Poirier",
        "url": "/wiki/Dustin_Poirier"
    },
    {
        "name": "Dustin Stoltzfus",
        "url": "/wiki/Dustin_Stoltzfus"
    },
    {
        "name": "Edmen Shahbazyan",
        "url": "/wiki/Edmen_Shahbazyan"
    },
    {
        "name": "Edson Barboza",
        "url": "/wiki/Edson_Barboza"
    },
    {
        "name": "Elizeu Zaleski dos Santos",
        "url": "/wiki/Elizeu_Zaleski_dos_Santos"
    },
    {
        "name": "Emily Ducote",
        "url": "/wiki/Emily_Ducote"
    },
    {
        "name": "Erin Blanchfield",
        "url": "/wiki/Erin_Blanchfield"
    },
    {
        "name": "Farès Ziam",
        "url": "/wiki/Far%C3%A8s_Ziam"
    },
    {
        "name": "Gabriel Benítez",
        "url": "/wiki/Gabriel_Ben%C3%ADtez"
    },
    {
        "name": "Geoff Neal",
        "url": "/wiki/Geoff_Neal"
    },
    {
        "name": "Gerald Meerschaert",
        "url": "/wiki/Gerald_Meerschaert"
    },
    {
        "name": "Germaine de Randamie",
        "url": "/wiki/Germaine_de_Randamie"
    },
    {
        "name": "Gillian Robertson",
        "url": "/wiki/Gillian_Robertson"
    },
    {
        "name": "Grant Dawson",
        "url": "/wiki/Grant_Dawson"
    },
    {
        "name": "Henry Cejudo",
        "url": "/wiki/Henry_Cejudo"
    },
    {
        "name": "Herbert Burns",
        "url": "/wiki/Herbert_Burns"
    },
    {
        "name": "Ian Machado Garry",
        "url": "/wiki/Ian_Machado_Garry"
    },
    {
        "name": "Ignacio Bahamondes",
        "url": "/wiki/Ignacio_Bahamondes"
    },
    {
        "name": "Ion Cuțelaba",
        "url": "/wiki/Ion_Cu%C8%9Belaba"
    },
    {
        "name": "Islam Makhachev (c)",
        "url": "/wiki/Islam_Makhachev"
    },
    {
        "name": "Jack Shore",
        "url": "/wiki/Jack_Shore"
    },
    {
        "name": "Jacob Malkoun",
        "url": "/wiki/Jacob_Malkoun"
    },
    {
        "name": "Jailton Almeida",
        "url": "/wiki/Jailton_Almeida"
    },
    {
        "name": "Jairzinho Rozenstruik",
        "url": "/wiki/Jairzinho_Rozenstruik"
    },
    {
        "name": "Jake Matthews",
        "url": "/wiki/Jake_Matthews_(fighter)"
    },
    {
        "name": "Jamahal Hill",
        "url": "/wiki/Jamahal_Hill"
    },
    {
        "name": "Jamall Emmers",
        "url": "/wiki/Jamall_Emmers"
    },
    {
        "name": "Jamie Mullarkey",
        "url": "/wiki/Jamie_Mullarkey"
    },
    {
        "name": "Jamie Pickett",
        "url": "/wiki/Jamie_Pickett"
    },
    {
        "name": "Jared Cannonier",
        "url": "/wiki/Jared_Cannonier"
    },
    {
        "name": "Javid Basharat",
        "url": "/wiki/Javid_Basharat"
    },
    {
        "name": "Jeka Saragih",
        "url": "/wiki/Jeka_Saragih"
    },
    {
        "name": "Jeremiah Wells",
        "url": "/wiki/Jeremiah_Wells"
    },
    {
        "name": "Jhonata Diniz",
        "url": "/wiki/Jhonata_Diniz"
    },
    {
        "name": "Jim Miller",
        "url": "/wiki/Jim_Miller_(fighter)"
    },
    {
        "name": "JJ Aldrich",
        "url": "/wiki/JJ_Aldrich"
    },
    {
        "name": "Joanne Wood",
        "url": "/wiki/Joanne_Wood"
    },
    {
        "name": "Joaquim Silva",
        "url": "/wiki/Joaquim_Silva_(fighter)"
    },
    {
        "name": "Joaquin Buckley",
        "url": "/wiki/Joaquin_Buckley"
    },
    {
        "name": "Joe Solecki",
        "url": "/wiki/Joe_Solecki"
    },
    {
        "name": "John Castañeda",
        "url": "/wiki/John_Casta%C3%B1eda"
    },
    {
        "name": "Jonathan Martinez",
        "url": "/wiki/Jonathan_Martinez"
    },
    {
        "name": "Jonathan Pearce",
        "url": "/wiki/Jonathan_Pearce_(fighter)"
    },
    {
        "name": "José Aldo",
        "url": "/wiki/Jos%C3%A9_Aldo"
    },
    {
        "name": "Josefine Lindgren Knutsson",
        "url": "/wiki/Josefine_Lindgren_Knutsson"
    },
    {
        "name": "Joselyne Edwards",
        "url": "/wiki/Joselyne_Edwards"
    },
    {
        "name": "Josh Parisian",
        "url": "/wiki/Josh_Parisian"
    },
    {
        "name": "Joshua Culibao",
        "url": "/wiki/Joshua_Culibao"
    },
    {
        "name": "Josiane Nunes",
        "url": "/wiki/Josiane_Nunes"
    },
    {
        "name": "Julian Erosa",
        "url": "/wiki/Julian_Erosa"
    },
    {
        "name": "Julian Marquez",
        "url": "/wiki/Julian_Marquez"
    },
    {
        "name": "Julija Stoliarenko",
        "url": "/wiki/Julija_Stoliarenko"
    },
    {
        "name": "Julio Arce",
        "url": "/wiki/Julio_Arce"
    },
    {
        "name": "Junior Tafa",
        "url": "/wiki/Junior_Tafa"
    },
    {
        "name": "Justin Tafa",
        "url": "/wiki/Justin_Tafa"
    },
    {
        "name": "Karine Silva",
        "url": "/wiki/Karine_Silva"
    },
    {
        "name": "Karolina Kowalkiewicz",
        "url": "/wiki/Karolina_Kowalkiewicz"
    },
    {
        "name": "Katlyn Cerminara",
        "url": "/wiki/Katlyn_Cerminara"
    },
    {
        "name": "Kennedy Nzechukwu",
        "url": "/wiki/Kennedy_Nzechukwu"
    },
    {
        "name": "Ketlen Souza",
        "url": "/wiki/Ketlen_Souza"
    },
    {
        "name": "Khaos Williams",
        "url": "/wiki/Khaos_Williams"
    },
    {
        "name": "Kurt Holobaugh",
        "url": "/wiki/Kurt_Holobaugh"
    },
    {
        "name": "Kyle Nelson",
        "url": "/wiki/Kyle_Nelson_(fighter)"
    },
    {
        "name": "Lerone Murphy",
        "url": "/wiki/Lerone_Murphy"
    },
    {
        "name": "Loma Lookboonmee",
        "url": "/wiki/Loma_Lookboonmee"
    },
    {
        "name": "Loopy Godinez",
        "url": "/wiki/Loopy_Godinez"
    },
    {
        "name": "Luana Carolina",
        "url": "/wiki/Luana_Carolina"
    },
    {
        "name": "Luana Pinheiro",
        "url": "/wiki/Luana_Pinheiro"
    },
    {
        "name": "Ľudovít Klein",
        "url": "/wiki/%C4%BDudov%C3%ADt_Klein"
    },
    {
        "name": "Mackenzie Dern",
        "url": "/wiki/Mackenzie_Dern"
    },
    {
        "name": "Macy Chiasson",
        "url": "/wiki/Macy_Chiasson"
    },
    {
        "name": "Makhmud Muradov",
        "url": "/wiki/Makhmud_Muradov"
    },
    {
        "name": "Malcolm Gordon",
        "url": "/wiki/Malcolm_Gordon_(fighter)"
    },
    {
        "name": "Manon Fiorot",
        "url": "/wiki/Manon_Fiorot"
    },
    {
        "name": "Marc-André Barriault",
        "url": "/wiki/Marc-Andr%C3%A9_Barriault"
    },
    {
        "name": "Marcin Prachnio",
        "url": "/wiki/Marcin_Prachnio"
    },
    {
        "name": "Marcin Tybura",
        "url": "/wiki/Marcin_Tybura"
    },
    {
        "name": "Marcos Rogério de Lima",
        "url": "/wiki/Marcos_Rog%C3%A9rio_de_Lima"
    },
    {
        "name": "Marina Rodriguez",
        "url": "/wiki/Marina_Rodriguez"
    },
    {
        "name": "Maryna Moroz",
        "url": "/wiki/Maryna_Moroz"
    },
    {
        "name": "Mateusz Gamrot",
        "url": "/wiki/Mateusz_Gamrot"
    },
    {
        "name": "Matheus Nicolau",
        "url": "/wiki/Matheus_Nicolau"
    },
    {
        "name": "Max Griffin",
        "url": "/wiki/Max_Griffin"
    },
    {
        "name": "Maycee Barber",
        "url": "/wiki/Maycee_Barber"
    },
    {
        "name": "Mayra Bueno Silva",
        "url": "/wiki/Mayra_Bueno_Silva"
    },
    {
        "name": "Melissa Gatto",
        "url": "/wiki/Melissa_Gatto"
    },
    {
        "name": "Merab Dvalishvili",
        "url": "/wiki/Merab_Dvalishvili"
    },
    {
        "name": "Michał Oleksiejczuk",
        "url": "/wiki/Micha%C5%82_Oleksiejczuk"
    },
    {
        "name": "Michel Pereira",
        "url": "/wiki/Michel_Pereira"
    },
    {
        "name": "Mickey Gall",
        "url": "/wiki/Mickey_Gall"
    },
    {
        "name": "Miguel Baeza",
        "url": "/wiki/Miguel_Baeza"
    },
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
        "name": "Movsar Evloev",
        "url": "/wiki/Movsar_Evloev"
    },
    {
        "name": "Muhammad Mokaev",
        "url": "/wiki/Muhammad_Mokaev"
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
        "name": "Neil Magny",
        "url": "/wiki/Neil_Magny"
    },
    {
        "name": "Niko Price",
        "url": "/wiki/Niko_Price"
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
        "name": "Paul Craig",
        "url": "/wiki/Paul_Craig"
    },
    {
        "name": "Paulo Costa",
        "url": "/wiki/Paulo_Costa"
    },
    {
        "name": "Pedro Munhoz",
        "url": "/wiki/Pedro_Munhoz"
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
        "name": "Rose Namajunas",
        "url": "/wiki/Rose_Namajunas"
    },
    {
        "name": "Ryan Spann",
        "url": "/wiki/Ryan_Spann"
    },
    {
        "name": "Sam Hughes",
        "url": "/wiki/Sam_Hughes_(fighter)"
    },
    {
        "name": "Sean Strickland",
        "url": "/wiki/Sean_Strickland"
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
        "name": "Veronica Hardy",
        "url": "/wiki/Veronica_Hardy"
    },
    {
        "name": "Vicente Luque",
        "url": "/wiki/Vicente_Luque"
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