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
    const cityName = event.target.value;
    const newCity = cities.find((city) => city.name === cityName);

    if (newCity) {
      setSelectedCity(newCity);
      chrome.storage.sync.set({ city: newCity });
    }
  };

  return (
    <main style={{ padding: "10px", minWidth: "300px" }}>
      <h1 style={{ fontSize: "18px", marginBottom: "10px", marginTop: 0 }}>
        Select a city for weather updates
      </h1>
      <select
        onChange={handleCityChange}
        value={selectedCity.name}
        style={{
          width: "100%",
          padding: "5px",
          borderRadius: "5px",
          border: "1px solid #ccc",
          fontSize: "16px",
        }}
      >
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
