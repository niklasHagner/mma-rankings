const moment = require("moment");

function findAllRanksForFighter(data, name) {
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
  return matches;
}

function findRankAtTime(data, name, date) {
    const matches = findAllRanksForFighter(data, name);
    if (matches.length === 0) {
        console.error("0 matches");
        return 0;
    } else {
        console.log(matches.length, "matches found");
    }
  
    let mostRecentHit = matches.find((match) => {
        const matchDate = new Date(match.date), searchDate = new Date(date);
        return moment(matchDate).isBefore(searchDate);
    });
    if (!mostRecentHit) {
        mostRecentHit = matches[0];
    }
    return mostRecentHit;
}

module.exports = { findRankAtTime, findAllRanksForFighter };
