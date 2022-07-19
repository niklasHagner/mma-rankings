const { parseWikipediaFightRecordTableToJson, parseWikipediaFutureEventsToJson, parseWikipediaFightersOnNextEventToJson } = require('./wikipediaTableParser.js');
const HTMLParser = require('node-html-parser');
const request = require('request');
const fetch = require('node-fetch');
const striptags = require('striptags');
const gisImageSearch = require("g-i-s");
const fileHelper = require("./fileHelper.js");

const READ_FROM_FILE = true;

async function getNamesAndUrlsOfNextEventFighters() {

  const response = await fetch('https://en.wikipedia.org/wiki/List_of_UFC_events');
  const htmlForAllUfcEvents = await response.text();
  const rows = await parseWikipediaFutureEventsToJson(htmlForAllUfcEvents);

  //each row contains: {eventName,url,date,venue,location}
  const nextBigEvent = rows.reverse().find((row) => {
    const name = row.eventName.split(":")[0].replace("UFC ", "");
    //A big event is named 'UFC 200' or 'UFC 260: X vs Y'. But not 'UFC Fight Night 50'
    return name.length < 5;
  });
  nextBigEvent.isBigEvent = true;
  const otherEvents = rows.filter(x => x.url !== nextBigEvent.url).slice(0, 2);
  const allEventObjs = [...otherEvents, nextBigEvent];
  const promises = allEventObjs.map(event => fetch(event.url).then(response => response.text()));
  const promiseResponses = await Promise.all(promises);
  const all = promiseResponses.map((htmlForSingleEvent, ix) => {
    const fightRows = parseWikipediaFightersOnNextEventToJson(htmlForSingleEvent);
    const eventInfo = allEventObjs[ix];
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
  console.log("\nfighters in next event: ", event.fighters.map(x => x.name).join(","), "\n");

  const fightersToLookUp = event.fighters.slice(0, FIGHTERS_TO_LOOKUP);
  const fightersWithDetails = await fetchArrayOfFighters(fightersToLookUp);
  const otherFightersOnCard = event.fighters.slice(FIGHTERS_TO_LOOKUP, event.fighters.length);
  const moreMatches = [];
  for (let i = 0; i < otherFightersOnCard.length; i+=2) {
    moreMatches.push({ fighters: [ otherFightersOnCard[i], otherFightersOnCard[i+1] ]} );
  }
  const mainMatches = [];
  for (let i = 0; i < fightersWithDetails.length; i+=2) {
    mainMatches.push({ fighters: [ fightersWithDetails[i], fightersWithDetails[i+1] ]} );
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

async function fetchArrayOfFighters(fighters) {
  var promises = [];

  if (READ_FROM_FILE) {
    const fightersFromFiles = fighters.map(fileHelper.readFighter);
    const nullCount = fightersFromFiles.filter(x => x === null).length;
    if (nullCount === 0) { 
      return fightersFromFiles;
    };
  }

  var fighterPagesToLookUp = fighters.filter(x => x.url).map(x => x.url);

  fighterPagesToLookUp.forEach((url) => {
    var promise = scrapeFighterData("https://en.wikipedia.org/" + url);
    promises.push(promise);
  });

  var allFighters = [];
  const promiseValues = await Promise.all(promises);
  promiseValues.forEach((fighter) => {
    fighter.opponents = [];
    allFighters.push(fighter);
  });
  return allFighters;
}

function scrapeFighterData(wikiPageUrl) {
  return new Promise(function (fulfill, reject) {
    request(wikiPageUrl, function (error, response, html) {
      console.log("scraped:", wikiPageUrl);
      const root = HTMLParser.parse(html);

      const nodesToRemove = Array.from(root.querySelectorAll("script")).concat(Array.from(root.querySelectorAll("style")));
      nodesToRemove.forEach((x) => x.parentNode.removeChild(x));

      const infoBox = root.querySelector(".infobox.vcard tbody");
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

        //Rewrite the propnames from Wikipedia Table to our dataModel
        //Parse values differently based on each prop

        if (propName === "born") { /*
            This field can contain 1-3 different things: age, name, birthplace.

            It's impossible to know which piece is the birthplace based on nodes. Sometimes it's an anchor tag but not always. We just have to assume that if there are 3 <br> elements the birthplace is the last one.

            ---Example1---
            <span style="display:none"> (<span class="bday">1988-09-29</span>) </span>29 September 1988<span class="noprint ForceAgeToShow"> (age&nbsp;33)</span><sup id="cite_ref-1" class="reference"><a href="#cite_note-1" data-ol-has-click-handler="">[1]</a></sup>
            <br>
            <a href="/wiki/Warilla,_New_South_Wales" title="Warilla, New South Wales">Warilla, New South Wales</a>, Australia

            ---Example2---
            Landon Anthony Vannata<sup id="cite_ref-1" class="reference"><a href="#cite_note-1" data-ol-has-click-handler="">[1]</a></sup><br><span style="display:none"> (<span class="bday">1992-03-14</span>) </span>March 14, 1992<span class="noprint ForceAgeToShow"> (age&nbsp;29)</span>
            <br>
            <a href="/wiki/Neptune_City,_New_Jersey" title="Neptune City, New Jersey">Neptune City, New Jersey</a>, <a href="/wiki/United_States" title="United States">United States</a>
             */
          const splitVals = htmlValue.split("<br>");

          //WikiTable ages can be identified via strings
          let matchingAgeItem = splitVals.filter(x => x.indexOf("(age&nbsp;") > -1 || x.indexOf("ForceAgeToShow") > -1);
          fighterInfo["ageFullString"] = matchingAgeItem.length > 0 ? striptags(matchingAgeItem[0]) : "-";
          const ageStr = fighterInfo["ageFullString"].match(/\((age.*?)\)/)[1]; //returns like "age 32"
          fighterInfo["age"] = ageStr.slice(ageStr.length - 2, ageStr.length);


          //Wikitable Birthplaces often contain links to cities/countries. If not - they have to be guessed based on placement within the string array
          const linkCountPerSplitVal = splitVals.map((splitVal) => {
            return splitVal.replace(`href="#`, "").split(`<a href`).length - 1; //hacky string-counter. Disregard hashlinks which are often used for fullName
          });
          const max = Math.max(...linkCountPerSplitVal);
          if (max > 0) {
            const indexOfItemWithMostLinks = linkCountPerSplitVal.indexOf(max);
            fighterInfo["birthplace"] = striptags(splitVals[indexOfItemWithMostLinks]);
          }
          else {
            if (splitVals.length > 2) {
              fighterInfo["birthplace"] = striptags(splitVals[2]);
            } else {
              fighterInfo["birthplace"] = striptags(splitVals[0]);
            }
          }
          fighterInfo["birthplace"] = fighterInfo["birthplace"].trim();
        }
        else if (propName === "nicknames" || propName === "othernames") {
          fighterInfo["nickname"] = striptags(htmlValue.split("<br>")[0]);
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
          const teams = htmlValue.split("<br>").map(x => striptags(x));
          newestTeam = teams[0];
          fighterInfo["team"] = newestTeam;
          fighterInfo.teams = teams;
        }
        else { //Most props like wins/losses don't need modification
          fighterInfo[propName] = value;
          // console.log("Modified prop ->", propName, ":", value);
        }
      });
      var recordTables = parseWikipediaFightRecordTableToJson(html);
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
      // const relevantImages = allWikiImages.filter(x => {
      //   const match = nameStrings.find(name => x.toLowerCase().indexOf(name.toLowerCase()) > -1)
      //   if (match) return true;
      // });
      // returnObj.fighterInfo.relevantImages = relevantImages,
      returnObj.fighterInfo.relevantImages = [];
      const img = infoBox.querySelector("img");

      let query = `${fighterInfo["name"]} + MMA`;
      var gisOptions = {
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
          "24smi.org" // 403
        ]
      };
      gisImageSearch(gisOptions, (error, imageResults) => {
        //imageResults will be an array of objects with 3 props: url, width, height
        if (error) {
          console.error("gis image search error:", error);
        }
        if (imageResults && imageResults.length > 0) {
          let imgUrls = imageResults.map(x => x.url);
          const bestImage = imgUrls.find(x => x.includes("athlete_bio_full_body"));
          if (bestImage) {
            const ix = imgUrls.indexOf(bestImage);
            imgUrls.splice(ix, 1);
            imgUrls.unshift(bestImage);
          }
          //Wikipedia's images suck so place them last in the array
          returnObj.fighterInfo.relevantImages = imgUrls.concat(returnObj.fighterInfo.relevantImages).slice(0, 3);
        }
        fulfill(returnObj);
      });
    });//end wikifind 
  });//promise
}

module.exports = { scrapeFighterData, getInfoAndFightersFromNextEvents }