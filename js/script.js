"use strict";

// STATE

const state = {
  language: "en",
  photoSource: "github",
  queries: "nature",
  todo: [],
  todoDone: [],
  blocks: ["time", "date", "greeting", "quote", "weather", "audio", "todolist"],
};

function setLocalStorage() {
  localStorage.setItem("name", name.value);
  localStorage.setItem("city", city.value);
  localStorage.setItem("language", state.language);
  localStorage.setItem("photoSource", state.photoSource);
  localStorage.setItem("queries", state.queries);
  localStorage.setItem("todo", JSON.stringify(state.todo));
  localStorage.setItem("todoDone", JSON.stringify(state.todoDone));
  localStorage.setItem("blocks", JSON.stringify(state.blocks));
}

function getLocalStorage() {
  if (localStorage.getItem("name")) {
    name.value = localStorage.getItem("name");
  }
  if (localStorage.getItem("city")) {
    city.value = localStorage.getItem("city");
  }
  if (localStorage.getItem("language")) {
    state.language = localStorage.getItem("language");
  }
  if (localStorage.getItem("photoSource")) {
    state.photoSource = localStorage.getItem("photoSource");
  }
  if (localStorage.getItem("queries")) {
    state.queries = localStorage.getItem("queries");
  }
  if (localStorage.getItem("todo")) {
    state.todo = JSON.parse(localStorage.getItem("todo"));
  }
  if (localStorage.getItem("todoDone")) {
    state.todoDone = JSON.parse(localStorage.getItem("todoDone"));
  }
  if (localStorage.getItem("blocks")) {
    state.blocks = JSON.parse(localStorage.getItem("blocks"));
  }
}

window.addEventListener("beforeunload", setLocalStorage);
window.addEventListener("load", getLocalStorage);

// PRELOADER

function offPreloader() {
  preloader.classList.add("section-deactive");
  setTimeout(() => {
    preloader.style.display = "none";
  }, 300);
}

const preloader = document.querySelector(".preloader");

// TIME

function showTime() {
  const date = new Date();
  timeSection.textContent = date.toLocaleTimeString('uk-UA');
  setTimeout(showTime, 1000);
  showDate();
}

function showDate() {
  const date = new Date();
  const options = {
    weekday: "long",
    month: "long",
    day: "numeric",
  };
  dateSection.textContent = date.toLocaleDateString(`${state.language}`, options);
}

const timeSection = document.querySelector(".time");
const dateSection = document.querySelector(".date");

showTime();

// GREATING

function getTimeOfDay() {
  const date = new Date();
  const hours = date.getHours();
  if (hours < 6) return "night";
  else if (hours < 12) return "morning";
  else if (hours < 18) return "afternoon";
  else return "evening";
}

function getTimeOfDayRu() {
  const date = new Date();
  const hours = date.getHours();
  if (hours < 6) return "Доброй ночи,";
  else if (hours < 12) return "Доброе утро,";
  else if (hours < 18) return "Добрый день,";
  else return "Добрый вечер,";
}

function showGreeting() {
  if (state.language === "en") {
    greetingSection.textContent = `Good ${getTimeOfDay()},`;
  } else if (state.language === "ru") {
    greetingSection.textContent = getTimeOfDayRu();
  }
  setTimeout(showGreeting, 1000);
  changeWidth();
}

function addDot() {
  if (name.value.length !== 0 && !name.value.endsWith(".")) {
    name.value += ".";
  }
  if (name.value.length === 1 && name.value.endsWith(".")) {
    name.value = "";
  }
  changeWidth();
}

function changeWidth() {
  if (name.value.length === 0) {
    if (document.documentElement.clientWidth > 768) {
      name.style.width = "280px";
    } else {
      name.style.width = "235px";
    }
  } else {
    buffer.innerHTML = name.value;
    name.style.width = buffer.clientWidth + "px";
  }
}

const greetingSection = document.querySelector(".greeting");
const name = document.querySelector(".name");
const buffer = document.createElement("div");
buffer.className = "buffer";
name.parentNode.insertBefore(buffer, name.nextSibling);

