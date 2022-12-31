# UFC-rankings


I'm interested in the UFC rankings.
This project was created to show a fighter record. Not just their opponents - but the rank of the opponent during the date of the fight.

This project generates a json-file of the top15 rankings for every UFC division across multiple points in history. based off that data we can look up what the ranking for every opponent was at any particular date.

**Screenshot of fighter records:**

![screenshot](https://i.imgur.com/jZV8gA6.png)

**Bonus feature: Historical UFC rankings**

![screenshot](https://i.imgur.com/daVexhr.png)

## Repo structure:
* /backend = node
    - JSDOM scraper for fetching historical rankings from mma-stats.com 
    - node-backend for fetching fighter profiles from a sherdog-api
* /public = contains index.html, and the js and css files that will be served to the client
* /data
    - `fighters/*.json` - the profile for a fighter. Contains a) basic info like birthplace b) their entire record. But not their ranking history
    - `mmaStats.json` - UFC ranking history with around one instance per month
    - `allFighters.json` - lists all files in `data/fighters/`. When the rankings are rendered this file can be used to detect which fighters should have links to their profile pages (via the route `/fighter/name` )
    
## Run this project:

1. start the node-server `node app.js`

2. browse to `localhost:8081` to serve `public/index.html` (or just open the html file directly)

## Routes:

* `/` - serves main view with events and all time rankings
* `/scrapeMissing` - scrapes mmastats.com for all the dates we don't already have in `/data/mmaStats.json`
* `/scrapeByQueryParams?startDate=2011-01-01&endDate=2015-12-31` - scrapes mmastats.com for specified date range
* `/searchfileforfighter?date=%222016-03-02%22&name=Fedor` - used to look up one opponent's rank at the time of the fight
* `/mma-stats-by-date?date="2015-01-20"` - get rankings for 20th january 2015
* `/search-fighter-by-name?name=Fedor` - search for a single fighter profile
* `/fighter/:shortFileName` - render a profile page for a single fighter based off data in `data/fighter/*.json` - Example: `/fighter/Jan_B%C5%82achowicz`

## Project history

1. Scrape historical rankings from ufc.com via internetArchive, and scrape fighter profiles from sherdog.com
2. ufc.com became unreliable after a rebuild in 2020. Switched to scraping mma-stats.com
3. Change Scraper from cheerio to JsDOM
4. Sherdog.com started hiding content, switch to Wikipedia via `wikijs` for fighter profiles
5. Stop using `wikijs` due to API limits and lacking support for wikipedia-tables

## Known issues
* For a regular UFC event, Wikipedia has a table of fights. For an upcoming minor events sometimes it's just a bullet list - this repo doesn't even attempt to parse that list as it's not structured enough.