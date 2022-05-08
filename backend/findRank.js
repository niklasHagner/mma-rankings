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
function findRankAtTime(data, name, lookupDate) {
    const matches = findAllRanksForFighter(data, name);
    if (matches.length === 0) {
        return 0;
    }

    let closestEarlierDate = matches.find((match) => {
        return moment(new Date(match.date)).isBefore(new Date(lookupDate));
    });
    if (!closestEarlierDate) {
        // console.log("no rank found for", name, "before", date);
        closestEarlierDate = matches.reverse()[0];
    }

    const closestDate = new Date(closestEarlierDate.date);
    let monthString = closestDate.getMonth();
    if (monthString.length === 1) { 
        monthString = "0" + monthString;
    }
    const fullYearNumber = closestDate.getFullYear();
    closestEarlierDate.formattedDate = fullYearNumber + "-" + monthString;
    
    if (new Date(lookupDate).getFullYear() > fullYearNumber) {
        closestEarlierDate.wasInThePast = true;
    } else {
        rankModifierClass  = "fight__opponent-rank--future"
        closestEarlierDate.wasInTheFuture = true;
    }

    return closestEarlierDate;
}

module.exports = { findRankAtTime, findAllRanksForFighter };
