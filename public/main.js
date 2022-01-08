
function buildFightHistory(fights) {
  const templateStrings = fights.map((fight) => {

    fight.opponentRankStr = "";
    fight.opponentRankHtml = "";
    if (fight.opponentInfoAtTheTime)  {
      const dateOfOpponentRank = new Date(fight.opponentInfoAtTheTime.date);
      let monthString = dateOfOpponentRank.getMonth();
      if (monthString.length === 1) { 
        monthString = "0" + monthString;
      }
      const yearOfOpponentRank = dateOfOpponentRank.getFullYear();
      const formattedDate = yearOfOpponentRank + "-" + monthString;

      const showDifferentDivisionInfo = false; // fight.opponentInfoAtTheTime.division !== "xx";
      const differentDivisionInfo = showDifferentDivisionInfo ? ` at ${fight.opponentInfoAtTheTime.division}` : "";
      fight.opponentRankStr = fight.opponentInfoAtTheTime.fighter.rank + differentDivisionInfo + ` in ${formattedDate}`;
      
      let rankModifierClass = ""
      if (Number(fight.year) > yearOfOpponentRank) {
        rankModifierClass  = "fight__opponent-rank--past"
      } else if (yearOfOpponentRank > Number(fight.year)) {
        rankModifierClass  = "fight__opponent-rank--future"
      }
      fight.opponentRankHtml = `
      <span class="fight__opponent-rank ${rankModifierClass}">
        (# ${fight.opponentRankStr})
      </span>`;
      fight.opponentUrl = encodeURIComponent(fight.opponentUrl);
    }

    let fightModifierClass = "";
    if (fight.result === "Win") {
      fightModifierClass = "fight--win";
    } else if(fight.result === "Loss") {
      fightModifierClass = "fight--loss";
    }

    return `
      <p class="fight ${fightModifierClass}">
        <span class="fight__year">${fight.year}:</span>
        <span class="fight__result">${fight.result}</span>
        <span onclick="clickFighterLink('${fight.opponentUrl}')" data-url="${fight.opponentUrl}" class="fight__opponent">${fight.opponentName}</span>
        ${fight.opponentRankHtml}
        <span class="fight__method">${fight.method}</span>
      </p>
    `;
  });
  return templateStrings.join("");
}

const buildFighterHtml = function(fighter) {
  const recentFights = fighter.recordString; //fighter.record.join("<br>");
  const info = fighter.fighterInfo;
  // ${ fighter.nickname.length > 0 ? `<p class="fighter-nickname">"${fighter.nickname.replace('"', '')}"</p>` : "" }
  return `
    <article class="fighter">
        <header>
          <div class="left-col">
            <img src="${info.relevantImages[0]}" alt="photo">
          </div>
          <div class="right-col">
            <h1 class="fighter-name">${info.name}</h1>
            <p class="fighter-age">age: ${info.birthDate && info.birthDate.age ? info.birthDate.age : "unknown<"}</p>
            <p class="fighter-size">${info.height}cm ${info.weight}kg</p>
            <p class="fighter-hometown">hometown: ${info.residence}</p>
            <p class="fighter-association">association: ${info.team}</p>
          </div>
        </header>
        
        <div class="fights">
          <h4>Record:</h4>
          ${buildFightHistory(fighter.record)}  
        </div>
    </article>
  `;
};

const buildAllFightersHtml = function(fighters) {
  const templateArray = fighters.map(fighter => buildFighterHtml(fighter));
  const allHtml = templateArray.join("");
  return allHtml;
};

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

const buildRankingsHtml = function(pages) {
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

  const totalHtmlString = snapshotsGroupedByYear.map((annualSnapshot, index) => {
    // const modifierClass = index === 0 ? " : "annual-rank-snapshots--collapsed";
    const modifierClass = "annual-rank-snapshots--collapsed";
    return `
      <div class="annual-rank-snapshots ${modifierClass}">
        <p>${annualSnapshot.year}</p>
        ${annualSnapshot.html}
      </div>
    `;
  }).join("");

  return totalHtmlString;
};


