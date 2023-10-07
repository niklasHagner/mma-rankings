var HTMLParser = require('node-html-parser');

module.exports.parseWikipediaFightRecordTableToJson = function (htmlNode, fighterName) {
  let mmaRecordsTable = htmlNode.querySelectorAll("table").filter(x => {
    var tr = x.querySelector("tr");
    return tr ? tr.innerText.trim().indexOf("Res.") === 0 : false;
  })[0] //Assume the UFC record is the first one. Avoid exhibiition/amatuer/wrestling records like on https://en.wikipedia.org/wiki/Tatiana_Suarez

  mmaRecordsTable = mapRecordsTableToJson(mmaRecordsTable, fighterName);

  // const recordBreakdownTable = htmlNode.querySelectorAll("table").filter(x => {
  //   const row = x.querySelector("tr");
  //   return !row ? false : row.innerText.trim().indexOf("Professional record breakdown") === 0;
  // });

  return mmaRecordsTable;
}

function mapRecordsTableToJson(html, fighterName) {
  let savedObjsWithRowspan;
  const cells = html.querySelectorAll("tr")
    .filter((row, ix) => ix > 0)
    .filter((row) => {
        //to avoid tables where the last row is 'Source' like https://en.wikipedia.org/wiki/Kron_Gracie we'll filter out rows that have less than 4 tds
        const tds = [...row.querySelectorAll("td")];
        return tds.length >= 4;
    })
    .map(row => {
      //--- Expected table headers---
      // Res	Record	Opponent	Method	Event	Date	Round	Time	Location	Notes

      /*Note: it's possible to have two fights in the same night.
      Example: https://en.wikipedia.org/wiki/Francis_Ngannou
      Row1 will have more td:s than Row2, and some of them will be <td rowspan="2"> 
      */
      const tds = [...row.querySelectorAll("td")];
      const someTdsSpanMultipleRows = tds.find(x => x.getAttribute("rowspan"));
      if (someTdsSpanMultipleRows) {
        savedObjsWithRowspan = tds
          .map((td, index) => { const rowspan = td.getAttribute("rowspan"); return { index, td, rowspan } })
          .filter(x => x.rowspan)
      }

      if (tds.length < 10) {
        const missingTdsCount = 10 - tds.length;
        console.log(`Low amount of wikipediaTable cells (${tds.length}) for ${fighterName}`);
        if (savedObjsWithRowspan && savedObjsWithRowspan.length === missingTdsCount) {
          console.log("Replacing the missing tds with previous ones that have rowspan attributes");
          tds.splice(savedObjsWithRowspan[0].index, savedObjsWithRowspan.length, ...savedObjsWithRowspan.map(x => x.td));
        }
      }
      const fight = {
        result: tds[0],
        record: tds[1],
        opponentName: tds[2],
        method: tds[3],
        event: tds[4],
        date: tds[5],
        round: tds[6],
        time: tds[7],
        location: tds[8],
        notes: tds[9],
      };

      Object.keys(fight).forEach(function (key) {
        if (!fight || !fight[key]) {
          return "";
        }
        if (fight[key].innerText) fight[key] = fight[key].innerText.replace("\n", "");
      });
      try {
        const dateStrings = fight.date.split("(")[0].split(" ");
        fight.year = dateStrings[dateStrings.length - 1];
      } catch (ex) {
        console.error(`Exception when dateParsing for ${fighterName}`);
        fight.year = null;
      }

      return fight;
    });
  return cells;
}

module.exports.parseWikipediaFutureEventsToJson = function (html) {
  const root = HTMLParser.parse(html);
  let tableEl = root.querySelector("table#Scheduled_events");
  const tdIndexList = {
    eventLink: 0,
    date: 1,
    venue: 2,
    location: 3,
    reference: 4
  };
  const futureEvents = mapEventTableToJson(tableEl, tdIndexList);
  const mostRecentPastEvent = parseWikipediaPastEventsToJson(html)[0];
  return [mostRecentPastEvent, ...futureEvents];
}

