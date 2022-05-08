
const buildRankingsHtml = function(pages) {
  pages.forEach((x) => {
    x.divisions = getSortedDivisions(x.divisions);
  });
  let latestRanks = pages[0];
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

  const snapshotsGroupedByYear = [];
  snapshots.forEach((snapshot) => {
    const matchingItem = snapshotsGroupedByYear.find(x => x.year === snapshot.year);
    if (matchingItem) {
      const matchingIndex = snapshotsGroupedByYear.indexOf(matchingItem);
      snapshotsGroupedByYear[matchingIndex].html += snapshot.html;
    } else {
      snapshotsGroupedByYear.push(snapshot);
    }
  }) 

  let totalHtmlString = snapshotsGroupedByYear.map((annualSnapshot, index) => {
    // const modifierClass = index === 0 ? " : "annual-rank-snapshots--collapsed";
    const modifierClass = "annual-rank-snapshots--collapsed";
    return `
      <div class="annual-rank-snapshots ${modifierClass}">
        <p>${annualSnapshot.year}</p>
        ${annualSnapshot.html}
      </div>
    `;
  }).join("");

  totalHtmlString = `
      <h2 id="latest-rankings">Rankings ${latestRanks.date}</h2>
      <section class="snapshot-divisions">
        ${latestRanks.divisions.map(x => divisionToHtml(x)).join("")}
      </section>
      <h1 class="post-title" id="historical-rankings">UFC rankings history</h1>
      ${totalHtmlString}
    </section>
  `;
  return totalHtmlString;
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

    return `
      <article>
        <span class="rank">${fighter.rank}</span> <span class="name">${fighter.name}</span>
      </article>
    `;
  }).join("<br>");
  return `
    <article class="division">
        <h3 class="division-name">${division.name}</h3>
        <div class="division-fighters">${fighters}</div>
    </article>
  `;
};

module.exports = { buildRankingsHtml }
