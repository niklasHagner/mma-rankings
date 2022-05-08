const loader = document.querySelector(".triple-loader");

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
  const allImageHtml = info.relevantImages.length < 0 ? 
  "<img src='https://i.pinimg.com/474x/ca/76/de/ca76deb230c3b4fcbd11763841519da8.jpg' alt='placeholder photo'>"
  :
   info.relevantImages.slice(0,3).map((src) => `
      <img src="${src}" alt="fighter photo">
  `).join("");
  return `
    <article class="fighter">
        <header>
          <div class="left-col">
            ${ allImageHtml }
          </div>
          <div class="right-col">
            <h1 class="fighter-name">${info.name}</h1>
            ${!info.nickname ? '' : `<p class="fighter-nickname"><span>Nickname:</span> ${info.nickname}</p>`}
            <p class="fighter-age"><span>Age:</span> ${info.age}</p>
            <p class="fighter-size"><span>Height:</span> ${ info.height}</p>
            <p class="fighter-reach"><span>Reach:</span> ${info.reach}</p>
            <p class="fighter-birthplace"><span>Born:</span> ${info.birthplace}</p>
            ${!info.fightingOutOf ? '' : `<p class="fighter-association"><span>Fighting out of:</span> ${info.fightingOutOf}</p>`}
            <p class="fighter-team"><span>Team:</span> ${info.team}</p>
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

const searchByName = function(ev) {
  ev.preventDefault();
  var name = document.querySelector("#search-input").value;
  renderFighterProfileByName(name);
};

const renderFighterProfileByName = function(name) {
    console.log("fetching fighters");
    loader.classList.remove("hidden");
    if (name) {
        name = encodeURIComponent(name);
    }
    fetch(`http://localhost:8081/search-fighter-by-name?name=${name}`)
    .then((response) => {
      return response.json();
    })
    .then((json) => {
      loader.classList.add("hidden");
      document.querySelector("#fighter-search-profile").innerHTML = `
      <article>
        <section class="records-fighter-list">
            ${buildFighterHtml(json)}
        </section>
      </article>
      `;
    });
}

const renderFighterProfileByUrl = function(url) {
  console.log("fetching fighters");
  loader.classList.remove("hidden");
  fetch(`/get-fighter-by-sherdog-url?url=${url}`)
  .then((response) => {
    return response.json();
  })
  .then((json) => {
    loader.classList.add("hidden");
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

window.getFightersFromUpcomingEvents = function () {
    loader.classList.remove("hidden");

    fetch(`http://localhost:8081/fighters-from-next-events`)
        .then((response) => {
            return response.json();
        })
        .then((json) => {
            loader.classList.add("hidden");
            const htmlBlob = json.allEvents.map(x => {
                const className = x.isBigEvent ? "post-title big-event" : "post-title";
                return `
                <article>
                    ${x.isBigEvent ? '<p style="color: crimson;">Next big event</p>' : ''}
                    <h1 class="${className}">${x.eventName}</h1>
                    <p>${x.date}</p>
                    <section class="records-fighter-list">
                        ${buildAllFightersHtml(x.fighters)}
                    </section>
                </article>
                `;
        }).join("");
            document.querySelector("#events").innerHTML = htmlBlob;
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
//     loader.classList.remove("hidden");
//     fetch(`http://localhost:8081/mma-stats-by-date?date=${date}`)
//     .then((response) => {
//       return response.json();
//     })
//     .then((json) => {
//       loader.classList.add("hidden");
//       const array = [json];
//       document.querySelector("#rankings").innerHTML = `
//         <h1 class="post-title">UFC rankings history</h1>
//         ${buildRankingsHtml(array)}
//       `;
//     });
// };

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

document.addEventListener('DOMContentLoaded', (e) => {  
  const searchForm = document.querySelector("#search-form");
  if (searchForm) {
    searchForm.addEventListener("submit", searchByName);
  }

  Array.from(document.querySelectorAll(".annual-rank-snapshots p")).forEach(x => x.addEventListener("click", clickAnnualRankingsSnapshot));
});
