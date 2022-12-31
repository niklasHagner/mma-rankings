const loader = document.querySelector(".triple-loader");

const buildAllFightersHtml = function(fighters) {
  const templateArray = fighters.map(fighter => buildFighterHtml(fighter));
  const allHtml = templateArray.join("");
  return allHtml;
};

// const searchByName = function(ev) {
//   ev.preventDefault();
//   var name = document.querySelector("#search-input").value;
//   renderFighterProfileByName(name);
// };

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

// function setupSearch() {
//   const searchForm = document.querySelector("#search-form");
//   if (!searchForm) return;

//   searchForm.addEventListener("submit", searchByName);
// }

document.addEventListener('DOMContentLoaded', (e) => {  
  // setupSearch();
});
