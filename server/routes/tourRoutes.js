const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");

const {
    addTour,
    getAllTours,
    addDeparture,
    updateDeparture,
    deleteDeparture,
    getSingleTour,
    updateTour,
    deleteTour,
    bookSeats
} = require("../controllers/tourController");

router.post("/add", addTour);
router.get("/", getAllTours);

/* =========================================================
   DEPARTURE / SEAT MAP ROUTES
   ========================================================= */

router.post("/:id/departures", protect, addDeparture);
router.put("/:id/departures/:departureId", protect, updateDeparture);
router.delete("/:id/departures/:departureId", protect, deleteDeparture);
router.post("/:id/departures/:departureId/book", protect, bookSeats);

router.get("/:id", getSingleTour);
router.put("/:id", updateTour);
router.delete("/:id", deleteTour);

module.exports = router;