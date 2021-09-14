"use strict";

window.addEventListener("DOMContentLoaded", start);

let allAnimals = [];
let alteredAnimals = [];

// The prototype for all animals:
const Animal = {
  name: "",
  desc: "-unknown animal-",
  type: "",
  age: 0,
  star: false,
  winner: false,
};

function start() {
  console.log("ready");

  // TODO: Add event-listeners to filter and sort buttons
  document.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", filterAnimals);
  });
  document.querySelectorAll("th").forEach((header) => {
    header.addEventListener("click", sortAnimals);
  });

  loadJSON();
}

async function loadJSON() {
  const response = await fetch("animals.json");
  const jsonData = await response.json();

  // when loaded, prepare data objects
  prepareObjects(jsonData);
}

function prepareObjects(jsonData) {
  allAnimals = jsonData.map(preapareObject);

  alteredAnimals = allAnimals;

  // TODO: This might not be the function we want to call first
  displayList(allAnimals);
}

function preapareObject(jsonObject) {
  const animal = Object.create(Animal);

  const texts = jsonObject.fullname.split(" ");
  animal.name = texts[0];
  animal.desc = texts[2];
  animal.type = texts[3];
  animal.age = jsonObject.age;

  return animal;
}

function filterAnimals() {
  const filter = getFilter(this);

  alteredAnimals = allAnimals.filter(isAnimalType);

  function isAnimalType(animal) {
    if ("*" === filter || animal.type === filter) {
      return true;
    } else {
      return false;
    }
  }

  displayList(alteredAnimals);
}

function getFilter(button) {
  return button.dataset.filter;
}

function sortAnimals() {
  const sortValue = getSort(this);
  const sortDir = getSortDir(this);

  alteredAnimals.sort(compareAnimal);

  function compareAnimal(a, b) {
    if (a[sortValue] < b[sortValue]) {
      return -1 * sortDir;
    } else {
      return 1 * sortDir;
    }
  }

  changeDataSortDir(this);

  displayList(alteredAnimals);
}

function getSort(button) {
  return button.dataset.sort;
}

function getSortDir(button) {
  if (button.dataset.sortDirection === "asc") {
    return 1;
  } else {
    return -1;
  }
}

function changeDataSortDir(button) {
  if (button.dataset.sortDirection === "asc") {
    button.dataset.sortDirection = "desc";
  } else {
    button.dataset.sortDirection = "asc";
  }
}

function displayList(animals) {
  // clear the list
  document.querySelector("#list tbody").innerHTML = "";

  // build a new list
  animals.forEach(displayAnimal);
}

function displayAnimal(animal) {
  // create clone
  const clone = document
    .querySelector("template#animal")
    .content.cloneNode(true);

  // set clone data
  clone.querySelector("[data-field=name]").textContent = animal.name;
  clone.querySelector("[data-field=desc]").textContent = animal.desc;
  clone.querySelector("[data-field=type]").textContent = animal.type;
  clone.querySelector("[data-field=age]").textContent = animal.age;
  clone.querySelector("[data-field=star").addEventListener("click", toggleStar);
  clone
    .querySelector("[data-field=winner]")
    .addEventListener("click", toggleTrophy);
  if (animal.star === false) {
    clone.querySelector("[data-field=star]").textContent = "☆";
  } else {
    clone.querySelector("[data-field=star]").textContent = "⭐";
  }
  if (animal.winner === false) {
    clone.querySelector("[data-field=winner]").classList.add("loser");
  } else {
    clone.querySelector("[data-field=winner]").classList.remove("loser");
  }

  function toggleStar() {
    if (animal.star === false) {
      animal.star = true;
    } else {
      animal.star = false;
    }

    displayList(alteredAnimals);
  }

  function toggleTrophy() {
    const winners = getWinners();
    const winnerTypes = getWinnerTypes(winners);

    if (animal.winner === false) {
      if (winners.length < 2) {
        if (winnerTypes.some((element) => element === animal.type) === false) {
          animal.winner = true;
        } else {
          showErrorBox(winners, "type");
        }
      } else {
        showErrorBox(winners, "total");
      }
    } else {
      animal.winner = false;
    }

    displayList(alteredAnimals);
  }

  // append clone to list
  document.querySelector("#list tbody").appendChild(clone);
}

function showErrorBox(winners, errorType) {
  document.querySelector("#error").style.display = "block";
  document
    .querySelector("#error-shadow")
    .addEventListener("click", hideErrorBox);

  document.querySelector("#error-container").innerHTML = ``;

  if (errorType === "type") {
    showTypeError(winners);
  } else if (errorType === "total") {
    showTotalError(winners);
  }
}

function showTypeError(winners) {
  document.querySelector(
    "#error-text"
  ).textContent = `You can only have one winner of a type`;

  const animal = winners[0];

  const clone = document
    .querySelector("template#animal-error")
    .cloneNode(true).content;
  clone.querySelector(
    ".animal-name"
  ).textContent = `${animal.name} the ${animal.desc} ${animal.type}`;
  clone.querySelector("button").addEventListener("click", removeWinner);
  document.querySelector("#error-container").appendChild(clone);

  function removeWinner() {
    animal.winner = false;

    hideErrorBox();
    displayList(alteredAnimals);
  }
}

function showTotalError(winners) {
  document.querySelector(
    "#error-text"
  ).textContent = `You can only have two winners in total`;

  winners.forEach((animal, index) => {
    const clone = document
      .querySelector("template#animal-error")
      .cloneNode(true).content;
    clone.querySelector(
      ".animal-name"
    ).textContent = `${animal.name} the ${animal.desc} ${animal.type}`;
    clone.querySelector("button").addEventListener("click", removeWinner);
    clone.querySelector("button").setAttribute("index", index);
    document.querySelector("#error-container").appendChild(clone);
  });

  function removeWinner() {
    const winnerIndex = event.target.getAttribute("index");
    winners[winnerIndex].winner = false;

    hideErrorBox();
    displayList(alteredAnimals);
  }
}

function hideErrorBox() {
  document.querySelector("#error").style.display = "none";
}

function getWinners() {
  return alteredAnimals.filter(isWinner);
}

function isWinner(animal) {
  if (animal.winner === true) {
    return true;
  } else {
    return false;
  }
}

function getWinnerTypes(winners) {
  const animalTypes = [];
  winners.forEach((winner) => {
    animalTypes.push(winner.type);
  });
  return animalTypes;
}

function isLeapYear(year) {
  if (year % 4 === 0) {
    if (year % 100 === 0) {
      if (year % 400 === 0) {
        return true;
      } else {
        return false;
      }
    } else {
      return true;
    }
  } else {
    return false;
  }
}
