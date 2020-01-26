var express = require("express");
var app = express();
const fs = require('fs');
const moment = require("moment");
var winston = require('winston');
var sherdog = require('./backend/getFighter.js');
var mmastats = require('./backend/scrapeMmaStatsDotCom');

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


function _findRankAtTime(data, name, date) {
    let matches = [];
    data.dates.forEach((date) => {
        date.divisions.forEach((division) => {
            division.fighters.filter((fighter) => {
                if (fighter.name === name && division.name.indexOf("Pound") < 0) {
                    matches.push({
                        fighter,
                        division: division.name,
                        date: date.date
                    });
                }
            });
        });
    });
    if (matches.length === 0) {
        console.error("0 matches");
    }
    let mostRecentMatch = matches.find((match) => {
        const matchDate = new Date(match.date), searchDate = new Date(date);
        return moment(matchDate).isBefore(searchDate);
    });
    if (!mostRecentMatch) {
        mostRecentMatch = matches[0];
    }
    return mostRecentMatch;
}

function findRankAtTime(name, date) {
    let rawdata = fs.readFileSync("dataDump.json");
    let data = JSON.parse(rawdata);
    const rankInfo = _findRankAtTime(data, name, date);
    return rankInfo;
}

app.get('/searchfileforfighter', function (req, res) {
    const name = req.query.name || "Jon Jones";
    const date = req.query.date || "2016-01-02";
    const result = findRankAtTime(name, date);
    res.send(result);
});

function saveToFile(newArrayOfDates) {
    let rawdata = fs.readFileSync("dataDump.json");
    let data = JSON.parse(rawdata);
    const conc = data.dates.concat(newArrayOfDates);
    sorted = conc.sort((a,b) => new Date(b.date) - new Date(a.date));
    data.dates = sorted;
    fs.writeFileSync('file.json', JSON.stringify(data));
}

async function scraperLoop() {
    const today = moment();
    const dateStrings = [];
    const date = moment(new Date("2013-03-01"));
    for(let i=0; date.isBefore(today); i++) {
        dateStrings.push(date.format("YYYY-MM-DD"));
        date.add(12, "M");
    }
    console.log("dates to scrape", dateStrings);
    const promises = dateStrings.map(date => mmastats.scrapeMmaStats(date))
    Promise.all(promises).then((data) => {
        console.log("resolved all promises", data);
        saveToFile(data);
    });
}
app.get('/scrape', async function (req, res) {
    scraperLoop();
});

app.get('/mma-stats-by-date', async function (req, res) {
    res.contentType('application/json');
    var defaultResponse = {
        error: true
    };

    if (typeof req.query.date === 'undefined') {
        console.error(" Error. Try something like this instead: /mma-stats-by-date?date=2019-02-30");
        res.send(defaultResponse);
        return;
    }
    console.log('called with query:', req.query);

    const json = await mmastats.scrapeMmaStats(req.query.date);
    res.send(json);
});

app.get('/Search', function (req, response) {
    response.contentType('application/json');
    var defaultResponse = {
        error: true
    };

    if (typeof req.query.name === 'undefined') {
        console.error(" Error. Try something like this instead: /Search?name=Fedor");
        response.send(defaultResponse);
        return;
    }
    console.log('API called with query:', req.query);
    if (settings.caching) {
        var cachedResponse = getStoredResponse(req.query);
        if (cachedResponse) {
            console.log("cached response");
            response.send(cachedResponse);
            return;
        }
    }

    var fighterName = decodeURIComponent(req.query.name);
    console.log("calling mma.fighter", fighterName);

    //sherdog.getFighter(fighterName).then(function (data) {
    sherdog.getFromEvent().then(function (data) {
        //console.log("response:", data);
        if (settings.logOutputOnce && settings.loggedResponses <= 0) {
            winston.log('info', data);
            storeResponse(req.query, data);
            settings.loggedResponses++;
        }
        response.send(data);
        return;
    }).catch(function (reason) {
        console.error("fail");
        response.send("FAIL: " + reason);
        return;
    });

    console.log("sequential stuff done");
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
console.info("Endpoint example: /Search?name=Fedor");
console.info("to launch the frontend goto /frontend and run 'npm start' ");