const searchByName = function(ev) {
  ev.preventDefault();
  var name = document.querySelector("#search-input").value;
  renderFighterProfileByName(name);
};

const renderFighterProfileByName = function(name) {
    console.log("fetching fighters");
    document.querySelector(".triple-loader").classList.remove("hidden");
    if (name) {
        name = encodeURIComponent(name);
    }
    fetch(`http://localhost:8081/search-fighter-by-name?name=${name}`)
    .then((response) => {
      return response.json();
    })
    .then((json) => {
      document.querySelector(".triple-loader").classList.add("hidden");
      document.querySelector("#fighters").innerHTML = `
        <section class="records-fighter-list">
            ${buildFighterHtml(json)}
        </section>
      `;
    });
}

const renderFighterProfileByUrl = function(url) {
  console.log("fetching fighters");
  document.querySelector(".triple-loader").classList.remove("hidden");
  fetch(`/get-fighter-by-sherdog-url?url=${url}`)
  .then((response) => {
    return response.json();
  })
  .then((json) => {
    document.querySelector(".triple-loader").classList.add("hidden");
    const newEl = document.createElement("section");
    newEl.innerHTML = `
      <section class="records-fighter-list">
          ${buildFighterHtml(json)}
      </section>
    `;
    const container = document.querySelector(".single-post-container");
    container.prepend(newEl);
  });
}

window.getTopFightersFromRecentEvent = function () {
    document.querySelector(".triple-loader").classList.remove("hidden");

    fetch(`http://localhost:8081/fighters-from-next-event`)
    .then((response) => {
      return response.json();
    })
    .then((json) => {
      document.querySelector(".triple-loader").classList.add("hidden");
      document.querySelector("#fighters").innerHTML = `
        <h1 class="post-title">${json.eventName}</h1>
        <section class="records-fighter-list">
            ${buildAllFightersHtml(json.fighters)}
        </section>
      `;
    });
};

function formatDate(date) {
  var d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

  if (month.length < 2) 
      month = '0' + month;
  if (day.length < 2) 
      day = '0' + day;

  return [year, month, day].join('-');
}

// const getMmaStatsByDate = function (date = new Date()) {
//     date = formatDate(date);
//     console.log("fetching mma-stats for", date);
//     document.querySelector(".triple-loader").classList.remove("hidden");
//     fetch(`http://localhost:8081/mma-stats-by-date?date=${date}`)
//     .then((response) => {
//       return response.json();
//     })
//     .then((json) => {
//       document.querySelector(".triple-loader").classList.add("hidden");
//       const array = [json];
//       document.querySelector("#rankings").innerHTML = `
//         <h1 class="post-title">UFC rankings history</h1>
//         ${buildRankingsHtml(array)}
//       `;
//     });
// };

window.getHistoricalRankingsFromJsonFile = function (date = new Date()) {
    date = formatDate(date);
    document.querySelector(".triple-loader").classList.remove("hidden");
    fetch(`http://localhost:8081/serve-rankings-file`)
    .then((response) => {
      return response.json();
    })
    .then((json) => {
      document.querySelector(".triple-loader").classList.add("hidden");
      console.log("got mma-stats");
      console.log(json);
      const array = json.dates;
      document.querySelector("#rankings").innerHTML = `
        <h1 class="post-title">UFC rankings history</h1>
        ${buildRankingsHtml(array)}
      `;
      Array.from(document.querySelectorAll(".annual-rank-snapshots p")).forEach(x => x.addEventListener("click", clickAnnualRankingsSnapshot));
    });
};

function clickFighterLink(url) {
  renderFighterProfileByUrl(url);
}

function clickAnnualRankingsSnapshot(ev) {
  const target = ev.target.closest(".annual-rank-snapshots");
  if (target.classList.contains("annual-rank-snapshots--collapsed")) {
    target.classList.remove("annual-rank-snapshots--collapsed");
  } else {
    target.classList.add("annual-rank-snapshots--collapsed");
  }
}

document.querySelector("#search-form").addEventListener("submit", searchByName);