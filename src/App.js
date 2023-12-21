import { useEffect, useState } from "react";

const weeks = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function App() {
  const [city, setCity] = useState("");
  const [dataWeather, setDataWeather] = useState({});
  const [icon, setIcon] = useState("02d");

  function getDayOfWeek(date) {
    return weeks[new Date(date).getDay()];
  }

  useEffect(
    function () {
      if (city.length < 2) return;

      const controller = new AbortController();

      async function fetchWeather() {
        try {
          const res = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?q=${city}&APPID=6557810176c36fac5f0db536711a6c52`,
            { signal: controller.signal }
          );
          if (!res.ok)
            throw new Error(` Data Fetching went wrong ${res.message} `);
          const data = await res.json();

          const dataFilter = data.list.filter(
            (data) =>
              data.sys.pod === "d" &&
              data.dt_txt.includes("12:00:00") &&
              new Date().getDate() !== new Date(data.dt_txt).getDate()
          );

          setDataWeather((dataWeather) => ({
            ...dataWeather,
            date: data.list.at(0).dt_txt,
            city: data.city.name,
            temp: Math.floor(data.list.at(0).main.temp - 273.15),
            weatherDesc: data.list.at(0).weather.at(0).description,
            dataWeatherFilter: [...dataFilter].slice(0, 4),
          }));
          setIcon((icon) => data.list.at(0).weather.at(0).icon);
        } catch (err) {
          if (err.name !== "AbortError") {
            console.error(err);
          }
        }
      }
      fetchWeather();

      return function () {
        controller.abort();
      };
    },
    [city]
  );

  return (
    <div className="App">
      <div className="info">
        <img className="icon" src={`images/${icon}.svg`} alt="img not found" />
        {dataWeather.date ? (
          <WeatherInfo dataWeather={dataWeather} />
        ) : (
          <span>Weather Forecast</span>
        )}
      </div>

      <input
        className={dataWeather.date ? "input" : ""}
        type="text"
        placeholder="Enter a city"
        value={city}
        onChange={(e) => setCity(e.target.value)}
      />

      <div className="weather-box-parent">
        {dataWeather.dataWeatherFilter &&
          dataWeather.dataWeatherFilter.map((data) => (
            <WeatherBox data={data} getDayOfWeek={getDayOfWeek} key={data.dt} />
          ))}
      </div>
    </div>
  );
}

function WeatherInfo({ dataWeather }) {
  console.log(dataWeather);

  return (
    <div>
      <p>Today</p>
      <p className="city">{dataWeather.city}</p>
      <p>Temperature: {dataWeather.temp}°C</p>
      <p>{dataWeather.weatherDesc}</p>
    </div>
  );
}

function WeatherBox({ data, getDayOfWeek }) {
  return (
    <div className="weather-box">
      <span>{getDayOfWeek(data.dt_txt)}</span>
      <img
        className="icon-small"
        src={`images/${data.weather.at(0).icon}.svg`}
        alt="img not found"
      />
      <span>{Math.floor(data.main.temp - 273.15)}°C</span>
    </div>
  );
}

export default App;