name.addEventListener("change", () => {
  addDot();
  changeWidth();
});

// SLIDER

function getRandomNum(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
}

async function setBg() {
  errorsCount = 0;
  const timeOfDay = getTimeOfDay();
  const bgNum = String(randomNum).padStart(2, "0");
  const img = new Image();
  if (state.photoSource === "github") {
    img.src = `https://github.com/vovkahorror/stage1-tasks/raw/assets/images/${timeOfDay}/${bgNum}.webp`;
  } else if (state.photoSource === "unsplash") {
    img.src = await getImageFromUnsplash();
  } else if (state.photoSource === "flickr") {
    if (await getImageFromFlickr()) {
      img.src = await getImageFromFlickr();
    } else {
      await getImageFromFlickr();
    }
  }
  img.addEventListener("load", () => {
    body.style.backgroundImage = `url(${img.src})`;
    offPreloader();
  });
}

function getSlideNext() {
  if (state.photoSource === "github") {
    randomNum++;
    if (randomNum > 20) randomNum = 1;
    setBg();
  } else setBg();
}

function getSlidePrev() {
  if (state.photoSource === "github") {
    randomNum--;
    if (randomNum < 1) randomNum = 20;
    setBg();
  } else setBg();
}

let randomNum;
let errorsCount = 0;
const body = document.querySelector("body");
const slideNext = document.querySelector(".slide-next");
const slidePrev = document.querySelector(".slide-prev");

slideNext.addEventListener("click", getSlideNext);
slidePrev.addEventListener("click", getSlidePrev);

getRandomNum(1, 20);

// WEATHER

