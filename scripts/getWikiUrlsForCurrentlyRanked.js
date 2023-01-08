
// Get all fighter URLs from https://en.wikipedia.org/wiki/UFC_Rankings
function scrapeWikiUrlsForCurrentlyRankedFighters() {
  const tableBodies = [...document.querySelectorAll(".wikitable tbody")]
    .filter((x) => { const tableHeaders = [...x.querySelectorAll("th")]; return tableHeaders.length > 1 })

  const rows = tableBodies
    .map(x => [...x.querySelectorAll("tr")])
    .flat()
    .filter(x => !x.innerText.includes("Win Streak") && !x.innerText.includes("Opponent"))

  const hrefs = rows.map(x => {
    const relevantTd = [...x.querySelectorAll("td")][1];
    if (!relevantTd) return null;
    const link = relevantTd.querySelector("a");
    if (!link) return null;
    return link.href;
  }).filter(x => x);

  const uniqueHrefs = [... new Set(hrefs)];
  return uniqueHrefs;
}