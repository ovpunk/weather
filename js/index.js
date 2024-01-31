const API_KEY = "678132e53e6a4ab1b73121541230611";
const $header = document.querySelector(".header");
const $info = document.querySelector(".info");
const $mainInner = document.querySelector(".main__inner");
const $form = document.querySelector("#form");
const $input = document.querySelector(".search");
const $weather = document.querySelector(".weather");
const $indicators = document.querySelector(".indicators");
const $weatherToday = document.querySelector(".weather-today__list");
const $weatherWeek = document.querySelector(".weather-week__list");
const $bgImg = document.querySelector(".bg-img");
const $searchResult = document.querySelector(".search-result");
const $searchResultList = document.querySelector(".search-result__list");

const currentTime = new Date().getTime() / 1000;

//затемнение хедера
$mainInner.addEventListener("scroll", () => {
  let scrollMainTop = $mainInner.scrollTop;
  if (scrollMainTop > 0) {
    $header.classList.add("header-scroll");
  } else {
    $header.classList.remove("header-scroll");
  }
});
//затемнение хедера при меньшем экране
$info.addEventListener("scroll", () => {
  let scrollInfoTop = $info.scrollTop;
  if (scrollInfoTop > 0) {
    $header.classList.add("header-scroll");
  } else {
    $header.classList.remove("header-scroll");
  }
});

//фильтрация прошедших часов
const filterHours = (data) => {
  const hours = data.forecast.forecastday[0].hour;
  return hours.filter((item) => item.time_epoch >= currentTime);
};

const generateBackground = (data) => {
  const weatherDescription = data.current.condition.text;
  const imgSrc = `url(images/${imgValue[weatherDescription]}.jpg)`;
  $bgImg.style.backgroundImage = imgSrc;
};
const generateWeather = (data) => {
  const weatherDescription = data.current.condition.text;
  const imgSrc = `images/${imgValue[weatherDescription]}.svg`;
  return `
      <div class="weather-wrapper">
         <p class="weather__value">${Math.ceil(data.current.temp_c)}°</p>
          <div class="weather__data">
            <p class="weather__data-city">${data.location.name}</p>
            <p class="weather__data-date">${data.location.localtime}</p>
          </div>
         <img src=${imgSrc} alt="" class="weather__img">
      </div>
      `;
};

const generateIndicators = (data) => {
  return `
  <p class="indicators__description">${data.current.condition.text}</p>
  <ul class="indicators__list">
    <li class="indicators__list-item">
      <p>Temp max</p>
      <div>
        <span>${Math.ceil(data.forecast.forecastday[0].day.maxtemp_c)}°</span>
        <img src="/images/max-temp.svg" alt="" class="indicators__img">
      </div>
    </li>
    <li class="indicators__list-item">
      <p>Temp min</p>
      <div>
        <span>${Math.ceil(data.forecast.forecastday[0].day.mintemp_c)}°</span>
        <img src="/images/min-temp.svg" alt="" class="indicators__img">
      </div>
    </li>
    <li class="indicators__list-item">
     <p>Humidity</p>
      <div>
        <span>${data.current.humidity}%</span>
        <img src="/images/humidity.svg" alt="" class="indicators__img">
      </div>
    </li>
    <li class="indicators__list-item">
      <p>Cloudy</p>
      <div>
        <span>${data.current.cloud}%</span>
        <img src="/images/cloud.svg" alt="" class="indicators__img">
      </div>
    </li>
    <li class="indicators__list-item">
      <p>Wind</p>
      <div>
        <span>${data.current.wind_kph}km/h</span>
        <img src="/images/wind.svg" alt="" class="indicators__img">
      </div>
    </li>
  </ul>
  `;
};
//Иконки и фон по результату запроса
const imgValue = {
  "Patchy rain possible": "patchyrain",
  "Light rain shower": "patchyrain",
  "Light drizzle": "patchyrain",
  "Light rain": "patchyrain",
  Overcast: "cloud",
  Snow: "snow",
  Clear: "clear",
  "Partly Cloudy": "cloud",
  Mist: "mist",
  "Freezing fog": "mist",
  Fog: "mist",
  Cloudy: "cloud",
  "Light snow": "snow",
  "Light snow showers": "snow",
  "Light freezing rain": "patchyrain",
  "Light sleet": "snow",
  Sunny: "clear",
  "Moderate rain": "patchyrain",
  "Moderate or heavy rain with thunder": "rainthunder",
  "Patchy light drizzle": "patchyrain",
  "Patchy rain nearby": "patchyrain",
  "Heavy rain": "patchyrain",
  "Moderate snow": "snow",
  "Heavy snow": "snow",
  Blizzard: "blizzard",
  "Moderate or heavy snow showers": "snow",
};