async function getWeather() {
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city.value}&lang=${state.language}&appid=9180cdccd332741b9339d12beb243105&units=metric`;
    const res = await fetch(url);
    const data = await res.json();

    weatherError.textContent = "";
    weatherIcon.className = "weather-icon owf";
    weatherIcon.classList.add(`owf-${data.weather[0].id}`);
    temperature.textContent = `${data.main.temp.toFixed(0)}°C`;
    weatherDescription.textContent = data.weather[0].description;
    if (state.language === "en") {
      wind.textContent = `Wind speed: ${data.wind.speed.toFixed(0)} m/s`;
      humidity.textContent = `Humidity: ${data.main.humidity.toFixed(0)}%`;
    } else if (state.language === "ru") {
      wind.textContent = `Скорость ветра: ${data.wind.speed.toFixed(0)} м/с`;
      humidity.textContent = `Влажность: ${data.main.humidity.toFixed(0)}%`;
    }
  } catch {
    if (state.language === "en") {
      if (city.value.length === 0) {
        weatherError.textContent = `Error! Nothing to geocode!`;
      } else {
        weatherError.textContent = `Error! City not found for "${city.value}"!`;
      }
    } else if (state.language === "ru") {
      if (city.value.length === 0) {
        weatherError.textContent = `Ошибка! Нечего геокодировать!`;
      } else {
        weatherError.textContent = `Ошибка! Город "${city.value}" не найден!`;
      }
    }
    weatherIcon.className = "weather-icon owf";
    temperature.textContent = "";
    weatherDescription.textContent = "";
    wind.textContent = "";
    humidity.textContent = "";
  }
}

const city = document.querySelector(".city");
const weatherSection = document.querySelector(".weather");
const weatherIcon = document.querySelector(".weather-icon");
const weatherError = document.querySelector(".weather-error");
const temperature = document.querySelector(".temperature");
const weatherDescription = document.querySelector(".weather-description");
const wind = document.querySelector(".wind");
const humidity = document.querySelector(".humidity");

document.addEventListener("DOMContentLoaded", getLocalStorage);
document.addEventListener("DOMContentLoaded", getWeather);
city.addEventListener("change", getWeather);

// QUOTES

function getRandomQuote(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function getQuotes() {
  const quotes = `json/quotes_${state.language}.json`;
  const res = await fetch(quotes);
  const data = await res.json();
  const randomQuote = getRandomQuote(0, data.length - 1);
  quotesBlock.classList.add("quotes-block-transparent");
  setTimeout(() => {
    quotesBlock.classList.remove("quotes-block-transparent");
    quote.textContent = `"${data[randomQuote].text}"`;
    author.textContent = data[randomQuote].author;
  }, 300);
}

function rotateElement(elem) {
  elem.style.transition = "0.3s";
  elem.style.transform = "rotate(180deg)";
  setTimeout(() => {
    elem.style.transition = "none";
    elem.style.transform = "";
  }, 300);
}

const quotesBlock = document.querySelector(".quotes-block");
const quote = document.querySelector(".quote");
const author = document.querySelector(".author");
const changeQuote = document.querySelector(".change-quote");

window.addEventListener("load", getQuotes);
changeQuote.addEventListener("click", () => {
  getQuotes();
  rotateElement(changeQuote);
});

setInterval(() => {
  setBg();
  getWeather();
  getQuotes();
}, 3600000);

// AUDIO

import playList from "./playlist.js";

function playAudio() {
  if (!isPlay) {
    audio.src = playList[playNum].src;
    audio.currentTime = pauseTime;
    isPlay = true;
    audio.play();
    currentTrack();
    playBtn.classList.add("pause");
    playItems[playNum].classList.add("item-before");
    trackName.textContent = playList[playNum].title;
    audio.onloadedmetadata = () =>
      (totalDuration.textContent = getTimeCodeFromNum(audio.duration));
  } else {
    pauseTime = audio.currentTime;
    audio.pause();
    isPlay = false;
    playBtn.classList.remove("pause");
    playItems[playNum].classList.remove("item-before");
  }
}

function playNext() {
  pauseTime = 0;
  playNum++;
  if (playNum > playList.length - 1) playNum = 0;
  isPlay = false;
  playAudio();
}

function playPrev() {
  pauseTime = 0;
  playNum--;
  if (playNum < 0) playNum = playList.length - 1;
  isPlay = false;
  playAudio();
}

function currentTrack() {
  const playItems = document.querySelectorAll(".play-item");
  playItems.forEach((el) => {
    el.classList.remove("item-active");
    el.classList.remove("item-before");
  });
  playItems[playNum].classList.add("item-active");
  playItems[playNum].classList.add("item-before");
}

function changeTimeline(event) {
  const timelineWidth = window.getComputedStyle(timeline).width;
  audio.currentTime = (event.offsetX / parseInt(timelineWidth)) * audio.duration;
  if (!isPlay) {
    isPlay = true;
    playAudio();
  }
}

function changeVolume(event) {
  const sliderWidth = window.getComputedStyle(volumeSLider).width;
  const newVolume = event.offsetX / parseInt(sliderWidth);
  audio.muted = false;
  audio.volume = newVolume;
  volumePercentage.style.width = newVolume * 100 + "%";
  changeVolumeIcon();
}

function changeMute() {
  audio.muted = !audio.muted;
  volumeButton.classList.toggle("volume-button-mute");
  volumePercentage.classList.toggle("volume-percentage-mute");
}

function changeVolumeIcon() {
  if (audio.volume === 0) {
    volumeButton.classList.remove("volume-button-medium");
    volumeButton.classList.remove("volume-button-low");
    volumeButton.classList.remove("volume-button-off");
    volumeButton.classList.add("volume-button-mute");
    volumePercentage.classList.add("volume-percentage-mute");
  } else if (audio.volume < 0.25) {
    volumeButton.classList.remove("volume-button-medium");
    volumeButton.classList.remove("volume-button-low");
    volumeButton.classList.remove("volume-button-mute");
    volumeButton.classList.add("volume-button-off");
  } else if (audio.volume < 0.5) {
    volumeButton.classList.remove("volume-button-medium");
    volumeButton.classList.remove("volume-button-off");
    volumeButton.classList.remove("volume-button-mute");
    volumeButton.classList.add("volume-button-low");
  } else if (audio.volume < 0.75) {
    volumeButton.classList.remove("volume-button-low");
    volumeButton.classList.remove("volume-button-off");
    volumeButton.classList.remove("volume-button-mute");
    volumeButton.classList.add("volume-button-medium");
  } else {
    volumeButton.classList.remove("volume-button-medium");
    volumeButton.classList.remove("volume-button-low");
    volumeButton.classList.remove("volume-button-off");
    volumeButton.classList.remove("volume-button-mute");
  }
}

function getTimeCodeFromNum(num) {
  let seconds = parseInt(num);
  let minutes = parseInt(seconds / 60);
  seconds -= minutes * 60;
  const hours = parseInt(minutes / 60);
  minutes -= hours * 60;

  if (hours === 0) return `${minutes}:${String(seconds % 60).padStart(2, 0)}`;
  return `${String(hours).padStart(2, 0)}:${minutes}:${String(
    seconds % 60
  ).padStart(2, 0)}`;
}

setInterval(() => {
  progressBar.style.width = (audio.currentTime / audio.duration) * 100 + "%";
  currentDuration.textContent = getTimeCodeFromNum(audio.currentTime);
}, 100);

const player = document.querySelector(".player");
const playBtn = document.querySelector(".play");
const playNextBtn = document.querySelector(".play-next");
const playPrevBtn = document.querySelector(".play-prev");
const playListContainer = document.querySelector(".play-list");
const audio = new Audio();
let isPlay = false;
let playNum = 0;
let pauseTime = 0;
const trackName = document.querySelector(".current-track");
const timeline = document.querySelector(".timeline");
const progressBar = document.querySelector(".progress");
const currentDuration = document.querySelector(".current");
const totalDuration = document.querySelector(".length");
const volumeButton = document.querySelector(".volume-button");
const volumeSLider = document.querySelector(".volume-slider");
const volumePercentage = document.querySelector(".volume-percentage");

playList.forEach((el) => {
  const li = document.createElement("li");
  li.classList.add("play-item");
  li.textContent = `${el.title}`;
  playListContainer.append(li);
});

const playItems = document.querySelectorAll(".play-item");

playItems.forEach((el, ind) => {
  el.addEventListener("click", () => {
    if (playNum !== ind) {
      isPlay = false;
      pauseTime = 0;
    }
    playNum = ind;
    el.classList.toggle("item-before");
    playAudio();
  });
});

playBtn.addEventListener("click", playAudio);
playNextBtn.addEventListener("click", playNext);
playPrevBtn.addEventListener("click", playPrev);
audio.addEventListener("ended", playNext);
timeline.addEventListener("click", changeTimeline);
volumeButton.addEventListener("click", changeMute);
volumeSLider.addEventListener("click", changeVolume);

// TRANSLATION

function activateLanguage() {
  languageItem.forEach((item) => item.classList.remove("language-active"));
  if (state.language === "en") enLang.classList.add("language-active");
  else if (state.language === "ru") ruLang.classList.add("language-active");
  showDate();
  showGreeting();
  translateDefault();
  translateSettings();
  getWeather();
  getQuotes();
}

function translateDefault() {
  if (state.language === "en") {
    name.placeholder = "[Enter name]";
    if (city.value === "Киев") city.value = "Kyiv";
  } else if (state.language === "ru") {
    name.placeholder = "[Введите имя]";
    if (city.value === "Kyiv") city.value = "Киев";
  }
  html.lang = state.language;
}

const html = document.querySelector("html");
const languageItem = document.querySelectorAll(".language-item");
const enLang = document.querySelector(".en");
const ruLang = document.querySelector(".ru");

languageItem.forEach((item) => {
  item.addEventListener("click", () => {
    if (item.classList.contains("en")) state.language = "en";
    else if (item.classList.contains("ru")) state.language = "ru";
    activateLanguage();
  });
});

window.addEventListener("load", activateLanguage);

// API IMAGE

function getRandomImage(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function getImageFromUnsplash() {
  const url = `https://api.unsplash.com/photos/random?orientation=landscape&query=${state.queries}&client_id=cHSd9g0M3SoUmQtpjxNAPe1UFNAu-FeqBpKbfn36LTc`;
  const res = await fetch(url);
  const data = await res.json();
  return data.urls.regular;
}

