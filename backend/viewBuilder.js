const config = require("exp-config");
const { findRankAtTime, findAllRanksForFighter } = require('./findRank.js');
const { divisionAbbreviation } = require('./stringAndHtmlHelper.js');
const fileHelper = require('./fileHelper.js');

const buildRankingsHtml = function(pages) {
  pages.forEach((x) => {
    x.divisions = getSortedDivisions(x.divisions);
  });
  pages = pages.slice(0,pages.length-1);
  const snapshots = pages.map((page) => {
    
    const divisionTemplates = page.divisions
      .filter(currDivision => currDivision.fighters.length >= 10)
      .map(division => divisionToHtml(division));

    const snapshotHtml = ` 
      <section class="snapshot">
        <h2>Rankings ${page.date}</h2>

        <div class="snapshot-divisions">
            ${divisionTemplates.join("")}
        </div>
      </section>
    `;
    return { 
      date: page.date, 
      year: new Date(page.date).getFullYear(), 
      html: snapshotHtml
    };
  });

  let snapshotsGroupedByYear = [];
  snapshots.forEach((snapshot) => {
    const matchingItem = snapshotsGroupedByYear.find(x => x.year === snapshot.year);
    if (matchingItem ) {
      const matchingIndex = snapshotsGroupedByYear.indexOf(matchingItem);
      
      //Limit rankings per year to reduce HTML size
      if (snapshotsGroupedByYear[matchingIndex].snapShotCount < 2) {
        snapshotsGroupedByYear[matchingIndex].html += snapshot.html;
        snapshotsGroupedByYear[matchingIndex].snapShotCount = typeof(snapshotsGroupedByYear[matchingIndex].snapShotCount) == "undefined" ? 0 : snapshotsGroupedByYear[matchingIndex].snapShotCount++;
      }
    } else {
      snapshotsGroupedByYear.push(snapshot);
    }
  });

  let annualRankingsHtmlString = snapshotsGroupedByYear.map((annualSnapshot) => {
    const modifierClass = "annual-rank-snapshots--collapsed";
    return `
      <details class="annual-rank-snapshots ${modifierClass}">
        <summary>${annualSnapshot.year}</summary>
        ${annualSnapshot.html}
      </details>
    `;
  }).join("");
  
  return annualRankingsHtmlString
};

const getSortedDivisions = function(divisions) {
  const sortValues = [
    {name: "heavyweight", order: 1},
    {name: "light heavyweight", order: 2},
    {name: "middleweight", order: 3},
    {name: "welterweight", order: 4},
    {name: "lightweight", order: 5},
    {name: "featherweight", order: 6},
    {name: "bantamweight", order: 7},
    {name: "flyweight", order: 8},
    {name: "women's bantamweight", order: 9},
    {name: "women's flyweight", order: 10},
    {name: "women's strawweight", order: 11},
    {name: "women's featherweight", order: 12},
    {name: "pound-for-pound", order: 13},
  ];
  const arr = divisions.filter(x => x.name.indexOf("women") < 0);
  return arr.sort((a,b) => {
    const aMatch = sortValues.find(sortItem => sortItem.name === a.name.toLowerCase().trim());
    const aSortVal = aMatch ? aMatch.order : 0;

    const bMatch = sortValues.find(sortItem => sortItem.name === b.name.toLowerCase().trim());
    const bSortVal = bMatch ? bMatch.order : 0;
    
    return aSortVal - bSortVal; 
  });
}

const divisionToHtml = function(division) {
  const fighters = division.fighters.map((fighter) => {
    if (fighter.rank.toLowerCase().indexOf("champion") > -1) 
      fighter.rank = "C";
    
    const fighterNameElement = getFighterNameOrLinkHtml(fighter);
    return `
      <div>
        <span class="rank">${fighter.rank}</span> ${fighterNameElement}
      </div>
    `;
  }).join("<br>");
  return `
    <article class="division">
      <h3 class="division-name">${division.name}</h3>
      <div class="division-fighters">${fighters}</div>
    </article>
  `;
};

function getFighterNameOrLinkHtml(fighter) {
  const fighterFileMatch = global.fightersWithProfileLinks.find(x => x.fighterAnsiName === fighter.name);
  const fighterLink = fighterFileMatch ? `/fighter/${fighterFileMatch.fileName.replace(".json", "")}` : null;
  const html = fighterLink ? `<a href="${fighterLink}" class="name">${fighter.name}</a>` : `<span class="name">${fighter.name}</span>`;
  return html;
}

async function extendFighterApiDataWithRecordInfo(fighter, allRankingsData) {
  const record = fighter.record;
  const extendedRecord = record.map((fight) => {
    const fighterRankAtTheTime = findRankAtTime(allRankingsData, fighter.fighterInfo.name, fight.date);
    const opponentInfoAtTheTime = findRankAtTime(allRankingsData, fight.opponentName, fight.date);
    return { ...fight, opponentInfoAtTheTime, fighterRankAtTheTime };
  });
  fighter.record = extendedRecord;

  if (config.SAVE_JSON_TO_FILE) {
    console.log("Saving to file", fighter.fighterInfo.name);
    fileHelper.saveFighter(fighter);
  }

  fighter.rankHistory = findAllRanksForFighter(global.rankData, fighter.fighterInfo.name);

  const series=[];
  fighter.rankHistory
    .forEach(dataPoint => {
      const dateObj = new Date(dataPoint.date);
      const rankStr = dataPoint.fighter.rank;
      const rankNumber = rankStr.trim().toLowerCase().includes("c") ? Number(0) : Number(rankStr) //"C" must be converted to 0 for Apex Charts
      const dataItemToAdd = {isoDate: dateObj.getTime(), dateObj, rank: rankNumber};  
      const trimmedDivisionStr = dataPoint.division.trim();
      const matchingSeries = series.find(seriesItem => seriesItem.divisionFullName === trimmedDivisionStr)
      if (matchingSeries) {
        matchingSeries.data.push(dataItemToAdd);
      } else {
        series.push({divisionShortName: divisionAbbreviation(trimmedDivisionStr), data: [dataItemToAdd] });
      }
    });
  fighter.allRankHistoryPerDivision = series;

  const limitedSeries=[];
  const MAX_MONTH_DIFF = 4;
  series.forEach(seriesItem => {
    seriesItem.data.forEach(dataPoint => {
      let matchingSeries = limitedSeries.find(x => x.divisionShortName === seriesItem.divisionShortName);
      if (!matchingSeries) {
        const newSeriesItemWithoutRankData = { ...seriesItem}; 
        newSeriesItemWithoutRankData.data = newSeriesItemWithoutRankData.data.slice(0,1); //Add first ranking, but nothing more
        limitedSeries.push(newSeriesItemWithoutRankData);
      } else {
        const prevDataInThisSeriesItem = matchingSeries.data.length > 0 ? matchingSeries.data[matchingSeries.data.length - 1] : null;
        if (prevDataInThisSeriesItem) {
          const absoluteMonthDiff = Math.abs((dataPoint.dateObj.getFullYear()*12 + dataPoint.dateObj.getMonth() ) - (prevDataInThisSeriesItem.dateObj.getFullYear()*12 + prevDataInThisSeriesItem.dateObj.getMonth() ));
          if (absoluteMonthDiff > MAX_MONTH_DIFF) {
            const dataPointToPush = {...dataPoint};
            matchingSeries.data.push(dataPointToPush);
          }
        }
      }
    });
  });
  fighter.limitedRankHistoryPerDivision = limitedSeries;

  return fighter;
}

module.exports = { buildRankingsHtml, getFighterNameOrLinkHtml, extendFighterApiDataWithRecordInfo }