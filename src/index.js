import Chart from "chart.js";

let _chart;
let _data;
let _filteredData = {};
let _filterToDate;
let _filterFromDate;

function createTable(data) {
  var dataTableElement = document.getElementById("data");
  Object.keys(data)
    .sort((a, b) => a.localeCompare(b))
    .forEach((country) => {
      var trElement = document.createElement("tr");

      var timeSeriesData = data[country];
      var casesCount = timeSeriesData[timeSeriesData.length - 1].confirmed;
      var deathsCount = timeSeriesData[timeSeriesData.length - 1].deaths;

      var tdElementLocation = document.createElement("td");
      tdElementLocation.innerHTML = country;
      trElement.appendChild(tdElementLocation);

      var tdCasesCount = document.createElement("td");
      tdCasesCount.innerHTML = casesCount;
      trElement.appendChild(tdCasesCount);

      var tdDeathsCount = document.createElement("td");
      tdDeathsCount.innerHTML = deathsCount;
      trElement.appendChild(tdDeathsCount);

      dataTableElement.appendChild(trElement);
    });
}

function createChart(data) {
  var countriesDropDown = document.getElementById("countries");

  function getCountryData(country) {
    var countryData = data[country];
    var confirmedCasesData = countryData.map((datapoint) => {
      var xyObject = {};
      xyObject.x = datapoint.date;
      xyObject.y = datapoint.confirmed;
      return xyObject;
    });

    var deathsData = countryData.map((datapoint) => {
      var xyObject = {};
      xyObject.x = datapoint.date;
      xyObject.y = datapoint.deaths;
      return xyObject;
    });

    return {
      confirmed: confirmedCasesData,
      deaths: deathsData,
    };
  }

  function handleCountryChange(event) {
    let country = event.target.value;
    let countryData = getCountryData(country);
    loadChart(countryData.confirmed, countryData.deaths);
  }

  function loadFirstCountry() {
    countriesDropDown.selectedIndex = 0;
    let country =
      countriesDropDown.options[countriesDropDown.selectedIndex].value;
    let countryData = getCountryData(country);
    loadChart(countryData.confirmed, countryData.deaths);
  }

  countriesDropDown.addEventListener("change", handleCountryChange, false);
  Object.keys(data)
    .sort((a, b) => a.localeCompare(b))
    .forEach((country) => {
      var option = document.createElement("option");
      option.value = country;
      option.text = country;
      countriesDropDown.appendChild(option);
    });

  loadFirstCountry();
}

function formatDate(date) {
  let day = ("0" + date.getDate()).slice(-2);
  let month = ("0" + (date.getMonth() + 1)).slice(-2);
  let dateString = date.getFullYear() + "-" + month + "-" + day;
  return dateString;
}

function setupDateInput() {
  const firstAfghanistanObject = _data.Afghanistan[0];

  let fromDateValue = new Date(firstAfghanistanObject.date);
  let toDateValue = new Date();
  let fromDateInput = document.getElementById("fromDate");

  _filterFromDate = fromDateValue;
  _filterToDate = toDateValue;

  const formattedFromDate = formatDate(fromDateValue);
  const formattedToDate = formatDate(toDateValue);

  fromDateInput.value = formattedFromDate;
  fromDateInput.min = formattedFromDate;
  fromDateInput.max = formattedToDate;

  let toDateInput = document.getElementById("toDate");
  toDateInput.value = formattedToDate;
  toDateInput.max = formattedToDate;
  toDateInput.min = formattedFromDate;

  fromDateInput.addEventListener("change", handleFromDateChange, false);
  toDateInput.addEventListener("change", handleToDateChange, false);
}

function applyFilters() {
  const countries = Object.keys(_data);
  countries.forEach((country) => {
    _filteredData[country] = _data[country].filter(
      (each) =>
        new Date(each.date) <= _filterToDate &&
        new Date(each.date) >= _filterFromDate
    );
  });
  console.log(_filteredData);
  createChart(_filteredData);
}

function handleToDateChange(event) {
  _filterToDate = new Date(event.target.value);
  applyFilters();
}

function handleFromDateChange(event) {
  _filterFromDate = new Date(event.target.value);
  applyFilters();
}

function setupLastUpdated(data) {
  const lastUpdatedElement = document.getElementById("lastUpdated");
  const lastAfghanistanObject = data.Afghanistan[data.Afghanistan.length - 1];
  lastUpdatedElement.innerHTML = new Date(
    lastAfghanistanObject.date
  ).toLocaleDateString();
}

function setupTotalConfirmedCases(data) {
  const countries = Object.keys(data);
  let totalConfirmedCases = 0;
  countries.forEach((country) => {
    const lastData = data[country][data[country].length - 1];
    totalConfirmedCases += lastData.confirmed;
  });
  const totalConfirmedElement = document.getElementById("totalConfirmedCases");
  totalConfirmedElement.innerHTML = totalConfirmedCases;
}

let request = new Request("https://pomber.github.io/covid19/timeseries.json");
fetch(request)
  .then((response) => {
    return response.json();
  })
  .then((data) => {
    _data = data;
    setupDateInput();
    createTable(data);
    createChart(data);
    setupLastUpdated(data);
    setupTotalConfirmedCases(data);
  });

function loadChart(data1, data2, data3) {
  var ctx = document.getElementById("myChart").getContext("2d");
  if (_chart) {
    _chart.destroy();
  }

  Chart.defaults.global.defaultFontColor = "rgb(184, 182, 182)";
  defaultFontFamily: "Arial";
  _chart = new Chart(ctx, {
    // The type of chart we want to create
    type: "line",

    // The data for our dataset
    data: {
      datasets: [
        {
          label: "Confirmed Cases",
          backgroundColor: "#5ab0e2",
          borderColor: "#5ab0e2",
          fill: false,
          data: data1,
        },
        {
          label: "Deaths",
          backgroundColor: "rgb(255, 99, 132)",
          borderColor: "rgb(255, 99, 132)",
          fill: false,
          lineDashType: "dash",
          data: data2,
        },
      ],
    },
    // Configuration options go here
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        xAxes: [
          {
            type: "category",
            labels: data1.map((datapoint) => datapoint.x),
            gridLines: {
              color: "black",
            },
          },
        ],
        yAxes: [
          {
            gridLines: {
              color: "black",
            },
          },
        ],
      },
    },
  });
}
