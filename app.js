const express = require("express");
const app = express();
const fs = require('fs');
const winston = require('winston');
const sherdog = require('./backend/getFighter.js');
const mmastats = require('./backend/scrapeMmaStatsDotCom');
const { findRankAtTime } = require('./backend/findRank');
const path = require('path');

console.log("Launching");

winston.configure({
    transports: [
        new (winston.transports.File)({ filename: 'app.log' })
    ]
})

var settings = {
    logOutputOnce: true,
    loggedResponses: 0,
    caching: false,
    storedResponses: {}, //keymap
}

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.use(express.static('public'));

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + "/public/index.html"));
});

const defaultResponse = {
    error: true
};

app.get('/searchfileforfighter', function (req, res) {
    const name = req.query.name || "Jon Jones";
    const date = req.query.date || "2016-01-02";
    
    let rawdata = fs.readFileSync("data/data2.json");
    let data = JSON.parse(rawdata);
    const rank = findRankAtTime(data, name, date);
    const jsonResult = { "mostRecentMatch": rank };
    return res.json(jsonResult);
});

app.get('/scrape', async function (req, res) {
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    const scrapeStatus = await mmastats.scrapeRankingsForMultipleDates(startDate, endDate);
    res.send(scrapeStatus);
});

app.get('/serve-rankings-file', async function (req, res) {
    let rawdata = fs.readFileSync("data/data2.json");
    let jsonData = JSON.parse(rawdata);
    res.json(jsonData);
});

app.get('/mma-stats-by-date', async function (req, res) {
    res.contentType('application/json');
    if (typeof req.query.date === 'undefined') {
        const errorMessage =" Error. Try something like this instead: /mma-stats-by-date?date=2019-02-30";
        console.error(errorMessage);
        res.send({error:errorMessage});
        return;
    }
    console.log('called with query:', req.query);

    const json = await mmastats.scrapeMmaStats(req.query.date);
    res.send(json);
});

app.get('/fighter-profile', function (req, response) {
    response.contentType('application/json');
    var defaultResponse = {
        error: true
    };

    if (typeof req.query.name === 'undefined') {
        console.error(" Error. Try something like this instead: /fighter-profile?name=Fedor");
        response.send(defaultResponse);
        return;
    }
    if (settings.caching) {
        var cachedResponse = getStoredResponse(req.query);
        if (cachedResponse) {
            console.log("sending cached response");
            response.send(cachedResponse);
            return;
        }
    }

    var fighterName = decodeURIComponent(req.query.name);
    if (fighterName) {
        console.log("calling mma.fighter for name:", fighterName);
    } else {
        console.log("calling mma.fighter without argument (fetching top 4 from latest event)");
    }

    sherdog.getFromEvent().then(function (fightersFromEvent) {
        // if (settings.logOutputOnce && settings.loggedResponses <= 0) {
        //     winston.log('info', fightersFromEvent);
        //     storeResponse(req.query, fightersFromEvent);
        //     settings.loggedResponses++;
        // }

        //append extra info to the fighter
        let allRankingsFromFile = fs.readFileSync("data/data2.json");
        let allRankingsData = JSON.parse(allRankingsFromFile);
        if (Array.isArray(fightersFromEvent)) { //when sherdog-api is called without a fightername-query it will return 4 fighters in an array
            fightersFromEvent = fightersFromEvent.map((fighter) => {
                const fightHistory = fighter.fightHistory;
                const extendedFightHistory = fightHistory.map((fight) => {
                    const lookupName = fight.opponentName;
                    const lookupDate = fight.date;
                    const opponentInfoAtTheTime = findRankAtTime(allRankingsData, lookupName, lookupDate);
                    return { ...fight, opponentInfoAtTheTime };
                });
                console.log("extendedFightHistory", extendedFightHistory);
                fighter.fightHistory = extendedFightHistory;
                return fighter;
            });
        } else {
            console.error("error. Expected array, got", fightersFromEvent);
        }

        response.send(fightersFromEvent);
        return;
    }).catch(function (reason) {
        console.error("fail", reason);
        response.send("fail: " + reason);
        return;
    });
});

function storeResponse(key, value) {
    return;
    var contains = getStoredResponse(key);
    if (contains)
        return;
    console.log("storing", key);
    settings.storedResponses[key] = value;
}

function getStoredResponse(key) {
    return settings.storedResponses[key];
}

var port = 8081;
console.log('Server listening on:' + port);
app.listen(port);
console.info("Endpoint example: /fighter-profile?name=Fedor");
console.info("to trigger a request browse to /");
console.info("to scrape go to /scrape?startDate=2017-01-01&endDate=2017-12-31");
