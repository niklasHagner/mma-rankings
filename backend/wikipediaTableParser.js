var HTMLParser = require('node-html-parser');

module.exports.parseWikipediaFightRecordTableToJson = function (html) {
  const root = HTMLParser.parse(html);
  let mmaRecordsTable = root.querySelectorAll("table").filter(x => {
    var tr = x.querySelector("tr");
    return tr ? tr.innerText.trim().indexOf("Res.") === 0 : false;
  })
  mmaRecordsTable = mmaRecordsTable.map((html) => {
    // Res.	Record	Opponent	Method	Event	Date	Round	Time	Location	Notes
    const headers = html.querySelectorAll("th").map(x => x.innerText);
    const cells = html.querySelectorAll("tr")
      .filter((row,ix) => ix > 0)
      .map(row => { 
        const td = row.querySelectorAll("td");
        const fight = {
          result: td[0],
          record: td[1],
          opponentName: td[2],
          method: td[3],
          event: td[4],
          date: td[5],
          round: td[6],
          time: td[7],
          location: td[8],
          notes: td[9],
        };
       
        Object.keys(fight).forEach(function(key, ix){ 
          if (!fight || !fight[key]) {
            // console.log(`ix ${ix} - key ${key} is blank`);
            return "";
          }
          if (fight[key].innerText) fight[key] = fight[key].innerText.replace("\n", "");
        });
        const dateStrings = fight.date.split(" ");
        fight.year = dateStrings[dateStrings.length-1];
        return fight;
      });
      return cells;
  });

  const recordBreakdownTable = root.querySelectorAll("table").filter(x => {
    const row = x.querySelector("tr");
    return !row ? false : row.innerText.trim().indexOf("Professional record breakdown") === 0;
  })

  return mmaRecordsTable;
}

module.exports.parseWikipediaFutureEventsToJson = function(html) {
  const root = HTMLParser.parse(html);
  let table = root.querySelector("table#Scheduled_events");
    // Event | Original date | Venue | Location | Reference

    //NOTE: the quirk with these event tables is that when venues and locations repeat a single location-cell and a single venue-cell like 'UFC apex' can be used for multiple rows.
    //If this happens only one of the rows will have a venue/location and the rest will have to reuse the previously existing venue/location
  let prevVenue, prevLocation;
  const cells = Array.from(table.querySelectorAll("tr"))
    .filter((row, ix) => ix > 0)
    .map(row => { 
      const td = row.querySelectorAll("td");

      if (td[2]) prevVenue = td[2].innerText;
      if (td[3]) prevLocation = td[3].innerText;
      
      const item = {
        eventName: td[0].innerText,
        url: 'https://en.wikipedia.org' + td[0].querySelector("a").getAttribute("href"),
        date: td[1].innerText,
        venue: td[2] ? td[2].innerText : prevVenue,
        location: td[3] ? td[3].innerText : prevLocation
      };
      
      Object.keys(item).forEach(function(key, ix){
        if (item[key]) item[key] = item[key].replace("\n", "");//trim crap
      });
      return item;
    });

  return cells;
}

module.exports.parseWikipediaFightersOnNextEventToJson = function(html) {
  const root = HTMLParser.parse(html);
  let table = root.querySelector(".toccolours");
  const tableRows = Array.from(table.querySelectorAll("tr"));
  const fighters = [];
  tableRows
    .filter((row,ix) => ix > 0 && row.querySelectorAll("a").length > 0)
    .forEach(row => { 
      const td = row.querySelectorAll("td");
      const fighter1 = {
        name: td[1].innerText.trim(),
        url: td[1].querySelector("a") && td[1].querySelector("a").getAttribute("href"),
      };
      const fighter2 = {
        name: td[3].innerText.trim(),
        url: td[3].querySelector("a") && td[3].querySelector("a").getAttribute("href"),
      };
      fighters.push(fighter1);
      fighters.push(fighter2);
    });

  return fighters;
}