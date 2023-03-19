const { parseWikipediaFightRecordTableToJson, parseWikipediaFutureEventsToJson, parseWikipediaFightersOnNextEventToJson } = require('./wikipediaTableParser.js');
const HTMLParser = require('node-html-parser');
const gisImageSearch = require("g-i-s");
const axios = require('axios').default;
const fileHelper = require("./fileHelper.js");
const { stripTagsAndDecode, removeUnwantedTagsFromHtmlNode } = require("./stringAndHtmlHelper.js");

async function getNamesAndUrlsOfNextEventFighters() {
  let htmlForEvents;
  try {
    const { data } = await axios.get('https://en.wikipedia.org/wiki/List_of_UFC_events');
    htmlForEvents = data;
  } catch(error) {
    return;
  }
  const rows = await parseWikipediaFutureEventsToJson(htmlForEvents);

  //each row contains: {eventName,url,date,venue,location}
  const nextBigEvent = rows.reverse().find((row) => {
    const name = row.eventName.split(":")[0].replace("UFC ", "");
    //A big event is named 'UFC 200' or 'UFC 260: X vs Y'. But not 'UFC Fight Night 50'
    return name.length < 5;
  });
  nextBigEvent.isBigEvent = true;
  const allEventObjs = rows.filter(x => x.url !== nextBigEvent.url).concat(nextBigEvent); //.slice(0, 2);
  const promises = allEventObjs.map(event => axios.get(event.url).then(response => response.data));
  const promiseResponses = await Promise.all(promises);
  const all = promiseResponses.map((htmlForSingleEvent, ix) => {
    const eventInfo = allEventObjs[ix];
    const fightRows = parseWikipediaFightersOnNextEventToJson(htmlForSingleEvent, eventInfo);
    return { fighters: fightRows, ...eventInfo };
  })
  return {
    allEvents: all
  };
}

async function getInfoAndFightersFromNextEvents() {
  const data = await getNamesAndUrlsOfNextEventFighters();
  const allEvents = data.allEvents;
  const promises = allEvents.map(x => getInfoAndFightersFromSingleEvent(x));
  const promiseValues = await Promise.all(promises);

  return {
    events: promiseValues
  }
}

const FIGHTERS_TO_LOOKUP = 12;
async function getInfoAndFightersFromSingleEvent(event) {
  console.log("\nFighters in next event: ", event.fighters.map(x => x.name).join(","), "\n");

  //Work in pairs. Look up both fighters, or neither.
  const fighters = event.fighters;
  const fighterProfiles = [];
  const otherFightersOnCard = [];
  for (let i = 0; i < fighters.length; i += 2) {
    if (fighterProfiles.length < FIGHTERS_TO_LOOKUP && fighters[i].url && fighters[i + 1].url) {
      fighterProfiles.push(fighters[i]);
      fighterProfiles.push(fighters[i + 1]);
    } else {
      otherFightersOnCard.push(fighters[i]);
      otherFightersOnCard.push(fighters[i + 1]);
    }
  }

  const readExistingFromFile = true, allowFetchingMissingFighters = false;
  const fightersWithDetails = await fetchArrayOfFighters(fighterProfiles, readExistingFromFile, allowFetchingMissingFighters);

  const mainMatches = [];
  for (let i = 0; i < fightersWithDetails.length; i += 2) {
    mainMatches.push({ fighters: [fightersWithDetails[i], fightersWithDetails[i + 1]] });
  }
  const moreMatches = [];
  for (let i = 0; i < otherFightersOnCard.length; i += 2) {
    moreMatches.push({ fighters: [otherFightersOnCard[i], otherFightersOnCard[i + 1]] });
  }

  const singleEvent = {
    ...event,
    fighters: fightersWithDetails,
    mainMatches,
    otherFightersOnCard,
    moreMatches
  };
  return singleEvent;
}

