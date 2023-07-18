const jsdom = require('jsdom');

async function scrapeRankings() {
  const url = "https://en.wikipedia.org/wiki/UFC_Rankings";
  console.log("scraping url:", url);

  const divisionNamesInorder = [
    "men p4p", 
    "woman p4p",
    "Heavyweight",
    "Light Heavyweight",
    "Middleweight",
    "Welterweight",
    "Lightweight",
    "Featherweight",
    "Bantamweight",
    "Flyweight",
    "Women's Bantamweight",
    "Women's Flyweight",
    "Women's Strawweight",
    // "women's featherweight", //not included!!
  ];

  return new Promise((resolve) => {
    jsdom.JSDOM.fromURL(url).then(dom => {
      const document = dom.window.document;  
      
      const divisionTables = Array.from(document.querySelectorAll("table")).filter(x => {
        var tr = x.querySelector("tr");
        return tr ? tr.textContent.trim().indexOf("Rank") === 0 : false;
      });

      let divisions = divisionTables.map((table, index) => { 
        const rows = [...table.querySelectorAll("tr")]
            .filter((row, ix) => ix > 1); //First two rows is a tableHeader
        const fightersInDivision = rows.map((row) => {
            const rankText = row.querySelector("th").textContent.trim(); //"C" or a number
            const fighterCell = [...row.querySelectorAll("td")][1]; //For non-famous people it's just a name. Or it's a link like <a href="/wiki/Jon_Jones" title="Jon Jones">Jon Jones</a>
            
            let name = "", link = "";
            const fighterLink = fighterCell.querySelector("a");
            if (fighterLink) {
                name = fighterLink.textContent.trim();
                link = fighterLink.getAttribute("href");
            } else {
                name = fighterCell.textContent.trim();
            }
            
            return {
                name,
                rank: rankText,
                link,
            }
        });

        return { 
          name: divisionNamesInorder[index], 
          fighters: fightersInDivision
        }
      });

      const menp4p = divisions[0];
      const womanp4p = divisions[1];
      const unifiedp4pFighters = [...menp4p.fighters, ...womanp4p.fighters].sort((a,b) => {
        let aRank = mapRankStringToSortableNumber(a.rank), bRank = mapRankStringToSortableNumber(b.rank);
        console.log({aRank,bRank,diff: aRank-bRank});
        return aRank - bRank;
      });
      divisions.shift();
      divisions.shift();
      const unifiedp4pDivision = {
        name: "Pound-for-Pound",
        fighters: unifiedp4pFighters
      };
      divisions = [unifiedp4pDivision, ...divisions ];

      const paragraphWithDate = [...document.querySelectorAll("p")].find(x => x.textContent.indexOf("Rankings updated on") === 0); //Since march 2023 mma-stats.com/rankings stopped updating
      const selectedDate = paragraphWithDate.textContent.split(", after")[0]
        .replace("Rankings updated on", "")
        .replace(", after", "");
  
      const json = {
        date: selectedDate.trim(),
        divisions
      }
  
      console.log("finished scraping UFC rankings page");
      resolve(json);
    });
  })
}

function mapRankStringToSortableNumber(rankStr) {
    if (!rankStr) return rankStr;

    let number;
    rankStr = rankStr.toLowerCase().trim();
    if (rankStr === "c") {
        number = 0;
    } else {
        number = parseInt(rankStr);
    }
    return number;
}

module.exports = {
  scrapeRankings,
}