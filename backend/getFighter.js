var googleSearch = require('./google.js');
var sherdog = require('./ufc-scraper-lib.js');
var request = require('request');
var cheerio = require('cheerio');

function getFightersFromMostRecentSherdogEvent(params) {
    return new Promise(function (fulfill, reject) {
        request('http://www.sherdog.com/events', function (evError, evResponse, evHtml) {
            var evCheerio = cheerio.load(evHtml);
            var eventLinks = evCheerio('[href^="/events/UFC"]').toArray();
            eventLinks = eventLinks.map(function (link) { return link.attribs["href"] });
            console.log("event links: ", eventLinks);
            var eventLink = 'http://www.sherdog.com' + eventLinks[0];
            console.log("UFC event:", eventLink);
            getFightersFromSingleEvent(eventLink).then(function (json) {
                fulfill(json);
            })
        })

    })
}

function getFightersFromSingleEvent(eventLink) {
    return new Promise(function (fulfill, reject) {
        request(eventLink, function (error, response, html) {
            if (error) {
                reject(error);
            }
            var $ = cheerio.load(html);
            var linkElems = $('.col_left [href^="/fighter/"]').toArray();
            var links = linkElems.map(function(x) { return x.attribs.href });
            //var uniqueLinks = links.filter((link) => { return hasDuplicateHrefs(link, links) == false; });
            var uniqueLinks = links.filter( onlyUnique ); // returns ['a', 1, 2, '1']
            uniqueLinks = uniqueLinks.splice(0, Math.min(uniqueLinks.length, 4));
            uniqueLinks = uniqueLinks.map((x) => {
                return x.indexOf("http://sherdog.com") > -1 ? x : "http://sherdog.com" + x;
            });
            var json = { links: uniqueLinks };
            fulfill(json);
        })
    })
}

function onlyUnique(value, index, self) { 
      return self.indexOf(value) === index;
  }

function getAllFightersForRecentEvent(params) {
    return new Promise(function (fulfill, reject) {
        var urls = [];
        getFightersFromMostRecentSherdogEvent().then(function (data) {
            var promises = [];
            var sherdogUrls = data.links;
            console.log("sherdogurls: ", sherdogUrls);
            sherdogUrls.forEach((url, index) => {
                var promise = generateFighterData(url);
                promises.push(promise);
            });

            var results = []; //push every fighter to this

            Promise.all(promises).then((primaryValues) => {
                //fulfill(primaryValues); // if it's enough with 1 level
                primaryValues.forEach((p) => { 
                    p.opponents = [];
                    results.push(p); 
                });

                var secondaryPromises = [];
                var comparisonNames = [];
                primaryValues.forEach((primary, i) => { //primary
                    comparisonNames.push(primary.name);
                    var brawls = primary.fightHistory.splice(0, 3);
                    brawls.forEach((battle) => {
                        secondaryPromises.push(generateFighterData("http://sherdog.com" + battle.oppnentUrl, "secondary", primary.name));
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
                        //results.push(opp);
                        results[0].opponents.push(opp);
                    });
                    console.log("Secondary fighters: ", results.length);
                    fulfill(results);

                }).catch(function (e) {
                    console.error("Dang! Promise level 3 error", e);
                })
            }).catch(function (e) {
                console.error("dang. promiseAll error level 1.", e);
            })


        })
        .catch((err) => {
            reject("Damn. GetFighter error", err);
        });
    });
}

function getFighterViaGoogle(name) {
    var options = {
        query: 'www.sherdog.com ' + name,
        limit: 1
    };

    return new Promise(function (fulfill, reject) {
        var urls = [];
        var promises = [];
        googleSearch.search(options, function (err, url) {
            // This is called for each result
            if (err || !url) {
                console.error("GETFIGHTER-ERROR:", err);
                reject("Damn. GetFighter error", err);
            }

            if (url.indexOf("www.sherdog.com/fighter/") > -1) {
                urls.push(url);
                console.log(url);
                var fighterData = generateFighterData(url, "primary");
                promises.push(fighterData);

                fighterData.then(() => {
                    fulfill(fighterData);
                }).catch((err) => {
                    reject("getfighter promise error : " + err);
                });
            }
            else {
                reject("damn, no sherdog google hits");
            }
        });
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

function generateFighterData(sherdog_url, type, relatedTo) {
    type = type || "primary";
    relatedTo = relatedTo || ""

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

module.exports = { getFighterViaGoogle: getFighterViaGoogle, getFromEvent: getAllFightersForRecentEvent };