async function getImageFromFlickr() {
  const url = `https://www.flickr.com/services/rest/?method=flickr.photos.search&api_key=130f924b1be46c963ec5ab0b769a7b87&tags=${state.queries}&sort=interestingness-desc&extras=url_h&format=json&nojsoncallback=1`;
  const res = await fetch(url);
  const data = await res.json();
  const randomImage = getRandomImage(0, data.photos.photo.length - 1);
  if ("url_h" in data.photos.photo[randomImage]) {
    return data.photos.photo[randomImage].url_h;
  } else {
    await setBg();
  }
}

function activateBackground() {
  apiItem.forEach((item) => item.classList.remove("api-active"));
  if (state.photoSource === "github") {
    apiDefault.classList.add("api-active");
    queriesBlock.classList.add("deactivate");
    settingsThemes.classList.add("deactivate");
  } else if (state.photoSource === "unsplash") {
    apiUnsplash.classList.add("api-active");
    queriesBlock.classList.remove("deactivate");
    settingsThemes.classList.remove("deactivate");
  } else if (state.photoSource === "flickr") {
    apiFlickr.classList.add("api-active");
    queriesBlock.classList.remove("deactivate");
    settingsThemes.classList.remove("deactivate");
  }
}

const queriesBlock = document.querySelector(".queries");
const apiItem = document.querySelectorAll(".api-item");
const apiDefault = document.querySelector(".api-default");
const apiUnsplash = document.querySelector(".api-unsplash");
const apiFlickr = document.querySelector(".api-flickr");

