# UFC-rankings


I'm interested in the UFC rankings.
This project was created to show a fighter record. Not just their opponents - but the rank of the opponent during the date of the fight.

This project generates a json-file of the top15 rankings for every UFC division across multiple points in history. based off that data we can look up what the ranking for every opponent was at any particular date.

**Screenshot of fighter records:**

![screenshot](https://i.imgur.com/jZV8gA6.png)

**Bonus feature: Historical UFC rankings**

![screenshot](https://i.imgur.com/daVexhr.png)

## Repo structure:
* backend = node
    - JSDOM scraper for fetching historical rankings from mma-stats.com 
    - node-backend for fetching fighter profiles from a sherdog-api
* public = vanilla js and html

## Run this project:

1. start the node-server
`node app.js`

2. browse to `localhost:8081`

3. picka a route, se below:

## Routes:

* `/` - serve webpage ( `public/index.html` )
* `/scrapeMissing` - scrapes mmastats.com for all the dates we don't already have in `/data/mmaStats.json`
* `/scrapeByQueryParams?startDate=2011-01-01&endDate=2015-12-31` - scrapes mmastats.com for specified date range
* `/searchfileforfighter?date=%222016-03-02%22&name=Fedor` - used to look up one opponent's rank at the time of the fight
* `/serve-rankings-file` - serves the latest data dump of all historical rankings
* `/mma-stats-by-date?date="2015-01-20"` - get rankings for 20th january 2015
* `/get-fighter-by-sherdog-url?url=https://www.sherdog.com/fighter/Fedor-Emelianenko-1500` - return json from a sherdog page
* `/search-fighter-by-name?name=Fedor` - search for a single fighter Sherdog-profile and look it up in Sherdog API 
* `/fighters-from-recent-event` - find multiple fighter's Sherdog-profiles, from the most recent event listed on sherdog.com

## Project history

* Started by scraping ufc.com on internetArchive, but after the rebuild of ufc.com their rankings became unreliable. Switched to scraping mma-stats.com. 
* Started with cheerio as a scraper, replaced it with puppeteer to be able to use vanilla js instead of jQuery, but after puppeteer required a +300MB chromium install I replaced it with jsDom.