/*
  arrayOfNamesAndUrls example data:
  [ 
    {name: 'Kelvin Gastelum', url: '/wiki/Kelvin_Gastelum'}  
  ]
*/
async function fetchArrayOfFighters(arrayOfNamesAndUrls, readExistingFromFile = true, allowFetchingMissingFighters = false) {
  var promises = [];

  let arrayOfNamesAndUrlsToScrape;
  if (readExistingFromFile) {
    //If a fighter is not found, null will be appended to the array
    //So an array can be [fighter, null, fighter, null, null]
    const fightersFromFiles = arrayOfNamesAndUrls.map(fileHelper.readFileByFighterObj);
    const indexesWhichDontHaveFiles = fightersFromFiles.map((item, ix) => { return { index: ix, data: item } }).filter(x => x.data === null).map(x => x.index);
    const arrayOfNamesAndUrlsWhichAreMissingFiles = arrayOfNamesAndUrls.filter((item, ix) => indexesWhichDontHaveFiles.includes(ix));
    
    if (arrayOfNamesAndUrlsWhichAreMissingFiles.length === 0) {
      return fightersFromFiles;
    } else {
      console.log(`Missing files for ${arrayOfNamesAndUrlsWhichAreMissingFiles.length} fighters in the event: ${arrayOfNamesAndUrlsWhichAreMissingFiles.map(x => x.url).join(", ")}`);
    }
    
    if (allowFetchingMissingFighters === false) {
      console.log(`We'll just return fighters we have on file.`);
      //Replace null with an object that has a name.
      //Others will check for the missingData prop
      indexesWhichDontHaveFiles.forEach(badIndex => {
        const minimalFighter = {
          fighterInfo: {
            name: arrayOfNamesAndUrls[badIndex].name
          },
          missingData: true
        }
        fightersFromFiles[badIndex] = minimalFighter;
      });
      return fightersFromFiles;
    }
    
    arrayOfNamesAndUrlsToScrape = arrayOfNamesAndUrlsWhichAreMissingFiles;
  } else {
    arrayOfNamesAndUrlsToScrape = arrayOfNamesAndUrls;
  }

  arrayOfNamesAndUrlsToScrape.filter(x => x.url).forEach((x) => {
    const url = x.url.includes("https://en.wikipedia.org/") ? x.url : `https://en.wikipedia.org/${x.url}`;
    var promise = scrapeFighterData(url);
    promises.push(promise);
  });

  const allFighters = [];
  const promiseValues = await Promise.all(promises);
  promiseValues.forEach((fighter) => {
    allFighters.push(fighter);
  });
  return allFighters;
}

