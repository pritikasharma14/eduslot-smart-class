const express = require("express");
const router = express.Router();

const Seat = require("../models/Seat");
const Notification = require("../models/Notification");
const authMiddleware = require("../middleware/authMiddleware");

// Get all seats
router.get("/", authMiddleware, async (req, res) => {
  try {
    const seats = await Seat.find();
    res.json(seats);
  } catch (err) {
    console.log("Fetch seats error:", err);
    res.status(500).json({
      message: "Error fetching seats"
    });
  }
});

// Book seat
router.post("/book", authMiddleware, async (req, res) => {
  try {
    const { seatNumber } = req.body;
    const userEmail = req.user.email;

    console.log("Seat requested:", seatNumber);
    console.log("User:", userEmail);

    if (!seatNumber) {
      return res.status(400).json({
        message: "Seat number is required"
      });
    }

    // Check whether user already has a booking
    const alreadyBooked = await Seat.findOne({
      bookedBy: userEmail,
      isBooked: true
    });

    if (alreadyBooked) {
      return res.status(400).json({
        message: "You already booked a seat"
      });
    }

    // Check selected seat
    const seat = await Seat.findOne({
      seatNumber: Number(seatNumber)
    });

    if (seat && seat.isBooked) {
      return res.status(400).json({
        message: "Seat already booked"
      });
    }

    // Book seat
    const bookedSeat = await Seat.findOneAndUpdate(
      { seatNumber: Number(seatNumber) },
      {
        seatNumber: Number(seatNumber),
        isBooked: true,
        bookedBy: userEmail,
        bookedAt: new Date()
      },
      {
        new: true,
        upsert: true
      }
    );

    console.log("Booking successful:", bookedSeat);

    res.status(200).json({
      message: "Seat booked successfully",
      seat: bookedSeat
    });

  } catch (err) {
    console.log("BOOKING ERROR:", err);

    res.status(500).json({
      message: "Booking failed",
      error: err.message
    });
  }
});

// Reset all seats
router.delete("/reset", async (req, res) => {
  try {
    console.log("RESET ROUTE HIT");

    await Seat.updateMany(
      {},
      {
        isBooked: false,
        bookedBy: null,
        bookedAt: null
      }
    );

    console.log("Seats reset successfully");

    const notification = await Notification.create({
      message:
        "Teacher has reset all seats. Your previous seat booking has been cancelled. Please book a new seat."
    });

    console.log("NOTIFICATION CREATED:", notification);

    res.status(200).json({
      message: "All seats reset successfully",
      notification: notification
    });

  } catch (err) {
    console.log("RESET ERROR:", err);

    res.status(500).json({
      message: "Reset failed",
      error: err.message
    });
  }
});

// Get latest notification
router.get("/notification", authMiddleware, async (req, res) => {
  try {
    const notification = await Notification.findOne()
      .sort({ createdAt: -1 });

    res.json(notification);

  } catch (err) {
    console.log("Notification error:", err);

    res.status(500).json({
      message: "Unable to fetch notification"
    });
  }
});

module.exports = router;