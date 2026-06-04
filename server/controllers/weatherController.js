const axios = require("axios");

const getWeather = async (req, res) => {
    try {
        const location = req.params.location;

        const apiKey = process.env.WEATHER_API_KEY;

        const url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=metric`;

        const response = await axios.get(url);

        const data = response.data;

        const weather = {
            location: data.name,
            temperature: data.main.temp,
            condition: data.weather[0].description,
            humidity: data.main.humidity
        };

        res.status(200).json(weather);

    } catch (error) {
        res.status(500).json({
            message: "Error fetching weather",
            error: error.message
        });
    }
};

module.exports = { getWeather };