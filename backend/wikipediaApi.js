const { parseWikipediaFightRecordTableToJson, parseWikipediaFutureEventsToJson, parseWikipediaFightersOnNextEventToJson } = require('./wikipediaTableParser.js');
const HTMLParser = require('node-html-parser');
const request = require('request');
const striptags = require('striptags');

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
        fulfill({fighters: fightRows, eventName: nextEventName});
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

      //TODO: ta bort slice
      fighterPagesToLookUp.slice(0, 1).forEach((url) => {
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
        let valueNode = x.valueNode;
        let textValue = valueNode.innerText;
        let htmlValue = valueNode.innerHTML;
        let value = textValue;
        console.log("Before -> ", propName, ":", textValue);
        propName = propName.trim().replace(/ /g, "").replace(/\)/g, "").replace(/\(/g, "");
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
        if (propName === "born") { //1. full name, 2. birthday an dage, 3. birthplace
          propName = "fullName";
          value = htmlValue;
          const splitVals = value.split("<br>");
          console.log("splitVals", splitVals);
          value = striptags(splitVals[0]);
          if (splitVals.length > 1) {
            fighterInfo["age"] = striptags(splitVals[1]);
          }
          if (splitVals.length > 2) {
            fighterInfo["birthplace"] = striptags(splitVals[2]);
          }
        }
        else if (propName === "nicknames") {
          propName = "nickname";
          value = htmlValue;
          value = value.split("<br>")[0];
          value = striptags(value);
        }
        else if (propName === "total") propName = "totalFights";
        else if (propName === "bydecision") propName = "decisionWins";
        else if (propName === "byknockout") propName = "knockoutWins";
        else if (propName === "bysubmission") propName = "submissionWins";
        else if (propName === "yearsactive") propName = "yearsActive";
        else if (propName === "fightingoutof") propName = "fightingOutOf";
        else if (propName === "team") {
          const teams = value.split("\n");
          value = teams[teams.length - 1];
        }
        fighterInfo[propName] = value;
        console.log("After ->", propName, ":", value);
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