function parseInfoBoxHtml(root, wikiPageUrl) {
  const infoBox = root.querySelector(".infobox.vcard tbody");//can be null
  if (!infoBox) {
    const msg = `Missing infobox for ${wikiPageUrl}`;
    console.error(msg);
    return null;
  }
  infoBox.querySelectorAll("sup").forEach(x => x.remove()); //delete footnote references
  const rows = infoBox.querySelectorAll("tr");
  let infoBoxProps = [];
  rows.forEach((row) => {
    let infoBoxKey = row.querySelector(".infobox-label");
    let infoBoxValue = row.querySelector(".infobox-data");
    if (infoBoxKey && infoBoxValue) {
      infoBoxProps.push({
        propName: infoBoxKey.textContent.replace(/\s/g, "").replace(/\-/g, "_"),
        valueNode: infoBoxValue
      });
    }
  });
  var fighterInfo = {
    wikiUrl: wikiPageUrl
  };

  infoBoxProps.forEach((x) => {
    let propName = x.propName;
    const valueNode = x.valueNode;
    let value = valueNode.textContent; //most of the time we need text
    let htmlValue = valueNode.innerHTML; //on occassion we'll parse the HTML further
    // console.log("Original wikipedia key-value:", propName, "=", value);
    propName = propName.trim().replace(/ /g, "").replace(/\)/g, "").replace(/\(/g, "");//remove spaces and parenthesis to turn 'nickname(s)' into 'nicknames' and 'other names' into 'othernames'
    propName = propName[0].toLowerCase() + propName.slice(1, propName.length); //lowercase first char

    const shortName = infoBox.querySelector("tr .fn");
    if (shortName) {
      fighterInfo["name"] = shortName.textContent;
    }

    /*
      WIKIPEDIA EXAMPLE
      -------------------
      born: "Francis Zavier Ngannou[1]"
      by decision: "3"
      by knockout: "12"
      by submission: "4"
      division: "Heavyweight"
      fighting out of: "Paris, France[4]"
      height: "6 ft 4 in (193 cm)"
      losses: "3"
      nationality: "French, Cameroonian"
      nickname(s): "The Predator"
      reach: "83 in (211 cm)[2]"
      residence: "Las Vegas, Nevada, US"
      team: "MMA Factory (2013–2018)[5][6]"
      total: "19"
      trainer: "Eric Nicksick (Head coach)[8]"
      weight: "263 lb (119 kg; 18 st 11 lb)"
      wins: "16"
      years active: "2013–present"
    */

    /* FORMATTING QUIRKS
    --------------------
    fightingoutof can hold multiple rows
      <td class="infobox-data"><a href="/wiki/Gastonia,_North_Carolina" title="Gastonia, North Carolina">Gastonia, North Carolina</a>, United States<sup id="cite_ref-bbmmafighting_2-1" class="reference"><a href="#cite_note-bbmmafighting-2">[2]</a></sup><br><a href="/wiki/Minneapolis,_Minnesota" class="mw-redirect" title="Minneapolis, Minnesota">Minneapolis, Minnesota</a>, United States (formerly)</td>
    */

    //PROPERTY PARSER
    //Parse wikipedia html to our dataModel, with various quirks depending on the type of fileds

    if (propName === "born") {
      /*
        We want to extract birthplace from a "born"-field which contain age, name and birthplace.
        The html structure doesn't inform us of which element is which so we'll assume based off current wikipedia presentation that if there are 3 <br> elements the birthplace is the last one.

        ---Example1---
        <td class="infobox-data">Landon Anthony Vannata<sup id="cite_ref-fn_1-0" class="reference"><a href="#cite_note-fn-1">[1]</a></sup><br><span style="display:none"> (<span class="bday">1992-03-14</span>) </span>March 14, 1992<span class="noprint ForceAgeToShow"> (age&nbsp;30)</span><br><a href="/wiki/Neptune_City,_New_Jersey" title="Neptune City, New Jersey">Neptune City, New Jersey</a>, United States</td>
        
        ---Example 2---
        <td class="infobox-data">Stephen Thompson<br><span style="display:none"> (<span class="bday">1983-02-11</span>) </span>February 11, 1983<span class="noprint ForceAgeToShow"> (age&nbsp;39)</span><br><a href="/wiki/Simpsonville,_South_Carolina" title="Simpsonville, South Carolina">Simpsonville, South Carolina</a>, U.S.</td>
      */
      const splitVals = htmlValue.split("<br>");

      //Before nov2022 wikipedia used &nbsp;, then theey switched to the html code &#160;
      let matchingAgeItem = splitVals.filter(x => x.indexOf("(age&nbsp;") > -1 || x.indexOf("(age&#160;") > -1 || x.indexOf("ForceAgeToShow") > -1);

      //example value: '(1989-09-29) September 29, 1989 (age&#160;33)'
      fighterInfo["ageFullString"] = matchingAgeItem.length > 0 ? stripTagsAndDecode(matchingAgeItem[0]) : "-";

      //Example value: ['(age&#160;33)', 'age&#160;33']
      const ageFullStringMatches = fighterInfo["ageFullString"].match(/\((age.*?)\)/)
      if (ageFullStringMatches && ageFullStringMatches.length > 0) {
        //Strip parenthesis, spaces, nbsp and similar
        const ageStr = ageFullStringMatches[0].replace("age&nbsp;", "").replace("age&#160;", "").replace("(", "").replace(")", "");
        fighterInfo["age"] = ageStr;
      } else {
        console.warn(`Couldn't find age for ${fighterInfo["name"]}`);
        fighterInfo["age"] = "?";
      }

      //Wikitable Birthplaces often contain links to cities/countries. If not - they have to be guessed based on placement within the string array
      const linkCountPerSplitVal = splitVals.map((splitVal) => {
        return splitVal.replace(`href="#`, "").split(`<a href`).length - 1; //hacky string-counter. Disregard hashlinks which are often used for fullName
      });
      const max = Math.max(...linkCountPerSplitVal);
      if (max > 0) {
        const indexOfItemWithMostLinks = linkCountPerSplitVal.indexOf(max);
        fighterInfo["birthplace"] = stripTagsAndDecode(splitVals[indexOfItemWithMostLinks]);
      }
      else {
        if (splitVals.length > 2) {
          fighterInfo["birthplace"] = stripTagsAndDecode(splitVals[2]);
        } else {
          fighterInfo["birthplace"] = stripTagsAndDecode(splitVals[0]);
        }
      }
      fighterInfo["birthplace"] = fighterInfo["birthplace"].trim();
    }
    else if (propName === "nicknames" || propName === "othernames") {
      fighterInfo["nickname"] = stripTagsAndDecode(htmlValue.split("<br>")[0]);
    }
    else if (propName === "total") fighterInfo["totalFights"] = value;
    else if (propName === "bydecision") fighterInfo["decisionWins"] = value;
    else if (propName === "byknockout") fighterInfo["knockoutWins"] = value;
    else if (propName === "bysubmission") fighterInfo["submissionWins"] = value;
    else if (propName === "yearsactive") fighterInfo["yearsActive"] = value;
    else if (propName === "fightingoutof") fighterInfo["fightingOutOf"] = value;
    else if (propName === "reach") {
      const partBeforeReference = value.split("[")[0];
      fighterInfo["reach"] = partBeforeReference;
    }
    else if (propName === "team") {
      const teams = htmlValue.split("<br>").map(x => stripTagsAndDecode(x));
      fighterInfo.teams = teams;
      fighterInfo.team = teams[0];//Most recent team is the most interesting
    }
    else { //Most props like wins/losses don't need modification
      fighterInfo[propName] = value;
      // console.log("Modified prop ->", propName, ":", value);
    }
  });
  var recordTables = parseWikipediaFightRecordTableToJson(root, fighterInfo.name);
  var record = recordTables[0];
  var returnObj = {
    fighterInfo,
    record: record,
    recordString: "" //TODO
    // recordString: record.map((recordRow) => {
    //   var val = Object.keys(recordRow).map(key => fight[key]);
    //   return val.join("");
    // }).join("<br>")
  }
  return returnObj;
}

