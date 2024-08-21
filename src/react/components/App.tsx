import { useEffect, useState } from "react";

const cities = ["Minsk", "Brest", "Grodno"];

const App = () => {
  const [selectedCity, setSelectedCity] = useState(cities[0]);

  useEffect(() => {
    chrome.storage.sync.get("city", (result) => {
      if (result.city) {
        setSelectedCity(result.city);
      }
    });
  }, []);

  const handleCityChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCity(event.target.value);
    chrome.storage.sync.set({ city: event.target.value });
  };

  return (
    <main>
      <h1>Select a city for weather updates</h1>
      <select onChange={handleCityChange} value={selectedCity}>
        {cities.map((city) => (
          <option key={city} value={city}>
            {city}
          </option>
        ))}
      </select>
    </main>
  );
};

export default App;
