# UFC-rankings
=============


The goal is to show a fighter's history plus their opponent's rank at the time of the fight.

This repo has multiple features
* a puppeteer scraper for fetching historical rankings from mma-stats.com 
* a backend for fetching fighter profiles from a sherdog-api (note: should replace this api as it doesn't seem to contain stats past 2019-06)
* a frontend for displaying the rankings. Built it in 2018 with react, but replaceced it with a plain html page in 2020.


## Repo structure:
* backend (node)
* frontend (plain html)
* old-frontend (react)

## Running the project:

### Start the backend:

1. start the node-server
`node app.js`

2. start the react-frontend
```bash
cd /frontend
npm start
```

3. browse to `localhost:8081`

### Start the frontend:

simply open `frontend/index.html` in your browser

to get some data, ensure the backend is running

## Endpoint examples:

* `/scrape` - scrapes mmastats.com according to startDate/endDate specified in `scrapeMmaStatsDotCom.js`
* `/searchfileforfighter?date=%222016-03-02%22`
* `/serve-rankings-file` - serves the latest data dump of all historical rankings
* `/mma-stats-by-date?date="2015-01-20"` - get rankings for 20th january 2015
* `/fighter-profiles?name="Jon Jones"` - get fighter profile (and ufc record) for specific athlete
* `/fighter-profile?name=` - default response; get the top 4 ufc fighter profiles from the latest ufc events