apiItem.forEach((item) => {
  item.addEventListener("click", () => {
    if (item.classList.contains("api-default")) state.photoSource = "github";
    else if (item.classList.contains("api-unsplash"))
      state.photoSource = "unsplash";
    else if (item.classList.contains("api-flickr"))
      state.photoSource = "flickr";
    activateBackground();
    setBg();
  });
});

window.addEventListener("load", activateBackground);

// API QUERIES

function changeQuery() {
  queries.forEach((item) => item.classList.remove("query-active"));
  switch (state.queries) {
    case "nature":
      nature.classList.add("query-active");
      break;
    case "animals":
      animals.classList.add("query-active");
      break;
    case "space":
      space.classList.add("query-active");
      break;
    case "architecture":
      architecture.classList.add("query-active");
      break;
    case "art":
      art.classList.add("query-active");
      break;
    case "cars":
      cars.classList.add("query-active");
      break;
    case "extreme":
      extreme.classList.add("query-active");
      break;
    case "videogames":
      videogames.classList.add("query-active");
      break;
    case "horror":
      horror.classList.add("query-active");
      break;
    case "abstraction":
      abstraction.classList.add("query-active");
      break;
  }
  setBg();
}

const queries = document.querySelectorAll(".queries-item");
const nature = document.querySelector(".query-nature");
const animals = document.querySelector(".query-animals");
const space = document.querySelector(".query-space");
const architecture = document.querySelector(".query-architecture");
const art = document.querySelector(".query-art");
const cars = document.querySelector(".query-cars");
const extreme = document.querySelector(".query-extreme");
const videogames = document.querySelector(".query-videogames");
const horror = document.querySelector(".query-horror");
const abstraction = document.querySelector(".query-abstraction");

queries.forEach((item) => {
  item.addEventListener("click", () => {
    if (item.classList.contains("query-nature")) state.queries = "nature";
    else if (item.classList.contains("query-animals"))
      state.queries = "animals";
    else if (item.classList.contains("query-space")) state.queries = "space";
    else if (item.classList.contains("query-architecture"))
      state.queries = "architecture";
    else if (item.classList.contains("query-art")) state.queries = "art";
    else if (item.classList.contains("query-cars")) state.queries = "cars";
    else if (item.classList.contains("query-extreme"))
      state.queries = "extreme";
    else if (item.classList.contains("query-videogames"))
      state.queries = "videogames";
    else if (item.classList.contains("query-horror")) state.queries = "horror";
    else if (item.classList.contains("query-abstraction"))
      state.queries = "abstraction";
    changeQuery();
  });
});

