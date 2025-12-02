const moment = require("moment");

/*
returns array of items like:
{"fighter":{"rank":" 13","link":"https://mma-stats.com/fighters/Kelvin-Gastelum","name":"Kelvin Gastelum"},"division":" Middleweight ","date":"December 19, 2022"}
*/
function getRankForSingleDateItem(timestamp, name) {
  const divisions = timestamp.divisions.filter(x => x.name.toLowerCase().indexOf("pound") === -1);
  let matches = [];
  divisions.forEach((division) => {
    const matchingFighter = division.fighters.find(x => x.name.toLowerCase() === name.toLowerCase());
    if (matchingFighter) {
      matches.push({
        fighter: matchingFighter,
        division: division.name,
        date: timestamp.date
      });
    }
  });
  //Always return single item, not arr
  //{"fighter":{"rank":" 4","link":"https://mma-stats.com/fighters/Marlon-Vera","name":"Marlon Vera"},"division":" Bantamweight ","date":"February 14, 2023"}
  return matches.length > 0 ? matches[0] : null;
}

function findAllRanksForFighter(data, name) {
  let matches = [];
  if (!data?.dates) {
    console.error("Missing data for name:", name, "data was:", data, )
  }
  matches = data?.dates.map((date) => { return getRankForSingleDateItem(date, name) });
  matches = matches.filter(x => x);
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

  const monthDiff = (closestDate.getFullYear() * 12 + closestDate.getMonth()) - (lookupDate.getFullYear() * 12 + lookupDate.getMonth())
  if (monthDiff <= -12) {
    closestEarlierDate.wasInThePast = true;
  } else if (monthDiff >= 12) {
    closestEarlierDate.wasInTheFuture = true;
  }
  return closestEarlierDate;
}

function getCurrentRank(name) {
    const lastDateItem = global.rankData.dates[0];
    const latestRankObj = getRankForSingleDateItem(lastDateItem, name);
    const rankString = latestRankObj?.fighter?.rank?.trim();
    return rankString;
}

module.exports = { findRankAtTime, findAllRanksForFighter, getCurrentRank };