const generateWeatherForDay = (data) => {
  const remainingHours = filterHours(data);
  const generatedHTML = remainingHours.map((hour) => {
    const weatherDescription = hour.condition.text.trim();
    const imgSrc = `images/${imgValue[weatherDescription]}.svg`;
    return `
    <li class="weather-today__item">
      <div class="item-left">
        <img src=${imgSrc} alt="" style="width: 40px"
        >
        <div class="weather-today__info">
          <p>${hour.time.slice(-5)}</p>
          <span>${weatherDescription}</span>
        </div>
      </div>
      <span class="item-right">${Math.ceil(hour.temp_c)}°</span>
    </li>
  `;
  });
  return generatedHTML.join("");
};

const generateWeatherForWeek = (data) => {
  const generatedHTML = data.forecast.forecastday.map((day) => {
    const weatherDescription = day.day.condition.text.trim();
    const imgSrc = `images/${imgValue[weatherDescription]}.svg`;
    const date = new Date(day.date);
    const options = { weekday: "long" };
    const dayOfWeek = new Intl.DateTimeFormat("en-US", options).format(date);
    return `
    <li class="weather-today__item">
      <div class="item-left">
        <img src=${imgSrc} alt="" style="width: 40px"
        >
        <div class="weather-today__info">
          <p>${dayOfWeek}</p>
          <span>${weatherDescription}</span>
        </div>
      </div>
      <span class="item-right">${Math.ceil(day.day.avgtemp_c)}°</span>
    </li>
  `;
  });
  return generatedHTML.join("");
};

//Найти город по ip
const getMyCity = async () => {
  const res = await fetch("https://ipapi.co/json/");
  if (res.ok) {
    const responce = await res.json();
    const city = responce.city;
    return city;
  } else {
    return "Moscow";
  }
};

let myCity;
let onSearch = false;
//Запрос на получение погоды в городе
const initialCity = async () => {
  const savedCity = localStorage.getItem("location");
  if (!savedCity) {
    myCity = await getMyCity();
  } else if (myCity !== savedCity && onSearch) {
    myCity = myCity;
  } else {
    myCity = savedCity;
  }

  const cityFetch = `http://api.weatherapi.com/v1/forecast.json?key=678132e53e6a4ab1b73121541230611&q=${myCity}&days=7`;
  fetch(cityFetch)
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      localStorage.setItem("location", `${data.location.name}`);
      localStorage.setItem("description", `${data.current.condition.text}`);
      $weather.innerHTML = generateWeather(data);
      $indicators.innerHTML = generateIndicators(data);
      $weatherToday.innerHTML = generateWeatherForDay(data);
      $weatherWeek.innerHTML = generateWeatherForWeek(data);
      generateBackground(data);
    });
};
initialCity();

//Обновление начальных данных каждые пол минуты
setInterval(() => {
  initialCity();
}, 30000);

//Создание списка городов при поиске
const generateSearchResult = (data) => {
  const generatedHTML = data.map((el) => {
    return `<li class="search-result__item" >${el.name}, ${el.country}</li>`;
  });
  return generatedHTML.join("");
};

let typingTimer; // Переменная для хранения таймера
//функция поиска городов
const debounce = () => {
  const inputValue = $input.value;
  clearTimeout(typingTimer);
  if (inputValue.trim() !== "") {
    typingTimer = setTimeout(() => {
      fetch(
        `http://api.weatherapi.com/v1/search.json?key=678132e53e6a4ab1b73121541230611&q=${inputValue}`
      )
        .then((res) => {
          return res.json();
        })
        .then((data) => {
          chooseCity(data);
          // Если есть текст, делаем элемент видимым
          if (data.length > 0) {
            $searchResult.style.display = "block";
          } else {
            $searchResult.style.display = "none";
          }
        });
    }, 400);
  }
};

$input.addEventListener("input", debounce);
// функция выбора города
const chooseCity = (data) => {
  $searchResultList.innerHTML = generateSearchResult(data);
  const $searchResultItem = document.querySelectorAll(".search-result__item");
  $searchResultItem.forEach((el) => {
    el.addEventListener("click", () => {
      myCity = el.innerText.split(",")[0];
      onSearch = true;
      $input.value = "";
      $searchResult.style.display = "none";
      flag = true;
      initialCity();
    });
  });
};