function findImagesForFighter(fighterName) {
  const query = `${fighterName} + ufc mma fighter profile`;
  return new Promise(async (resolve, reject) => {
    const googleImageSearchOptions = {
      searchTerm: query,
      queryStringAddition: '&tbs=iar:t', //portrait format only (via https://www.google.com/advanced_image_search)
      filterOutDomains: [ // AVOID THESE
        "gettyimages.com", // water marked
        "ebayimg.com", // ugly sports cards
        "sportscardinvestor.s3.amazonaws.com", // ugly sports cards
        "tiktok.com", // broken
        "mmanytt.se", // often wrong fighter
        "kimura.se", // often wrong fighter
        "lookaside.fbsbx.com", // broken
        "images.google.com", // 403
        "instagram.com", // 403
        "mmagirls.co", // 403
        "24smi.org", // 403,
        "awakeningfighters.com", //hotlink blocked
        "images.mma-core.com", //403
        "preview.redd.it", //403
        "pbs.twimg.com", //400
        "upload.wikimedia.org", // wikipedia's poor public domain photos
        "sherdog.com" //unstable, some images will not render
      ]
    };
    gisImageSearch(googleImageSearchOptions, (error, imageResults) => {
      //imageResults will be an array of objects with 3 props: url, width, height
      if (error) {
        console.error("gis image search error:", error);
        return reject("gis image search error:", error);
      }
      if (!imageResults && imageResults.length > 0) {
        console.error("gis zero hits");
        return reject("gis zero hits");
      }

      let imgUrls = imageResults.map(x => x.url);
      const bestImage = imgUrls.find(x => x.includes("athlete_bio_full_body")
        && (x.toLowerCase().includes(fighterName.split(" ")[0].toLowerCase()) || x.toLowerCase().includes(fighterName.split(" ")[1].toLowerCase()))
      );
      if (bestImage) {
        const ix = imgUrls.indexOf(bestImage);
        imgUrls.splice(ix, 1);
        imgUrls.unshift(bestImage);
      }
      return resolve(imgUrls);
    });
  });
}

async function scrapeFighterData(wikiPageUrl) {
  return new Promise(async (resolve, reject) => {
    let response;
    try {
      console.log(`Start scraping ${wikiPageUrl}`);
      response = await axios.get(wikiPageUrl);
    } catch(error) {
      console.log(`Error scraping ${wikiPageUrl}. Error:${error}`); 
      reject("scraping error");
    }
    if (response.status !== 200) { console.log(`Error scraping ${wikiPageUrl}. Status: ${response.status}`); reject("scraping error"); }
    const html = await response.data;
    const root = HTMLParser.parse(html);
    removeUnwantedTagsFromHtmlNode(root);
    const detect429Status = root.querySelector("body").innerHTML.indexOf("Wikimedia error") > -1;
    if (detect429Status) {
      console.warn(`Wikimedia returned status:429 for ${wikiPageUrl}`);
    }
    const fighterObj = parseInfoBoxHtml(root, wikiPageUrl);
    if (!fighterObj) { 
      reject(`parseInfoBoxHtml failed for ${wikiPageUrl}`); 
    }

    console.log(`Successfully scraped ${wikiPageUrl}`);
    try {
      const imageArray = await findImagesForFighter(fighterObj.fighterInfo["name"]);
      fighterObj.fighterInfo.relevantImages = imageArray;
    } catch(err) {
      console.log(`findImagesForFighter failed for ${wikiPageUrl}`);
      fighterObj.fighterInfo.relevantImages = [];
      return resolve(fighterObj);
    }
    return resolve(fighterObj);
  })
}

module.exports = {
  scrapeFighterData,
  getInfoAndFightersFromNextEvents,
  fetchArrayOfFighters
}