function parseWikipediaPastEventsToJson (html) {
  const root = HTMLParser.parse(html);
  let tableEl = root.querySelector("table#Past_events");
  const tdIndexList = {
    number: 0,
    eventLink: 1,
    date: 2,
    venue: 3,
    location: 4,
    attendance: 5,
    reference: 6
  };
  return mapEventTableToJson(tableEl, tdIndexList);
}

module.exports.parseWikipediaPastEventsToJson = parseWikipediaPastEventsToJson;

//Maps table from https://en.wikipedia.org/wiki/List_of_UFC_events to json
function mapEventTableToJson(table, tdIndexList) {
  //NOTE: the quirk with these event tables is that when venues and locations repeat a single location-cell and a single venue-cell like 'UFC apex' can be used for multiple rows.
  //If this happens only one of the rows will have a venue/location and the rest will have to reuse the previously existing venue/location
  let prevVenue, prevLocation;
  let cells = Array.from(table.querySelectorAll("tr"))
    .filter((row, ix) => ix > 0)
    .map(row => {
      const td = row.querySelectorAll("td");

      if (td[tdIndexList.venue]) prevVenue = td[tdIndexList.venue].innerText;
      if (td[tdIndexList.location]) prevLocation = td[tdIndexList.location].innerText;

      const link = td[tdIndexList.eventLink].querySelector("a");
      if (!link) {
        return null;
      }

      const item = {
        eventName: td[tdIndexList.eventLink].innerText,
        url: 'https://en.wikipedia.org' + link.getAttribute("href"),
        date: td[tdIndexList.date].innerText,
        venue: td[tdIndexList.venue] ? td[tdIndexList.venue].innerText : prevVenue,
        location: td[tdIndexList.location] ? td[tdIndexList.location].innerText : prevLocation
      };

      Object.keys(item).forEach((key) => {
        if (item[key]) item[key] = item[key].replace("\n", "");//trim crap
      });

      return item;
    });

  cells = cells.filter(cell => cell);
  return cells;
}

module.exports.parseSingleEventHtmlToJson = function (html, eventObj) {
  const root = HTMLParser.parse(html);
  let table = root.querySelector(".toccolours");
  const fighters = [];
  if (!table) {
    console.log(`no table for ${eventObj.url}`);
    /*
    ---Expected html for event with ul instead of table -- 
    <h2>
      <span class="mw-headline" id="Announced_bouts">Announced bouts</span>
      <span></span>
    </h2>
    <ul><li>x vs y</li>
    */
    const ul = root.querySelector("#Announced_bouts")?.closest("h2")?.nextElementSibling;
    if (ul?.tagName === "UL") {
      const fightRows = [...ul.querySelectorAll("li")];
      fightRows.forEach((row, rowIx) => {
        const anchors = [...row.childNodes].filter(x => x.tagName === "A");
        if (anchors.length === 2) {
          const fighterPair = anchors.map(anchor => {
            //Remove parens and whitespace like: "Aljamain Sterling (c)"
            return { name: anchor.innerText.replace("(c)", "").trim(), url: anchor.getAttribute("href") };
          });
          fighters.push(...fighterPair);
        } else {
          console.log(`${row.innerText} with index ${rowIx} had ${anchors.length} anchors instead of 2.`);
        }
      });
    }

    return fighters;
  }
  const tableRows = Array.from(table.querySelectorAll("tr"));
  tableRows
    .filter((row, ix) => ix > 0 && row.querySelectorAll("a").length > 0)
    .forEach(row => {
      const td = row.querySelectorAll("td");
      const fighter1 = {
        name: td[1].innerText.trim(),
        url: td[1].querySelector("a")?.getAttribute("href"),
      };
      const fighter2 = {
        name: td[3].innerText.trim(),
        url: td[3].querySelector("a")?.getAttribute("href"),
      };
      fighters.push(fighter1);
      fighters.push(fighter2);
    });

  return fighters;
}