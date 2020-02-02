const moment = require("moment");
const fs = require('fs');

function _findRankAtTime(data, name, date) {
  let matches = [];
  data.dates.forEach((date) => {
      date.divisions.forEach((division) => {
          division.fighters.filter((fighter) => {
              if (fighter.name === name && division.name.indexOf("Pound") < 0) { //skip the pound-for-pound division
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
  } else {
      console.log(matches.length, "matches found");
  }

  let mostRecentMatch = matches.find((match) => {
      const matchDate = new Date(match.date), searchDate = new Date(date);
      return moment(matchDate).isBefore(searchDate);
  });
  if (!mostRecentMatch) {
      mostRecentMatch = matches[0];
  }
  console.log("mostRecentMatch", mostRecentMatch);
  return mostRecentMatch;
}

function findRankAtTime(name, date) {
  let rawdata = fs.readFileSync("data/data2.json");
  let data = JSON.parse(rawdata);
  const rankInfo = _findRankAtTime(data, name, date);
  return rankInfo;
}

module.exports = { findRankAtTime };
