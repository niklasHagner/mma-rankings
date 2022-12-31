
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
    
    const fighterFileMatch = global.fightersWithProfileLinks.find(x => x.fighterAnsiName === fighter.name);
    const fighterLink = fighterFileMatch ? `/fighter/${fighterFileMatch.fileName.replace(".json", "")}` : null;
    const fighterNameElement = fighterLink ? `<a href="${fighterLink}" class="name">${fighter.name}</a>` : `<span class="name">${fighter.name}</span>`;

    return `
      <article>
        <span class="rank">${fighter.rank}</span> ${fighterNameElement}
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
