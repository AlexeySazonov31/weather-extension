import { useEffect, useState } from "react";

const cities = [
  { name: "Minsk", location: { lat: 53.906184, lng: 27.555353 } },
  { name: "Brest", location: { lat: 52.093143, lng: 23.687962 } },
  { name: "Grodno", location: { lat: 53.679092, lng: 23.833543 } },
];

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
    const newSelectedCity = cities.find((city) => city.name === event.target.value);
    if (newSelectedCity) {
      setSelectedCity(newSelectedCity);
      chrome.storage.sync.set({ city: newSelectedCity });
    }
  };

  return (
    <main>
      <h1>Select a city for weather updates</h1>
      <select onChange={handleCityChange} value={selectedCity.name}>
        {cities.map((city) => (
          <option key={city.name} value={city.name}>
            {city.name}
          </option>
        ))}
      </select>
    </main>
  );
};

export default App;
