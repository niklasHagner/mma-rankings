const { parseWikipediaFightRecordTableToJson, parseWikipediaFutureEventsToJson, parseWikipediaFightersOnNextEventToJson } = require('./wikipediaTableParser.js');
const HTMLParser = require('node-html-parser');
const request = require('request');
const striptags = require('striptags');
const { prop } = require('cheerio/lib/api/attributes');

function getNamesAndUrlsOfNextEventFighters() {
  return new Promise(function (fulfill, reject) {
    request('https://en.wikipedia.org/wiki/List_of_UFC_events', function (error, response, html) {
      const rows = parseWikipediaFutureEventsToJson(html);
      const nextEvent = rows.reverse().find((row) => {
        const name = row.eventName.split(":")[0].replace("UFC ", "");
        //Exepect names like 'UFC 123: X vs Y' or names like 'UFC 123' 
        return name.length < 5;
      });
      const urlToLookup = nextEvent.url;
      const nextEventName = nextEvent.eventName;
      request(urlToLookup, function (error, response, html) {
        const fightRows = parseWikipediaFightersOnNextEventToJson(html);
        fulfill({
          fighters: fightRows,
          eventName: nextEventName,
          otherEvents: {  }
        });
      });
    });
  });
}

function getFightersFromNextEvent() {
  return new Promise(function (fulfill, reject) {
    getNamesAndUrlsOfNextEventFighters().then(function (data) {
      var promises = [];
      console.log("\nfighters in next event: ", data.fighters.map(x => x.name).join(","), "\n");
      var fighterPagesToLookUp = data.fighters.filter(x => x.url).map(x => x.url);

      fighterPagesToLookUp.forEach((url) => {
        var promise = scrapeFighterData("https://en.wikipedia.org/" + url);
        promises.push(promise);
      });

      var allFighters = [];
      Promise.all(promises).then((promiseValues) => {
        promiseValues.slice(0, 4).forEach((fighter) => {
          fighter.opponents = [];
          allFighters.push(fighter);
        });

        const returnObject = {
          eventName: data.eventName,
          fighters: allFighters
        }

        console.log(JSON.stringify(returnObject));

        fulfill(returnObject);
      }).catch(function (e) {
        console.error("dang. promiseAll error in getAllFightersForRecentEvent", e);
      })
    })
      .catch((err) => {
        reject("Damn. getAllFightersForRecentEvent error", err);
      });
  });
}

function scrapeFighterData(wikiPageUrl) {
  console.log("will scrape:", wikiPageUrl);

  return new Promise(function (fulfill, reject) {
    request(wikiPageUrl, function (error, response, html) {
      console.log("scraped:", wikiPageUrl);
      const root = HTMLParser.parse(html);
      const infoBox = root.querySelector(".infobox.vcard tbody");
      console.log(infoBox.innerText);
      infoBox.querySelectorAll("sup").forEach(x => x.remove()); //delete footnote references
      const rows = infoBox.querySelectorAll("tr");
      let infoBoxProps = [];
      rows.forEach((row) => {
        let infoBoxKey = row.querySelector(".infobox-label");
        let infoBoxValue = row.querySelector(".infobox-data");
        if (infoBoxKey && infoBoxValue) {
          infoBoxProps.push({ propName: infoBoxKey.innerText, valueNode: infoBoxValue });
        }
      });
      var fighterInfo = {};
      infoBoxProps.forEach((x) => {
        let propName = x.propName;
        let value = x.valueNode.innerText; //most of the time we need text
        let htmlValue = x.valueNode.innerHTML; //on occassion we'll parse the HTML further
        console.log("Original wikipedia key-value:", propName, "=", value);
        propName = propName.trim().replace(/ /g, "").replace(/\)/g, "").replace(/\(/g, "");//remove spaces and parenthesis to turn 'nickname(s)' into 'nicknames' and 'other names' into 'othernames'
        propName = propName[0].toLowerCase() + propName.slice(1, propName.length); //lowercase first char

        const shortName = infoBox.querySelector("tr .fn");
        if (shortName) {
          fighterInfo["name"] = shortName.innerText;
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


          const ageString = splitVals.find(x => x.indexOf("(age&nbsp;"));
          if (ageString) {
            fighterInfo["age"] = striptags(ageString);
          }

          const ageIndex = splitVals.indexOf(ageString);
          if (ageIndex == 1) {//for some reason if age is the second part then the birtname is always the first part.
            fighterInfo["birthName"] = striptags(splitVals[0]);
          } else if (ageIndex < 1) {
            fighterInfo["birthplace"] = striptags(splitVals[1]);
          } 

          if (!fighterInfo["birthplace"] && splitVals.length > 2) {
            fighterInfo["birthplace"] = striptags(splitVals[2]);
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
        else if (propName === "team") {
          const teams = htmlValue.split("<br>");
          value = striptags(teams[teams.length - 1]);
          fighterInfo["team"] = value;
        }
        else { //Most props like wins/losses don't need modification
            fighterInfo[propName] = value;
            console.log("After ->", propName, ":", value);
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
      if (img) returnObj.fighterInfo.relevantImages.push(img.getAttribute("src"));
      fulfill(returnObj);
    });//end wikifind 
  });//promise
}

module.exports = { scrapeFighterData, getFightersFromNextEvent }