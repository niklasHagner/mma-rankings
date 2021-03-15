# UFC-rankings
=============

The goal of this project is to 

a) list a fighter's record along with each of their opponent's rank at the time of the fight.

![screenshot](https://i.imgur.com/jZV8gA6.png)

b) list historical records on a single page, similar to what mma-stats.com does

![screenshot](https://i.imgur.com/daVexhr.png)

## Repo structure:
* backend = node code
    - puppeteer scraper for fetching historical rankings from mma-stats.com 
    - node-backend for fetching fighter profiles from a sherdog-api
* public = simple vanilla html & js frontend
* old-frontend = obsolete react frontend
    - start using `cd /old-frontend && npm start`

## Running the project:

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
* `/fighter-profile?name=Fedor` - search for a single fighter Sherdog-profile and look it up in Sherdog API 
* `/fighters-from-recent-event` - find multiple fighter's Sherdog-profiles, from the most recent event listed on sherdog.com

## Project history

Started in 2018 with a react-frontend and a cheerio-scraper that scraped ufc.com from internetarchive
Later ufc.com was completely rebuilt and their rankings became unusable.

In 2020 I rewrote the scraper in puppeteer, and scraped mma-stats.com. 
Since the website was not interactive I also replaced react in favor of plain html & js, which made simplified hosting.