const Tour = require("../models/Tour");
const axios = require("axios");

const addTour = async (req, res) => {
    try {
        const {
            tourName,
            location,
            price,
            duration,
            description,
            category,
            images,
            availableSeats,
            virtualTourLink,
            itinerary        // ← THIS WAS MISSING — now included
        } = req.body;

        const tour = await Tour.create({
            tourName,
            location,
            price,
            duration,
            description,
            category,
            images,
            availableSeats,
            virtualTourLink,
            itinerary        // ← THIS WAS MISSING — now saved to DB
        });

        res.status(201).json({
            message: "Tour added successfully",
            tour
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


const getAllTours = async (req, res) => {
    try {
        const {
            location,
            category,
            minPrice,
            maxPrice,
            keyword,
            duration
        } = req.query;

        let filter = {};

        if (location) {
            filter.location = { $regex: location, $options: "i" };
        }

        if (category) {
            filter.category = category;
        }

        if (duration) {
            filter.duration = duration;
        }

        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = Number(minPrice);
            if (maxPrice) filter.price.$lte = Number(maxPrice);
        }

        if (keyword) {
            filter.$or = [
                { tourName: { $regex: keyword, $options: "i" } },
                { description: { $regex: keyword, $options: "i" } }
            ];
        }

        const tours = await Tour.find(filter);

        const apiKey = process.env.WEATHER_API_KEY;

        const toursWithWeather = await Promise.all(
            tours.map(async (tour) => {
                try {
                    const url = `https://api.openweathermap.org/data/2.5/weather?q=${tour.location}&appid=${apiKey}&units=metric`;
                    const response = await axios.get(url);
                    return {
                        ...tour._doc,
                        weather: {
                            temperature: response.data.main.temp,
                            condition: response.data.weather[0].description
                        }
                    };
                } catch (error) {
                    return {
                        ...tour._doc,
                        weather: {
                            temperature: "N/A",
                            condition: "Unavailable"
                        }
                    };
                }
            })
        );

        res.status(200).json(toursWithWeather);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const getSingleTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);

    if (!tour) {
      return res.status(404).json({ message: "Tour not found" });
    }

    const apiKey = process.env.WEATHER_API_KEY;

    let weather = { temperature: "N/A", condition: "Unavailable" };

    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${tour.location}&appid=${apiKey}&units=metric`;
      const response = await axios.get(url);
      weather = {
        temperature: response.data.main.temp,
        condition: response.data.weather[0].description,
      };
    } catch (err) {
      console.log("Weather fetch failed:", err.message);
    }

    res.status(200).json({
      ...tour._doc,
      weather,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateTour = async (req, res) => {
    try {
        const tour = await Tour.findById(req.params.id);

        if (!tour) {
            return res.status(404).json({
                message: "Tour not found"
            });
        }

        const updatedTour = await Tour.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true
            }
        );

        res.status(200).json({
            message: "Tour updated successfully",
            updatedTour
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const deleteTour = async (req, res) => {
    try {
        const tour = await Tour.findById(req.params.id);

        if (!tour) {
            return res.status(404).json({
                message: "Tour not found"
            });
        }

        await Tour.findByIdAndDelete(req.params.id);

        res.status(200).json({
            message: "Tour deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

module.exports = {
    addTour,
    getAllTours,
    getSingleTour,
    updateTour,
    deleteTour
};