const wiki = require('wikijs').default;
const { parseWikipediaFightRecordTableToJson, parseWikipediaFutureEventsToJson, parseWikipediaFightersOnNextEventToJson } = require('./wikipediaTableParser.js');
const HTMLParser = require('node-html-parser');
const request = require('request');

function getMostRecentEventNameAndFighterUrls(params) {
  return new Promise(function (fulfill, reject) {
    request('http://www.sherdog.com/events', function (evError, evResponse, htmlForEvent) {
      var html = cheerio.load(htmlForEvent);
      var eventLinkElements = html('[href^="/events/UFC"]').toArray();
      var selectedEventLinkEl = eventLinkElements[0];
      var eventUrl = 'http://www.sherdog.com' + selectedEventLinkEl.attribs["href"];
      var eventName = cheerio(selectedEventLinkEl).text();
      getFighterLinksFromEventLink(eventUrl).then(function (fighterLinks) {
        fulfill({
          eventName,
          fighterLinks
        });
      })
    })
  })
}

function getNamesAndUrlsOfNextEventFighters() {
  return new Promise(function (fulfill, reject) {
    request('https://en.wikipedia.org/wiki/List_of_UFC_events', function (error, response, html) {
      const rows = parseWikipediaFutureEventsToJson(html);
      const nextEvent = rows.reverse().find((row) => {
        const name = row.eventName.split(":")[0].replace("UFC ", "");
        //Accept 'UFC 123: X vs Y' or 'UFC 123' 
        return name.length < 5;
      });
      const urlToLookup = nextEvent.url;
      request(urlToLookup, function (error, response, html) {
        const fightRows = parseWikipediaFightersOnNextEventToJson(html);
        fulfill(fightRows);
      });
    });
  });
}

function getFightersFromNextEvent() {
  return new Promise(function (fulfill, reject) {
    getNamesAndUrlsOfNextEventFighters().then(function (data) {
          var promises = [];
          console.log("fighters in next event: ", data.map(x => x.name).join(","));
          var namesToLookup = data.filter(x => x.url).map(x => x.name);
          namesToLookup.forEach((url, index) => {
              var promise = parseFighter(url);
              promises.push(promise);
          });

          var allFighters = [];
          Promise.all(promises).then((promiseValues) => {
              promiseValues.slice(0,4).forEach((fighter) => { 
                  fighter.opponents = [];
                  allFighters.push(fighter); 
              });

              const returnObject = {
                  eventName: data.eventName,
                  fighters: allFighters
              }

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

function parseFighter(name) {
  return new Promise(function (fulfill, reject) {
    wiki().find(name).then((page) => {
      console.log(page.title);
      page.fullInfo().then((content) => {
        var fighterInfo = content.general;
        page.html().then(html => {
          var parsedTable = parseWikipediaFightRecordTableToJson(html);
          var record = parsedTable[0];
          var returnObj = {
            fighterInfo,
            record: record,

            recordString: record.map((fight) => {
              var ff = fight;
              var val = Object.keys(fight).map(function (key, ix) {
                var v = ff[key];
                return v;
              })
              return val.join("");
            }).join("<br>")
          }
          const nameStrings = fighterInfo.name.split(" ");
          page.images().then(allWikiImages => {
            const relevantImages = allWikiImages.filter(x => {
              const match = nameStrings.find(name => x.toLowerCase().indexOf(name.toLowerCase()) > -1)
              if (match) return true;
            });
            returnObj.fighterInfo.relevantImages = relevantImages,
            fulfill(returnObj);
          });
        })
      })
    });//end wikifind 
  });//promise
}

module.exports = { parseFighter, getFightersFromNextEvent }