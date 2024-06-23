const loader = document.querySelector(".triple-loader");
const searchMenuItem = document.querySelector(".menu-item--search"); // toggles searchForm
const searchInput = document.querySelector(".search-input"); // child of searchForm
const searchForm = document.querySelector(".search-form");
const searchResults = document.querySelector(".search-results");
const searchClearButton = document.querySelector(".search-clear");

searchClearButton.addEventListener("click", function () { 
searchResults.classList.add("hidden");
  searchResults.innerHTML = "";
  searchInput.value = "";
});

searchMenuItem.addEventListener("click", function () {
  searchForm.classList.toggle("hidden");
  searchInput.focus();
});

const searchByName = async function (ev) {
  var q = searchInput.value;
  const response = await fetch(`/search?query=${q}`);
  const html = await response.text();
  searchResults.classList.remove("hidden");
  searchResults.innerHTML = html;
};

function setupSearch() {
  if (!searchForm) {
    return;
  }

  searchForm.addEventListener("submit", (ev) => {
    ev.preventDefault();
    const q = searchInput.value;
    searchByName(q);
  });
}

function setupAllApexCharts() {
  const fighterElements = [...document.querySelectorAll(".fighter")];

  fighterElements.forEach(fighterEl => {
    setupSingleApexChart(fighterEl);
  });
}


function setupSingleApexChart(fighterEl) {
  // Apex wants this type of data. One seriesItem per division
  // series = [
  //   {
  //     name: 'WW',
  //     data: [[1486771200000, 30], [1486857600000, 26], [1486944000000, 16], [1487030400000, 17], [1487116800000, 41], [1487203200000, 33], [1487289600000, 52], [1487376000000, 13], [1487462400000, 60], [1487548800000, 16], [1487635200000, 11], [1487721600000, 47], [1487808000000, 43], [1487894400000, 24], [1487980800000, 52], [1488067200000, 56], [1488153600000, 24], [1488240000000, 22], [1488326400000, 37], [1488412800000, 50]]
  //   },
  //   {
  //     name: 'LW',
  //     data: [[1486771200000, 30], [1486857600000, 26]
  //   },
  // ];

  const chartPlaceholderElement = fighterEl.querySelector(".apex-chart");
  const chartDataElement = fighterEl.querySelector(".chart-data-container");

  if (!chartPlaceholderElement || !chartDataElement) {
    return;
  }

  let unformattedSeries;
  try {
    unformattedSeries = JSON.parse(chartDataElement.getAttribute("data-dump"));
  } catch (error) {
    console.log("JSON error for", fighterEl, chartDataElement.getAttribute("data-dump"));
    return;
  }

  //Adapt data for apex
  const series = unformattedSeries.map(seriesItem => {
    const apexDataArray = seriesItem.data.map(dataPoint => {
      return [dataPoint.isoDate, dataPoint.rank];
    });
    return { name: seriesItem.divisionShortName, data: apexDataArray };
  });

  console.log(series);

  var apexChartOptions = {
    series: series,
    colors: ["#FFD700", "#FFA500", "#DC143C", "#4B0082"],
    theme: {
      mode: "dark",
    },
    chart: {
      height: 200,
      type: 'scatter',
      toolbar: { show: false },
    },
    markers: {
      strokeWidth: 0,
      shape: "circle",
    },
    dataLabels: {
      enabled: false
    },
    grid: {
      xaxis: {
        lines: {
          show: true
        }
      },
      yaxis: {
        lines: {
          show: true
        }
      },
    },
    xaxis: {
      type: 'datetime',
    },
    yaxis: {
      reversed: true,
      min: 0,
      max: 16, // Rankings end at 15 but an even max number is required to have stepSize: 2
      stepSize: 2, // C, 2, 4, 6...
      labels: {
        formatter: (val) => { if (val === 0) return "C"; return val }, // Format 0 to C for champion
      },
    }
  };

  var chart = new ApexCharts(chartPlaceholderElement, apexChartOptions);
  chart.render();
}

document.addEventListener('DOMContentLoaded', () => {
  setupSearch();
  setupAllApexCharts();
});
