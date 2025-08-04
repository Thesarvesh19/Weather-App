const api = {
    key: "df141820b495027f10ea982c79ad79ea",
    base: "https://api.openweathermap.org/data/2.5/"
};

const searchbox = document.querySelector('.search-box');
searchbox.addEventListener('keypress', setQuery);

let weatherData = null;
let intervalId = null;


function setQuery(evt) {
    if (evt.keyCode == 13) {
        getResults(searchbox.value);
    }
}


async function getResults(query) {
    try {
        const weatherResponse = await fetch(`${api.base}weather?q=${query}&units=metric&APPID=${api.key}`);
        if (!weatherResponse.ok) {
            throw new Error(`Error: City not found. Status: ${weatherResponse.status}`);
        }
        weatherData = await weatherResponse.json();
        
        // Display initial weather data and styles
        displayResults(weatherData);

        // Clear any previous interval to prevent multiple clocks running at once
        if (intervalId) {
            clearInterval(intervalId);
        }

        // Start a new interval to update the time every second
        intervalId = setInterval(() => {
            const timezoneOffsetSeconds = weatherData.timezone;
            const now = new Date();
            // Calculate local time using the city's timezone offset from UTC
            const localTime = new Date(now.getTime() + timezoneOffsetSeconds * 1000 + now.getTimezoneOffset() * 60000);
            updateTime(localTime);

            // Re-evaluate day/night and styles to handle changes over time
            const localHour = localTime.getHours();
            const isDaytime = localHour >= 6 && localHour < 18;
            setDynamicStyles(weatherData.weather[0].main, isDaytime);
            setWeatherIcon(weatherData.weather[0].main, isDaytime);

        }, 1000);

    } catch (error) {
        console.error(error);
        alert("Sorry, we couldn't find that city. Please try with different city.");
    }
}


function displayResults(weather) {
    let city = document.querySelector('.location .city');
    city.innerText = `${weather.name}, ${weather.sys.country}`;

    let temp = document.querySelector('.current .temp');
    temp.innerHTML = `${Math.round(weather.main.temp)}<span>°c</span>`;

    let weather_el = document.querySelector('.current .weather');
    weather_el.innerText = weather.weather[0].main;

    let hilow = document.querySelector('.hi-low');
    hilow.innerText = `${Math.round(weather.main.temp_min)}°c / ${Math.round(weather.main.temp_max)}°c`;
}

/*
 * === Update Time Function ===
 * Updates the date and time elements continuously.
 */
function updateTime(localTime) {
    let date = document.querySelector('.location .date');
    date.innerText = dateBuilder(localTime);

    let time = document.querySelector('.location .time');
    time.innerText = timeBuilder(localTime);
}

/*
 * === Date and Time Builders ===
 * Helper functions to format the date and time strings.
 */
function dateBuilder(d) {
    let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    let days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    let day = days[d.getDay()];
    let date = d.getDate();
    let month = months[d.getMonth()];
    let year = d.getFullYear();

    return `${day} ${date} ${month} ${year}`;
}

function timeBuilder(d) {
    let hours = d.getHours();
    let minutes = d.getMinutes();
    let ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${minutes} ${ampm}`;
}

/*
 * === Dynamic Styling Logic ===
 * Sets the background and icon based on weather conditions and time of day.
 * This function now uses a more flexible if/else if structure.
 */
function setDynamicStyles(weatherType, isDaytime) {
    const body = document.body;
    body.className = ''; 
    const weatherMain = weatherType.toLowerCase();

    if (weatherMain.includes('clear')) {
        body.classList.add('clear');
        if (!isDaytime) {
            body.classList.add('night');
        }
    } else if (weatherMain.includes('cloud')) {
        body.classList.add('clouds');
    } else if (weatherMain.includes('rain') || weatherMain.includes('drizzle')) {
        body.classList.add('rain');
    } else if (weatherMain.includes('snow')) {
        body.classList.add('snow');
    } else if (weatherMain.includes('thunderstorm')) {
        body.classList.add('thunderstorm');
    } else if (weatherMain.includes('mist') || weatherMain.includes('fog') || weatherMain.includes('haze') || weatherMain.includes('smoke')) {
        body.classList.add('mist');
    } else {
        body.classList.add('default-bg'); // Fallback class if needed
    }
}

function setWeatherIcon(weatherType, isDaytime) {
    const iconElement = document.getElementById('weather-icon');
    let iconClass = 'fas ';
    const weatherMain = weatherType.toLowerCase();

    if (weatherMain.includes('clear')) {
        iconClass += isDaytime ? 'fa-sun' : 'fa-moon';
    } else if (weatherMain.includes('cloud')) {
        iconClass += 'fa-cloud';
    } else if (weatherMain.includes('rain') || weatherMain.includes('drizzle')) {
        iconClass += 'fa-cloud-rain';
    } else if (weatherMain.includes('snow')) {
        iconClass += 'fa-snowflake';
    } else if (weatherMain.includes('thunderstorm')) {
        iconClass += 'fa-bolt';
    } else if (weatherMain.includes('mist') || weatherMain.includes('fog') || weatherMain.includes('haze') || weatherMain.includes('smoke')) {
        iconClass += 'fa-smog';
    } else {
        iconClass += 'fa-question';
    }
    iconElement.className = iconClass;
}
