const loader = document.querySelector(".triple-loader");

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
        <section class="fighters-on-card">
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
      <section class="fighters-on-card">
          ${buildFighterHtml(json)}
      </section>
    `;
    const container = document.querySelector(".single-post-container");
    container.prepend(newEl);
  });
}

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

document.addEventListener('DOMContentLoaded', (e) => {  
  const searchForm = document.querySelector("#search-form");
  if (searchForm) {
    searchForm.addEventListener("submit", searchByName);
  }

});
