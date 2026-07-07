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
            virtualTourScenes,
            itinerary        
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
            virtualTourScenes,
            itinerary        
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

/* =========================================================
   NEW — DEPARTURE / SEAT MAP HELPERS
   ========================================================= */

// Build a fresh seatMap array based on vehicleCount + seatsPerVehicle
const generateSeatMap = (vehicleCount, seatsPerVehicle) => {
    const seatMap = [];
    for (let v = 1; v <= vehicleCount; v++) {
        for (let s = 1; s <= seatsPerVehicle; s++) {
            seatMap.push({
                seatNumber: s,
                vehicleNumber: v,
                status: "available",
                bookedBy: null,
                bookingId: null,
            });
        }
    }
    return seatMap;
};

/* =========================================================
   ADD DEPARTURE (admin)
   POST /api/tours/:id/departures
   ========================================================= */
const addDeparture = async (req, res) => {
    try {
        const tour = await Tour.findById(req.params.id);
        if (!tour) {
            return res.status(404).json({ message: "Tour not found" });
        }

        const {
            date,
            time,
            departureLocation,
            arrivalLocation,
            transportType,
            vehicleCount,
            seatsPerVehicle,
        } = req.body;

        if (!date || !time || !departureLocation || !arrivalLocation || !transportType || !vehicleCount || !seatsPerVehicle) {
            return res.status(400).json({ message: "All departure fields are required." });
        }

        const vCount = Number(vehicleCount);
        const sPerVehicle = Number(seatsPerVehicle);
        const totalSeats = vCount * sPerVehicle;

        const newDeparture = {
            date,
            time,
            departureLocation,
            arrivalLocation,
            transportType,
            vehicleCount: vCount,
            seatsPerVehicle: sPerVehicle,
            totalSeats,
            seatMap: generateSeatMap(vCount, sPerVehicle),
        };

        tour.departures.push(newDeparture);
        await tour.save();

        res.status(201).json({
            message: "Departure added successfully",
            tour,
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/* =========================================================
   DEPARTURE (admin)
   ========================================================= */
const updateDeparture = async (req, res) => {
    try {
        const tour = await Tour.findById(req.params.id);
        if (!tour) {
            return res.status(404).json({ message: "Tour not found" });
        }

        const departure = tour.departures.id(req.params.departureId);
        if (!departure) {
            return res.status(404).json({ message: "Departure not found" });
        }

        const {
            date,
            time,
            departureLocation,
            arrivalLocation,
            transportType,
            vehicleCount,
            seatsPerVehicle,
        } = req.body;

        if (date !== undefined) departure.date = date;
        if (time !== undefined) departure.time = time;
        if (departureLocation !== undefined) departure.departureLocation = departureLocation;
        if (arrivalLocation !== undefined) departure.arrivalLocation = arrivalLocation;
        if (transportType !== undefined) departure.transportType = transportType;

        const vehicleCountChanged = vehicleCount !== undefined && Number(vehicleCount) !== departure.vehicleCount;
        const seatsPerVehicleChanged = seatsPerVehicle !== undefined && Number(seatsPerVehicle) !== departure.seatsPerVehicle;

        if (vehicleCountChanged || seatsPerVehicleChanged) {
            const vCount = vehicleCount !== undefined ? Number(vehicleCount) : departure.vehicleCount;
            const sPerVehicle = seatsPerVehicle !== undefined ? Number(seatsPerVehicle) : departure.seatsPerVehicle;

            departure.vehicleCount = vCount;
            departure.seatsPerVehicle = sPerVehicle;
            departure.totalSeats = vCount * sPerVehicle;
            departure.seatMap = generateSeatMap(vCount, sPerVehicle);
        }

        await tour.save();

        res.status(200).json({
            message: "Departure updated successfully",
            tour,
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/* =========================================================
   NEW — DELETE DEPARTURE (admin)
   DELETE /api/tours/:id/departures/:departureId
   ========================================================= */
const deleteDeparture = async (req, res) => {
    try {
        const tour = await Tour.findById(req.params.id);
        if (!tour) {
            return res.status(404).json({ message: "Tour not found" });
        }

        const departure = tour.departures.id(req.params.departureId);
        if (!departure) {
            return res.status(404).json({ message: "Departure not found" });
        }

        departure.deleteOne();
        await tour.save();

        res.status(200).json({
            message: "Departure deleted successfully",
            tour,
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/* =========================================================
   RESERVE SEATS (customer)
   ========================================================= */
const bookSeats = async (req, res) => {
    try {
        const tour = await Tour.findById(req.params.id);
        if (!tour) {
            return res.status(404).json({ message: "Tour not found" });
        }

        const departure = tour.departures.id(req.params.departureId);
        if (!departure) {
            return res.status(404).json({ message: "Departure not found" });
        }

        const { seats } = req.body; // [{ vehicleNumber, seatNumber }, ...]

        if (!Array.isArray(seats) || seats.length === 0) {
            return res.status(400).json({ message: "Please select at least one seat." });
        }

        // Validate all requested seats are currently available
        const unavailable = [];
        for (const reqSeat of seats) {
            const seatDoc = departure.seatMap.find(
                s => s.vehicleNumber === reqSeat.vehicleNumber && s.seatNumber === reqSeat.seatNumber
            );
            if (!seatDoc || seatDoc.status !== "available") {
                unavailable.push(reqSeat);
            }
        }

        if (unavailable.length > 0) {
            return res.status(409).json({
                message: "Some selected seats are no longer available.",
                unavailable,
            });
        }

        // Mark seats as reserved and tag them to the requesting user
        const userId = req.user?._id || req.body.userId || null;
        seats.forEach(reqSeat => {
            const seatDoc = departure.seatMap.find(
                s => s.vehicleNumber === reqSeat.vehicleNumber && s.seatNumber === reqSeat.seatNumber
            );
            seatDoc.status = "reserved";
            seatDoc.bookedBy = userId;
        });

        await tour.save();

        res.status(200).json({
            message: "Seats reserved. Complete payment to confirm your booking.",
            departureId: departure._id,
            reservedSeats: seats,
            tour,
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    addTour,
    getAllTours,
    getSingleTour,
    updateTour,
    deleteTour,
    addDeparture,
    updateDeparture,
    deleteDeparture,
    bookSeats
};