window.addEventListener("load", changeQuery);

// TODO

function changeTodoList() {
  todoList.innerHTML = "";

  state.todo.forEach((item, index) => {
    const elem = document.createElement("div");
    const done = document.createElement("div");
    const text = document.createElement("div");
    const del = document.createElement("div");
    elem.classList.add("todo-item");
    done.classList.add("todo-done");
    text.classList.add("todo-text");
    del.classList.add("todo-del");
    text.innerHTML = item;
    elem.append(done);
    elem.append(text);
    elem.append(del);
    todoList.append(elem);

    if (state.todoDone.includes(item)) {
      text.classList.add("todo-text-deactivate");
      done.classList.add("todo-return");
    }

    done.addEventListener("click", () => {
      if (!text.classList.contains("todo-text-deactivate")) {
        text.classList.add("todo-text-deactivate");
        done.classList.add("todo-return");
        state.todoDone.push(item);
      } else {
        text.classList.remove("todo-text-deactivate");
        done.classList.remove("todo-return");
        state.todoDone.splice(state.todoDone.indexOf(item), 1);
      }
    });
    del.addEventListener("click", () => {
      state.todo.splice(index, 1);
      if (state.todoDone.includes(item)) {
        state.todoDone.splice(state.todoDone.indexOf(item), 1);
      }
      changeTodoList();
    });
    todoScrollEnd();
  });
}

function todoScrollEnd() {
  todoListWrapper.scrollTop = todoListWrapper.scrollHeight;
}

function compareValues(value) {
  while (state.todo.includes(value)) {
    value += "&#8203;";
  }
  return value;
}

const todoSection = document.querySelector(".todo-section");
const todoListWrapper = document.querySelector(".todo-list-wrapper");
const todoList = document.querySelector(".todo-list");
const todoInput = document.querySelector(".todo-input");

changeTodoList();
window.addEventListener("load", changeTodoList);
window.addEventListener("load", () => {
  todoInput.addEventListener("change", () => {
    todoInput.value = compareValues(todoInput.value);
    state.todo.push(todoInput.value);
    changeTodoList();
    todoInput.value = "";
  });
});

// SETTINGS

function showSetings() {
  if (!settingsBlock.classList.contains("settings-active")) {
    settingsBlock.classList.add("settings-active");
    rotateElement(settingsGear);
  } else {
    settingsBlock.classList.remove("settings-active");
    oppositeRotateElement(settingsGear);
  }
}

function oppositeRotateElement(elem) {
  elem.style.transition = "0.3s";
  elem.style.transform = "rotate(-180deg)";
  setTimeout(() => {
    elem.style.transition = "none";
    elem.style.transform = "";
  }, 300);
}

function visibilityOfSections() {
  if (state.blocks.includes("time")) {
    timeSection.classList.remove("section-deactive");
  } else {
    timeSection.classList.add("section-deactive");
  }
  if (state.blocks.includes("date")) {
    dateSection.classList.remove("section-deactive");
  } else {
    dateSection.classList.add("section-deactive");
  }
  if (state.blocks.includes("greeting")) {
    greetingSection.classList.remove("section-deactive");
    name.classList.remove("section-deactive");
  } else {
    greetingSection.classList.add("section-deactive");
    name.classList.add("section-deactive");
  }
  if (state.blocks.includes("quote")) {
    quotesBlock.classList.remove("section-deactive");
    changeQuote.classList.remove("section-deactive");
  } else {
    quotesBlock.classList.add("section-deactive");
    changeQuote.classList.add("section-deactive");
  }
  if (state.blocks.includes("weather")) {
    weatherSection.classList.remove("section-deactive");
  } else {
    weatherSection.classList.add("section-deactive");
  }
  if (state.blocks.includes("audio")) {
    player.classList.remove("section-deactive");
  } else {
    player.classList.add("section-deactive");
    if (isPlay) {
      playAudio();
    }
  }
  if (state.blocks.includes("todolist")) {
    todoSection.classList.remove("section-deactive");
  } else {
    todoSection.classList.add("section-deactive");
  }
  checkItems();
}

