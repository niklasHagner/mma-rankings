
function buildFightHistory(fights) {
  const templateStrings = fights.map((fight) => {

    fight.opponentRankStr = "";
    fight.opponentRankHtml = "";
    if (fight.opponentInfoAtTheTime)  {
      const date = new Date(fight.opponentInfoAtTheTime.date);
      let monthString = date.getMonth();
      if (monthString.length === 1) monthString = "0" + monthString;

      const formattedDate = date.getFullYear() + "-" + monthString;

      const showDifferentDivisionInfo = false; // fight.opponentInfoAtTheTime.division !== "xx";
      const differentDivisionInfo = showDifferentDivisionInfo ? ` at ${fight.opponentInfoAtTheTime.division}` : "";
      fight.opponentRankStr = fight.opponentInfoAtTheTime.fighter.rank + differentDivisionInfo + ` in ${formattedDate}`;
      fight.opponentRankHtml = `<span class="fight__opponent-rank">(# ${fight.opponentRankStr})</span>`;
      fight.opponentUrl = "/get-fighter-by-sherdog-url?url=" + encodeURIComponent(fight.opponentUrl);
    }

    return `
      <p>
        <span class="fight__year">${fight.year}:</span>
        <span class="fight__result">${fight.result}</span>
        <a href="${fight.opponentUrl}" class="fight__opponent">${fight.opponentName}</a>
        ${fight.opponentRankHtml}
        <span class="fight__method">${fight.method}</span>
      </p>
    `;
  });
  return templateStrings.join("");
}

const buildFighterHtml = function(fighter) {
  const recentFights = fighter.recentYears.join("<br>");
  return `
    <article class="fighter">
        <header>
          <div class="left-col">
            <img src="https://sherdog.com/${fighter.image}" alt="photo">
          </div>
          <div class="right-col">
            <h1 class="fighter-name">${fighter.name}</h1>
            ${ fighter.nickname.length > 0 ? `<p class="fighter-nickname">"${fighter.nickname.replace('"', '')}"</p>` : "" }
            <p class="fighter-age">age: ${fighter.age}</p>
            <p class="fighter-size">${fighter.height_cm}cm ${fighter.weight_kg}kg</p>
            <p class="fighter-hometown">hometown: ${fighter.hometown}</p>
            <p class="fighter-association">association: ${fighter.association}</p>
          </div>
        </header>
        
        <div class="fights">
          <h4>Record:</h4>
          ${buildFightHistory(fighter.fightHistory)}  
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
  const templateArray = pages.map((page) => {
    const divisionTemplates = page.divisions.filter(vision => vision.name.toLowerCase() !== "women's featherweight").map(division => divisionToHtml(division));
    const divisionsHtmlString = ` 
      <section class="snapshot">
        <h2>Rankings ${page.date}</h2>
        <div class="snapshot-divisions">
            ${divisionTemplates.join("")}
        </div>
      </section>
    `;
    return divisionsHtmlString;
  });
  const totalHtmlString = templateArray.join("");

  const allHtml = `
    ${totalHtmlString}
    `;
  return allHtml;
};

const getFighterProfileByName = function(name) {
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
      console.log("got response");
      console.log(json);
      document.querySelector("#fighters").innerHTML = `
        <section class="records-fighter-list">
            ${buildFighterHtml(json)}
        </section>
      `;
    });
}

const getTopFightersFromRecentEvent = function () {
    console.log("fetching fighters from upcoming event");
    document.querySelector(".triple-loader").classList.remove("hidden");

    fetch(`http://localhost:8081/fighters-from-recent-event`)
    .then((response) => {
      return response.json();
    })
    .then((json) => {
      debugger;
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

const searchByName = function() {
    var name = document.querySelector("#search").value;
    getFighterProfileByName(name);
};

const getMmaStatsByDate = function (date = new Date()) {
    date = formatDate(date);
    console.log("fetching mma-stats for", date);
    document.querySelector(".triple-loader").classList.remove("hidden");
    fetch(`http://localhost:8081/mma-stats-by-date?date=${date}`)
    .then((response) => {
      return response.json();
    })
    .then((json) => {
      document.querySelector(".triple-loader").classList.add("hidden");
      console.log("got mma-stats");
      console.log(json);
      const array = [json];
      document.querySelector("#rankings").innerHTML = `
        <h1 class="post-title">UFC rankings history</h1>
        ${buildRankingsHtml(array)}
      `;
    });
};

const getHistoricalRankingsFromJsonFile = function (date = new Date()) {
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
    });
};


//getHistoricalRankingsFromJsonFile(); // list rankings for all dates

//getMmaStatsByDate(); // list rankings for one date

//getFighterProfiles(""); // by not using any query we'll get the default response: top 4 fighters from the most recent ufc-event
