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

/*
Return the rank at the time, or if unranked - return the earliest possible rank
*/
function findRankAtTime(data, name, date) {
    const matches = findAllRanksForFighter(data, name);
    if (matches.length === 0) {
        // console.error("0 matches");
        return 0;
    } else {
        // console.log(matches.length, "matches found");
    }
  
    let closestEarlierDate = matches.find((match) => {
        const matchDate = new Date(match.date);
        const searchDate = new Date(date);
        return moment(matchDate).isBefore(searchDate);
    });
    if (!closestEarlierDate) {
        console.log("no rank found for", name, "before", date);
        closestEarlierDate = matches.reverse()[0];
    }
    return closestEarlierDate;
}

module.exports = { findRankAtTime, findAllRanksForFighter };
