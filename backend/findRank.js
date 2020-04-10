const moment = require("moment");

function findAllRanksForFighter(data, name) {
  let matches = [];
  data.dates.forEach((date) => {
      const divisions = date.divisions.filter(x => x.name.toLowerCase().indexOf("pound") === -1);
      divisions.forEach((division) => {
          const matchingFighter = division.fighters.find(x => x.name.toLowerCase() === name.toLowerCase());
          if (matchingFighter) {
            matches.push({
                fighter: matchingFighter,
                division: division.name,
                date: date.date
            });
          }
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
