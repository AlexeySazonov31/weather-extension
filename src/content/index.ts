chrome.storage.sync.get("city", (result) => {
  const selectedCity = result.city || "Minsk";
  const headlines = document.querySelectorAll(".title");

  headlines.forEach((headline) => {
    const icon = document.createElement("img");
    icon.src = "https://utfs.io/f/b4a9acc9-e6c8-4c5a-8a8b-2ed969bd2497-r3nmzi.png";

    icon.style.width = "25px";
    icon.style.height = "25px";
    icon.style.cursor = "pointer";
    icon.style.position = "inline-block";
    icon.style.float = "right";

    icon.addEventListener("click", async (e) => {
      e.preventDefault();
      try {
        const weatherData = await fetchWeather(selectedCity);
        alert(`Weather in ${selectedCity}: ${weatherData}`);
      } catch (error: any) {
        alert(`Error fetching weather data: ${error.message}  Please try again later.`);
      }
    });

    headline.prepend(icon);
  });
});

async function fetchWeather(city: string) {
  const apiKey = "8c56d8ce8318f21fe5bfcecef27c9df5";
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=56&lon=25&appid=${apiKey}`
  );
  const data = await response.json();
  return data.weather[0].description;
}
