const moment = require("moment");

/*
returns array of items like:
{"fighter":{"rank":" 13","link":"https://mma-stats.com/fighters/Kelvin-Gastelum","name":"Kelvin Gastelum"},"division":" Middleweight ","date":"December 19, 2022"}
*/
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
function findRankAtTime(data, name, lookupDateStr) {
    const lookupDate = new Date(lookupDateStr);
    const matches = findAllRanksForFighter(data, name);
    if (matches.length === 0) {
        return 0;
    }

    let closestEarlierDate = matches.find((match) => {
        return moment(new Date(match.date)).isBefore(new Date(lookupDate));
    });
    if (!closestEarlierDate) {
        closestEarlierDate = matches.reverse()[0];
    }

    const closestDate = new Date(closestEarlierDate.date);
    closestEarlierDate.formattedDate = closestDate.getFullYear() + "-" + `${closestDate.getMonth() + 1}`.padStart(2, '0');
    
    const monthDiff = (closestDate.getFullYear()*12 + closestDate.getMonth()) - (lookupDate.getFullYear()*12 + lookupDate.getMonth() )
    if (monthDiff <= -12) {
        closestEarlierDate.wasInThePast = true;
    } else if (monthDiff >= 12 )  {
        closestEarlierDate.wasInTheFuture = true;
    }
    return closestEarlierDate;
}

module.exports = { findRankAtTime, findAllRanksForFighter };