function checkItems() {
  settingsChecks.forEach((item) => {
    if (state.blocks.includes(item.name)) {
      item.checked = true;
      item.classList.remove("checkbox-deactive");
    } else {
      item.checked = false;
      item.classList.add("checkbox-deactive");
    }
  });
}

function translateSettings() {
  if (state.language === "en") {
    settingsLanguage.textContent = "Language";
    settingsSource.textContent = "Background source";
    settingsThemes.textContent = "Background themes";
    settingsSections.textContent = "Active sections";
    enLang.textContent = "English";
    ruLang.textContent = "Russian";
    apiDefault.textContent = "Default";
    nature.textContent = "Nature";
    animals.textContent = "Animals";
    space.textContent = "Space";
    architecture.textContent = "Architecture";
    art.textContent = "Art";
    cars.textContent = "Cars";
    extreme.textContent = "Extreme";
    videogames.textContent = "Videogames";
    horror.textContent = "Horror";
    abstraction.textContent = "Abstraction";
    settingsTime.textContent = "Time";
    settingsDate.textContent = "Date";
    settingsGreeting.textContent = "Greeting";
    settingsQuotes.textContent = "Quotes";
    settingsWeather.textContent = "Weather";
    settingsAudio.textContent = "Audio";
    settingsTodo.textContent = "ToDo list";
  } else if (state.language === "ru") {
    settingsLanguage.textContent = "Язык";
    settingsSource.textContent = "Источник фона";
    settingsThemes.textContent = "Тематика фона";
    settingsSections.textContent = "Активные секции";
    enLang.textContent = "Английский";
    ruLang.textContent = "Русский";
    apiDefault.textContent = "По умолчанию";
    nature.textContent = "Природа";
    animals.textContent = "Животные";
    space.textContent = "Космос";
    architecture.textContent = "Архитектура";
    art.textContent = "Искусство";
    cars.textContent = "Автомобили";
    extreme.textContent = "Экстрим";
    videogames.textContent = "Видеоигры";
    horror.textContent = "Хоррор";
    abstraction.textContent = "Абстракция";
    settingsTime.textContent = "Время";
    settingsDate.textContent = "Дата";
    settingsGreeting.textContent = "Приветствие";
    settingsQuotes.textContent = "Цитаты";
    settingsWeather.textContent = "Погода";
    settingsAudio.textContent = "Аудио";
    settingsTodo.textContent = "Задачи";
  }
}

const settingsBlock = document.querySelector(".settings");
const settingsGear = document.querySelector(".settings-gear");
const settingsChecks = document.querySelectorAll(".checkbox");
const settingsLanguage = document.querySelector(".settings-language");
const settingsSource = document.querySelector(".settings-source");
const settingsThemes = document.querySelector(".settings-themes");
const settingsSections = document.querySelector(".settings-auxiliary-name");
const settingsTime = document.querySelector(".settings-time");
const settingsDate = document.querySelector(".settings-date");
const settingsGreeting = document.querySelector(".settings-greeting");
const settingsQuotes = document.querySelector(".settings-quotes");
const settingsWeather = document.querySelector(".settings-weather");
const settingsAudio = document.querySelector(".settings-audio");
const settingsTodo = document.querySelector(".settings-todo");

settingsGear.addEventListener("click", showSetings);

window.addEventListener("click", (outsideClick) => {
  const target = outsideClick.target;
  if (!target.closest(".settings") && !target.closest(".settings-gear")) {
    if (settingsBlock.classList.contains("settings-active")) {
      oppositeRotateElement(settingsGear);
    }
    settingsBlock.classList.remove("settings-active");
  }
});

window.addEventListener("load", visibilityOfSections);
window.addEventListener("load", () => {
  settingsChecks.forEach((item) => {
    item.addEventListener("click", () => {
      if (!item.checked) {
        state.blocks.splice(state.blocks.indexOf(item.name), 1);
      } else {
        state.blocks.push(item.name);
      }
      visibilityOfSections();
    });
  });
});
