import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './custom.scss';

function WeatherApp() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [showForecast, setShowForecast] = useState(false);

  const apiKey = '15cee790381c1c7ce2a1e6686c6a1c25'; 

  const weatherBackgrounds = {
    'clear sky': 'url(/weather-app/assets/clear.png)',
    'few clouds': 'url(/weather-app/assets/few-clouds.png)',
    'scattered clouds': 'url(/weather-app/assets/scattered-clouds.png)',
    'broken clouds': 'url(/weather-app/assets/broken-clouds.png)',
    'overcast clouds': 'url(/weather-app/assets/overcast-clouds.png)',
    'light rain': 'url(/weather-app/assets/light-rain.png)',
    'moderate rain': 'url(/weather-app/assets/moderate-rain.png)',
    'heavy intensity rain': 'url(/weather-app/assets/heavy-rain.png)',
    'very heavy rain': 'url(/weather-app/assets/heavy-rain.png)',
    'snow': 'url(/weather-app/assets/moderate-snow.png)',
    'light snow': 'url(/weather-app/assets/light-snow.png)',
    'moderate snow': 'url(/weather-app/assets/moderate-snow.png)',
    'heavy intensity snow': 'url(/weather-app/assets/heavy-snow.png)',
    'thunderstorm': 'url(/weather-app/assets/thunderstorm.png)',
    'light drizzle': 'url(/weather-app/assets/drizzle.png)',
    'mist': 'url(/weather-app/assets/mist.png)',
    'haze': 'url(/weather-app/assets/haze.png)',
    'fog': 'url(/weather-app/assets/fog.png)',
    'smoke': 'url(/weather-app/assets/smoke.png)',
  };

  const fetchWeather = async () => {
    if (!city) {
      setError(<div className='bg-danger-subtle'>Please enter a city name.</div>);
      return;
    }

    setError(null);
    setLoading(true);
    setShowMap(false);
    setShowForecast(false);

    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`
      );
      if (!response.ok) throw new Error('City not found.');

      const data = await response.json();
      setWeather(data);

      const weatherCondition = data.weather[0].description.toLowerCase();
      document.body.style.backgroundImage =
        weatherBackgrounds[weatherCondition] || 'url(/assets/weather.png)';

      const forecastResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`
      );
      const forecastData = await forecastResponse.json();

      const dailyForecast = [];
      const usedDates = new Set();
      forecastData.list.forEach((entry) => {
        const date = new Date(entry.dt * 1000).toLocaleDateString();
        if (!usedDates.has(date)) {
          usedDates.add(date);
          dailyForecast.push(entry);
        }
      });

      setForecast(dailyForecast.slice(0,6));
    } catch (err) {
      setError(err.message);
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark fixed-top">
        <div className="container">
          <a className="navbar-brand" href="/weather-app/main.jsx">Weather App</a>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item"><button className="nav-link btn btn-link" onClick={() => setShowForecast(!showForecast)}>6-Day Forecast</button></li>
              <li className="nav-item"><button className="nav-link btn btn-link" onClick={() => setShowMap(!showMap)}>Map</button></li>
            </ul>
          </div>
        </div>
      </nav>
      {loading && <div className='loading spinner-border mx-auto col-12'></div>}
     
     <div className='input'>
      <div className="input mt-5 pt-4 text-center">
        <div className="input-group mb-3 mx-auto"> 
          <input type="text" className="form-control shadow" placeholder="Enter city name..." value={city} onChange={(e) => setCity(e.target.value)} />
          <button className="btn btn-secondary" onClick={fetchWeather}>Search</button>
         </div>
         </div>    
      </div>   

      {error && <p className="span bg-danger-subtle text-danger text-center">{error}</p>}

       {weather && (
        
        <div className='card-container'>
        <div className="weather mt-4">
          <div className="card mx-auto text-center p-3 shadow-lg" style={{ maxWidth: '400px' }}> 
            <h2>{weather.name}</h2>
            <p>🌡️ Temperature: {weather.main.temp}°C</p>
            <p className="card-text">🌥️ Condition: {weather.weather[0].description}</p>
            <p>🌬️ Wind Speed: {weather.wind.speed} m/s</p>
            <p>💧 Humidity: {weather.main.humidity}%</p>
            <p>🌧️ Precipitation: {weather.rain ? `${weather.rain["1h"]} mm` : "0 mm"}</p>
            <p>🌅 Sunrise: {new Date(weather.sys.sunrise * 1000).toLocaleTimeString()}</p>
            <p>🌇 Sunset: {new Date(weather.sys.sunset * 1000).toLocaleTimeString()}</p>
          </div>
        </div>
        </div>
      )} 

      {showForecast && forecast.length > 0 && (
        <div className="container mt-4 justify-center">
          <h3 className="day text-center">📅 6-Day Forecast</h3>
          <div className="forecast-container row">
            {forecast.map((day, index) => (
              <div key={index} className="col-md-4 mb-3">
                <div className="forecast text-center p-2">
                  <h5>{new Date(day.dt * 1000).toLocaleDateString()}</h5>
                  <p>🌡️ Temp: {day.main.temp}°C</p>
                  <p>🌥️ {day.weather[0].description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showMap && weather && (
        <div className="map-container mt-4 text-center">
          <h3 className='map'>🗺️ City Map</h3>
          <iframe
            className='map-container'
            width="100%"
            height="300"
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${weather.coord.lon - 0.1},${weather.coord.lat - 0.1},${weather.coord.lon + 0.1},${weather.coord.lat + 0.1}&layer=mapnik`}
            style={{ border: 0 }}
            allowFullScreen
          ></iframe>
        </div>
      )}
    </>
  );
}

createRoot(document.getElementById('root')).render(<WeatherApp />);
 