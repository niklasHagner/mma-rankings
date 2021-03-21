const googleIt = require('google-it')
var sherdog = require('./sherdog-scraper.js');
var request = require('request');
var cheerio = require('cheerio');

function getMostRecentEventNameAndFighterUrls(params) {
    return new Promise(function (fulfill, reject) {
        request('http://www.sherdog.com/events', function (evError, evResponse, htmlForEvent) {
            var html = cheerio.load(htmlForEvent);
            var eventLinkElements = html('[href^="/events/UFC"]').toArray();
            var selectedEventLinkEl = eventLinkElements[0];
            var eventUrl = 'http://www.sherdog.com' +  selectedEventLinkEl.attribs["href"];
            console.log(selectedEventLinkEl);
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

function getFighterLinksFromEventLink(eventLink) {
    const TAKE_COUNT = 8;
    return new Promise(function (fulfill, reject) {
        request(eventLink, function (error, response, html) {
            if (error) {
                reject(error);
            }
            var $ = cheerio.load(html);
            var linkElems = $('.col_left [href^="/fighter/"]').toArray();
            var links = linkElems.map(function(x) { return x.attribs.href });
            var uniqueLinks = links.filter(filterUniqueLinks);
            uniqueLinks = uniqueLinks.splice(0, Math.min(uniqueLinks.length, TAKE_COUNT));
            uniqueLinks = uniqueLinks.map((x) => {
                return x.indexOf("http://sherdog.com") > -1 ? x : "http://sherdog.com" + x;
            });
            fulfill(uniqueLinks);
        })
    })
}

function filterUniqueLinks(value, index, self) { 
    return self.indexOf(value) === index;
}

function getAllFightersForRecentEvent() {
    return new Promise(function (fulfill, reject) {
        getMostRecentEventNameAndFighterUrls().then(function (data) {
            var promises = [];
            var sherdogUrls = data.fighterLinks;
            console.log("fighters in recent event: ", sherdogUrls);
            sherdogUrls.forEach((url, index) => {
                var promise = getFighterFromSherdogFighterLink(url);
                promises.push(promise);
            });

            var allFighters = [];
            Promise.all(promises).then((promiseValues) => {
                promiseValues.forEach((fighter) => { 
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

//Note - this is not necessary since the 2020 overhaul
async function fetchAllOpponentStats(fulfill, reject, results) {
    var secondaryPromises = [];
    var comparisonNames = [];
    primaryValues.forEach((primary, i) => { //primary
        comparisonNames.push(primary.name);
        var brawls = primary.fightHistory.splice(0, 3);
        brawls.forEach((battle) => {
            secondaryPromises.push(getFighterFromSherdogFighterLink("http://sherdog.com" + battle.opponentUrl, "secondary", primary.name));
        })
    })

    Promise.all(secondaryPromises).then((allSecondaries) => { //3 fetched secondary for each primary
        //the secondary profiles have already been fethed
        //just need to trim their data and push them
        allSecondaries.forEach((opp, ix) => {
            var targetIndex = 0;
            opp.fightHistory.forEach((x, index) => {
                //find when this dude fougth the primary guy
                if (x.opponentName === comparisonNames[ix])
                    targetIndex = index;
            });
            let OFFSET = 2,
                startIndex = Math.max(0, targetIndex - OFFSET),
                count = Math.min(opp.fightHistory.length - 1, targetIndex + OFFSET);

            opp.fightHistory = opp.fightHistory.splice(startIndex, count);
            results[0].opponents.push(opp);
        });
        console.log("Secondary fighters: ", results.length);
        fulfill(results);
    }).catch(function (e) {
        const errorMessage = "error fetching opponents";
        console.error(errorMessage, e);
        reject(errorMessage);
    })
}

function getFighterViaGoogle(name) {
    var options = {
        query: 'www.sherdog.com ' + name,
        limit: 1
    };

    return new Promise(function (fulfill, reject) {
        var urls = [];
        var promises = [];
        googleIt(options).then(results => {
            results.forEach((result) => {
                const isSherdog = result.link.indexOf("www.sherdog.com/fighter/") > -1;
                if (isSherdog) {
                    var fighterData = getFighterFromSherdogFighterLink(result.link, "primary");
                    promises.push(fighterData);
                    fighterData.then(() => {
                        fulfill(fighterData);
                    }).catch((err) => {
                        reject("getfighter promise error : " + err);
                    });
                }
            });
          }).catch(e => {
              console.error("no google results");
          }) 
    });
}

function hasDuplicateHrefs(node, arr) {
    // var found = arr.filter((x) => {
    //     var href = getHref(x);
    //     var findings = arr.find((item) => {
    //         var urlMatch = href.indexOf(getHref(item)) > -1;
    //         return urlMatch;
    //     });
    //     return findings;

    // })

    var nodeLink = getHref(node);
    let foundCount = 0;
    arr.forEach((x) => {
        var link = getHref(x);
        if (nodeLink === link)
            foundCount++;
    })
    return foundCount >= 2;
}

function getHref(x) {
    return x["href"] || x.attribs.href;
}

function getFighterFromSherdogFighterLink(sherdog_url, type, relatedTo) {
    type = type || "primary";
    relatedTo = relatedTo || "";
    sherdog_url = sherdog_url.indexOf("sherdog.com") > -1 ? sherdog_url : "https://www.sherdog.com" + sherdog_url;

    var fighter = {
        name: "",
        nickname: "",
        fullname: "",
        record: "",
        association: "",
        age: "",
        birthday: "",
        hometown: "",
        nationality: "",
        location: "",
        height: "",
        height_cm: "",
        weight: "",
        weight_kg: "",
        weight_class: "",
        college: "",
        degree: "",
        summary: [],
        wins: {
            total: 0,
            knockouts: 0,
            submissions: 0,
            decisions: 0,
            others: 0
        },
        losses: {
            total: 0,
            knockouts: 0,
            submissions: 0,
            decisions: 0,
            others: 0
        },
        strikes: {
            attempted: 0,
            successful: 0,
            standing: 0,
            clinch: 0,
            ground: 0
        },
        takedowns: {
            attempted: 0,
            successful: 0,
            submissions: 0,
            passes: 0,
            sweeps: 0
        },
        fights: []
    };

    return new Promise(function (fulfill, reject) {
        sherdog.getFighter(sherdog_url, function (data) {
            var fighter = data;
            fighter.type = type;
            fighter.relatedTo = relatedTo;
            fulfill(fighter);
        });
    });
}

module.exports = { getFighterViaGoogle, getFighterFromSherdogFighterLink, getAllFightersForRecentEvent };