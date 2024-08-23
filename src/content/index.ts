interface City {
  name: string;
  location: {
    lat: number;
    lng: number;
  };
}

const WEATHER_API_KEY: string = "8c56d8ce8318f21fe5bfcecef27c9df5"; // публично, так как это общедоступный url (бесплатный ключ api)

let activeCity: City | undefined;
let activePopup: HTMLElement | null = null;
let activeIcon: HTMLElement | null = null;
let eventListenersAttached: HTMLElement[] = [];

// Создаем попап с прогнозом
function createPopup(icon: HTMLElement, weatherData: string): HTMLElement {
  const popup = document.createElement("div");
  popup.classList.add("weather-popup");
  popup.innerHTML = weatherData;

  const iconRect = icon.getBoundingClientRect();
  const rightSpace = window.innerWidth - iconRect.right;
  const popupWidth = 160;

  popup.style.position = "absolute";
  popup.style.left =
    rightSpace > popupWidth
      ? `${iconRect.left + window.scrollX}px`
      : `${iconRect.right + window.scrollX - popupWidth}px`;
  popup.style.top = `${iconRect.bottom + window.scrollY + 8}px`;

  document.body.appendChild(popup);

  requestAnimationFrame(() => {
    popup.classList.add("show");
  });

  const handleClickOutside = (e: MouseEvent) => {
    if (
      activePopup &&
      !activePopup.contains(e.target as Node) &&
      !icon.contains(e.target as Node)
    ) {
      removeActivePopup(() => {});
      document.removeEventListener("click", handleClickOutside);
    }
  };

  document.addEventListener("click", handleClickOutside);

  return popup;
}

// ремуваем активный попап
function removeActivePopup(callback: () => void) {
  if (activePopup) {
    activePopup.classList.remove("show");
    setTimeout(() => {
      if (activePopup && activePopup.parentNode) {
        activePopup.parentNode.removeChild(activePopup);
      }
      activePopup = null;
      activeIcon = null;
      callback();
    }, 300);
  } else {
    callback();
  }
}

// Открываем/закрываем попап с прогнозом
function togglePopup(icon: HTMLElement, city: City): void {
  icon.addEventListener("click", async (e: MouseEvent) => {
    e.preventDefault();

    if (activePopup && activeIcon === icon) {
      removeActivePopup(() => {});
      return;
    }

    removeActivePopup(async () => {
      try {
        const weatherData = await getWeather(city);
        activePopup = createPopup(icon, `Weather in ${city.name}: <br/>${weatherData}`);
        activeIcon = icon;
      } catch (error: any) {
        activePopup = createPopup(icon, `Error fetching weather data: ${error.message}`);
        activeIcon = icon;
      }
    });
  });

  eventListenersAttached.push(icon);
}

// Вешаем обработчики на иконки
function observeContent() {
  const titles = document.querySelectorAll("article .title");
  const h1s = document.querySelectorAll("article h1");

  const headlines = [...titles, ...h1s];

  headlines.forEach((headline) => {
    let icon = headline.querySelector(".weather-icon") as HTMLImageElement;

    if (!icon) {
      icon = document.createElement("img");
      icon.src = "https://utfs.io/f/b4a9acc9-e6c8-4c5a-8a8b-2ed969bd2497-r3nmzi.png";
      icon.classList.add("weather-icon");
      headline.prepend(icon);
    }

    togglePopup(icon, activeCity!);
  });
}

// ремуваем старые обработчики
function cleanupOldListeners() {
  eventListenersAttached.forEach((icon) => {
    const clonedIcon = icon.cloneNode(true) as HTMLElement;
    icon.replaceWith(clonedIcon);
  });

  eventListenersAttached = [];
}

// инициализация
function init() {
  cleanupOldListeners();
  observeContent();
}

// ! TODO: как отлавливать react маршрутизацию приложения или там что-то другое?
function handlePageLoadAndNavigation() {
  window.addEventListener("load", init);

  const root = document.getElementById("root");
  if (root) {
    const observer = new MutationObserver(() => {
      init();
    });

    observer.observe(root, { childList: true, subtree: true });
  }

  let lastUrl = location.href;
  setInterval(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      init();
    }
  }, 1000);
}

document.addEventListener("DOMContentLoaded", () => {
  init();
  handlePageLoadAndNavigation();
});

chrome.storage.sync.get("city", (result: { [key: string]: any }) => {
  activeCity = result.city || {
    name: "Minsk",
    location: {
      lat: 53.906184,
      lng: 27.555353,
    },
  };
  init();
});

chrome.storage.onChanged.addListener((changes: { [key: string]: chrome.storage.StorageChange }) => {
  if (changes.city) {
    activeCity = changes.city.newValue as City;
    removeActivePopup(() => {
      init();
    });
  }
});

// запрашиваем данные о погоде
async function getWeather(city: City): Promise<string> {
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${city.location.lat}&lon=${city.location.lng}&appid=${WEATHER_API_KEY}&units=metric`
  );
  const data = await response.json();

  if (!data.weather || !data.main) {
    throw new Error("Invalid response from weather API.");
  }

  return `${data.weather[0].description}, ${data.main.temp}°C`;
}
