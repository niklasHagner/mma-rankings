const express = require("express");
const app = express();
const fs = require('fs');
const path = require('path');
const winston = require('winston');
const mmaStatsScraper = require('./backend/scrapeMmaStatsDotCom');
const { findRankAtTime } = require('./backend/findRank');
const wikipediaApi = require('./backend/wikipediaApi.js');

let existingData = fs.readFileSync("data/mmaStats.json");
let jsonData = JSON.parse(existingData);
let lastScapedDate = jsonData.dates[0].date;
console.log(`The last rank is dated ${lastScapedDate}. Maybe it's time to run /scrapeMissing `);


// parseFighter('Nick Diaz')

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
    
    let rawdata = fs.readFileSync("data/mmaStats.json");
    let data = JSON.parse(rawdata);
    const rank = findRankAtTime(data, name, date);
    const jsonResult = { "mostRecentMatch": rank };
    return res.json(jsonResult);
});

app.get('/scrapeMissing', async function (req, res) {
    let existingData = fs.readFileSync("data/mmaStats.json");
    let jsonData = JSON.parse(existingData);
    let lastScapedJsonBlob = jsonData.dates[0];
    const startDate = lastScapedJsonBlob.date;
    const today = new Date().toISOString().split('T')[0];
    const endDate = today;
    const scrapeStatus = await mmaStatsScraper.scrapeRankingsForMultipleDates(startDate, endDate);
    res.send(scrapeStatus);
});

app.get('/scrapeByQueryParams', async function (req, res) {
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    const scrapeStatus = await mmaStatsScraper.scrapeRankingsForMultipleDates(startDate, endDate);
    res.send(scrapeStatus);
});

app.get('/serve-rankings-file', async function (req, res) {
    let rawdata = fs.readFileSync("data/mmaStats.json");
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

    const json = await mmaStatsScraper.scrapeMmaStats(req.query.date);
    res.send(json);
});

app.get('/search-fighter-by-name', function(req, response) {
    response.contentType('application/json');

    if (!req.query.name) {
        console.error(" Error. Try something like this instead: /search-fighter-by-name?name=Fedor");
        response.send({error:true});
        return;
    }

    var fighterName = decodeURIComponent(req.query.name);

    wikipediaApi.parseFighter(fighterName).then(function (fighter) {
        //append historical record of fights to fighter-object
        let allRankingsFromFile = fs.readFileSync("data/mmaStats.json");
        let allRankingsData = JSON.parse(allRankingsFromFile);
        fighter = mapFighterFromApiToExtraData(fighter, allRankingsData);
        response.send(fighter);
        return;
    }).catch(function (reason) {
        console.error("fail", reason);
        response.send("fail: " + reason);
        return;
    });
});

app.get('/fighters-from-next-event', function (req, response) {
    response.contentType('application/json');

    wikipediaApi.getFightersFromNextEvent().then(function (data) {
        //append historical record of fights to fighter-object
        let allRankingsFromFile = fs.readFileSync("data/mmaStats.json");
        let allRankingsData = JSON.parse(allRankingsFromFile);
        const eventName = data.eventName;
        let fighters = data.fighters;
        fighters = fighters.map((fighter) => { 
            return mapFighterFromApiToExtraData(fighter, allRankingsData); 
        });
        const eventData = {eventName, fighters};
        response.send({allEvents: [eventData]});
        return;
    }).catch(function (reason) {
        console.error("fail", reason);
        response.send("fail: " + reason);
        return;
    });
});

function mapFighterFromApiToExtraData(fighter, allRankingsData) {
    const record = fighter.record;
    const extendedRecord = record.map((fight) => {
        const lookupName = fight.opponentName;
        const lookupDate = fight.date;
        const opponentInfoAtTheTime = findRankAtTime(allRankingsData, lookupName, lookupDate);
        return { ...fight, opponentInfoAtTheTime };
    });
    // console.log("extendedrecord", extendedrecord);
    fighter.record = extendedRecord;
    return fighter;
}

var port = 8081;
console.log('Server listening on:' + port);
app.listen(port);
console.info("* Endpoint example: /search-fighter-by-name?name=Fedor");
console.info("* to trigger a request browse to /");
console.info("* to scrape go to /scrape?startDate=2017-01-01&endDate=2017-12-31");
