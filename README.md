# UFC-rankings

A project for UFC nerds who love stats
* lists upcoming UFC events + fighter profiles
* lists UFC rankings since they were created in 2013
* keeps track of each fighter's rankings throughout history
* lists fighter profiles with their record, and rank of the opponent at the time of the fight

This project generates a json-file of the top15 rankings for every UFC division across multiple points in history. based off that data we can look up what the ranking for every opponent was at any particular date.

**Screenshot of fighter records:**

![screenshot](https://i.imgur.com/jZV8gA6.png)

**Bonus feature: Historical UFC rankings**

![screenshot](https://i.imgur.com/daVexhr.png)

## Tech and dependencies
* node+express
* nunjucks
* vanilla css and vanilla js
* draw charts via https://cdn.jsdelivr.net/npm/apexcharts
* jsDOM for scraping rankings from mma-stats.com, and events and fighter profiles from wikipedia
* google image search via package `g-i-s`

## Repo structure:
* app.js = routing and viewHelpers for nunjucks
* /backend = nodeJs
* /scripts = nodeJs scripts for manual scraping 
    * updateFightersFromPastEvents.js - grabs all the events between two dates, lists all the fighters on those events - and scrapes their wiki pages
* /public = client assets
* /data
    - `fighters/*.json` - the profile for a fighter. Contains a) basic info like birthplace b) their entire record. But not their ranking history
    - `mmaStats.json` - UFC ranking history with around one instance per month
    - `allFighters.json` - lists all files in `data/fighters/`. When the rankings are rendered this file can be used to detect which fighters can have links to their profile pages. Note that some items in this file have a manually added property for `mmaStatsName` as mmaStats uses names like 'Weili Zhang' while Wikipedia uses names like 'Zhang Weili'
    
## Run this project:

1. start the node-server `node app.js`

2. browse to `localhost:8081` to serve `public/index.html` (or just open the html file directly)

## Env var defaults
* SAVE_JSON_TO_FILE=false
* allowFetchingMissingFighters=false

## Routes:

* `/` - serves main view with events and all time rankings
* `/scrapeByQueryParams?startDate=2011-01-01&endDate=2015-12-31` - scrapes mmastats.com for specified date range
* `/searchForNameAndDate?date=%222016-03-02%22&name=Fedor` - used to look up one opponent's rank at the time of the fight
* `/mma-stats-by-date?date="2015-01-20"` - get rankings for 20th january 2015
* `/fighter/:shortFileName` - render a profile page for a single fighter based off data in `data/fighter/*.json` - Example: `/fighter/Jan_B%C5%82achowicz`

## Scripts
* `npm run scrapeLatestRankings` - scrapes rankings from wikipedia and saves to `/data/mmaStats.json`
* `npm run scrapeListOfFighters` - before running, edit this file by adding fighters to the inputArray

## Maintenance
* If a fighter name doesn't match between wikipedia and mma-stats.com, add "mmaStatsName:"X" to `allFighters.json` and their json file in the data folder

## Project history

1. Scrape historical rankings from ufc.com via internetArchive, and scrape fighter profiles from sherdog.com
2. ufc.com became unreliable after a rebuild in 2020. Switched to scraping mma-stats.com
3. Change Scraper from cheerio to JsDOM
4. Sherdog.com started hiding content, switch to Wikipedia via `wikijs` for fighter profiles
5. Stop using `wikijs` due to API limits and lacking support for wikipedia-tables
6. mma-stats.com stopped updating rankings, get latest rankings from Wikipedia

## Known issues
* For a regular UFC event, Wikipedia has a table of fights. For an upcoming minor events sometimes it's just a bullet list - this repo doesn't even attempt to parse that list as it's not structured enough.
* The googleImageSearch fetch requests can fail and the exception isn't handled. They're called via `getInfoAndFightersFromSingleEvent -> fetchArrayOfFighters -> scrapeFighterData -> findImagesForFighter` 
