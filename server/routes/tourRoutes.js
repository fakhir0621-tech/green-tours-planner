const express = require("express");
const router = express.Router();

const {
    addTour,
    getAllTours,
    getSingleTour,
    updateTour,
    deleteTour
} = require("../controllers/tourController");

router.post("/add", addTour);
router.get("/", getAllTours);
router.get("/:id", getSingleTour);
router.put("/:id", updateTour);
router.delete("/:id", deleteTour);

module.exports = router;