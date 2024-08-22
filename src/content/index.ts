interface City {
  name: string;
  location: {
    lat: number;
    lng: number;
  };
}

const WEATHER_API_KEY: string = "8c56d8ce8318f21fe5bfcecef27c9df5"; // don't use .env because it's public in url, but we can setting config.ts file

let activeCity: City | undefined;
let activePopup: HTMLElement | null = null;
let activeIcon: HTMLElement | null = null;

function createPopup(icon: HTMLElement, weatherData: string): HTMLElement {
  const popup = document.createElement("div");
  popup.classList.add("weather-popup");
  popup.textContent = weatherData;
  popup.style.position = "absolute";
  popup.style.backgroundColor = "#fff";
  popup.style.border = "1px solid #ccc";
  popup.style.padding = "8px";
  popup.style.boxShadow = "0px 4px 8px rgba(0, 0, 0, 0.1)";
  popup.style.zIndex = "1000";

  const iconRect = icon.getBoundingClientRect();
  const rightSpace = window.innerWidth - iconRect.right;
  const popupWidth = 160;

  if (rightSpace > popupWidth) {
    popup.style.left = `${iconRect.left + window.scrollX}px`;
  } else {
    popup.style.left = `${iconRect.right + window.scrollX - popupWidth}px`;
  }

  popup.style.top = `${iconRect.bottom + window.scrollY + 8}px`;

  document.body.appendChild(popup);

  return popup;
}

function removeActivePopup() {
  if (activePopup) {
    activePopup.remove();
    activePopup = null;
    activeIcon = null;
  }
}

function togglePopup(icon: HTMLElement, city: City): void {
  icon.addEventListener("click", async (e: MouseEvent) => {
    e.preventDefault();

    if (activePopup && activeIcon === icon) {
      removeActivePopup();
      return;
    }

    removeActivePopup();

    try {
      const weatherData = await getWeather(city);
      activePopup = createPopup(icon, `Weather in ${city.name}: ${weatherData}`);
      activeIcon = icon;
    } catch (error: any) {
      activePopup = createPopup(icon, `Error fetching weather data: ${error.message}`);
      activeIcon = icon;
    }
  });
}

document.addEventListener("click", (e: MouseEvent) => {
  if (
    activePopup &&
    activeIcon &&
    !activePopup.contains(e.target as Node) &&
    e.target !== activeIcon
  ) {
    removeActivePopup();
  }
});

chrome.storage.sync.get("city", (result: { [key: string]: any }) => {
  activeCity = result.city || {
    name: "Minsk",
    location: {
      lat: 53.906184,
      lng: 27.555353,
    },
  };

  const headlines = document.querySelectorAll("article .title");

  headlines.forEach((headline) => {
    let icon = headline.querySelector(".weather-icon") as HTMLImageElement;
    if (!icon) {
      icon = document.createElement("img");
      icon.src = "https://utfs.io/f/b4a9acc9-e6c8-4c5a-8a8b-2ed969bd2497-r3nmzi.png";
      icon.classList.add("weather-icon");
      icon.style.width = "25px";
      icon.style.height = "25px";
      icon.style.cursor = "pointer";
      icon.style.float = "right";
      icon.style.marginLeft = "7px";
      icon.style.marginBottom = "7px";
      headline.prepend(icon);
    }
    togglePopup(icon, activeCity!);
  });
});

chrome.storage.onChanged.addListener((changes: { [key: string]: chrome.storage.StorageChange }) => {
  if (changes.city) {
    activeCity = changes.city.newValue as City;
    const headlines = document.querySelectorAll(".title");
    headlines.forEach((headline) => {
      const icon = headline.querySelector(".weather-icon") as HTMLElement;
      if (icon) {
        const newIcon = icon.cloneNode(true) as HTMLElement;
        icon.replaceWith(newIcon);
        togglePopup(newIcon, activeCity!);
      }
    });
  }
});

async function getWeather(city: City): Promise<string> {
  if (!WEATHER_API_KEY) {
    throw new Error("API key is missing.");
  }

  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${city.location.lat}&lon=${city.location.lng}&appid=${WEATHER_API_KEY}&units=metric`
  );
  const data = await response.json();

  if (!data.weather || !data.main) {
    throw new Error("Invalid response from weather API.");
  }

  return `${data.weather[0].description}, ${data.main.temp}°C`;
}
