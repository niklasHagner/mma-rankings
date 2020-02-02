# UFC-rankings
=============

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

* `/searchfileforfighter?date=%222016-03-02%22`
* `/serve-rankings-file` - serves the latest data dump of all historical rankings
* `/mma-stats-by-date?date="2015-01-20"` - get rankings for 20th january 2015
* `/fighter-profiles?name="Jon Jones"` - get fighter profile (and ufc record) for specific athlete
* `/fighter-profile?name=` - default response; get the top 4 ufc fighter profiles from the latest ufc events

## Todo 

The goal is to list display the top fighters from the latest UFC event, list each of their records and show the rank of their opponents at the time they fought.