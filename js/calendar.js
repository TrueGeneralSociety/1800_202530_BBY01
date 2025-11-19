// js/calendar.js
// Assumes calendar.html is in /html and this file is included as type="module".

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

let currentDate = new Date();
let currentMonthIndex = currentDate.getMonth();
let currentYear = currentDate.getFullYear();
let currentDay = currentDate.getDate();
let originalMonthIndex = currentMonthIndex;
let originalYear = currentYear;

// DOM elements
const monthLabel = document.getElementById("month_container");
//const yearLabel = document.getElementById("year_container");
const daysContainer = document.querySelector(".days");
const prevBtn = document.getElementById("prev-month");
const nextBtn = document.getElementById("next-month");

async function renderMonth(year, monthIndex) {
  // Clear previous days
  daysContainer.innerHTML = "";
  // Set month and year labels
  monthLabel.innerText = monthNames[monthIndex] + "\n" + year;

  // Store {month number}.html in a variable
  const response = await fetch(
    "/js/fragments/" + year + "/" + (monthIndex + 1) + ".html"
  );
  const htmlContent = await response.text();
  // Insert the fetched HTML into the days container
  daysContainer.innerHTML = htmlContent;

  const dayItems = document.querySelectorAll(".days li");

  // Find the correct <li> and apply .today
  dayItems.forEach((li) => {
    if (
      li.textContent.trim() === String(currentDay) &&
      year === originalYear &&
      monthIndex === originalMonthIndex
    ) {
      li.classList.add("today");
    }
  });
}

function goPrev() {
  if (currentYear <= 2025 && currentMonthIndex === 0) {
    return;
  }
  currentMonthIndex -= 1;
  if (currentMonthIndex < 0) {
    currentMonthIndex = 11;
    currentYear -= 1;
  }
  renderMonth(currentYear, currentMonthIndex);
}

function goNext() {
  if (currentYear >= 2027 && currentMonthIndex === 11) {
    return;
  }
  currentMonthIndex += 1;
  if (currentMonthIndex > 11) {
    currentMonthIndex = 0;
    currentYear += 1;
  }
  renderMonth(currentYear, currentMonthIndex);
}

// Wire up controls
if (prevBtn) prevBtn.addEventListener("click", goPrev);
if (nextBtn) nextBtn.addEventListener("click", goNext);

// Initial render (start on today's month)
renderMonth(currentYear, currentMonthIndex);
