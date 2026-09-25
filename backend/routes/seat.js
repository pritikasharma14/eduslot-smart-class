const express = require("express");
const router = express.Router();
const Seat = require("../models/Seat");
const authMiddleware = require("../middleware/authMiddleware");
const Notification = require("../models/Notification");
// ✅ Get all seats
router.get("/", authMiddleware, async (req, res) => {
  try {
    const seats = await Seat.find();
    res.json(seats);
  } catch (err) {
    res.status(500).json("Error fetching seats");
  }
});


// ✅ Book seat
router.post("/book", authMiddleware, async (req, res) => {
  try {
   const { seatNumber } = req.body;
const userEmail = req.user.email;

    // ❗ Check if user already booked
    const alreadyBooked = await Seat.findOne({ bookedBy: userEmail });
console.log("Booking email:", userEmail);
console.log("Already booked:", alreadyBooked);
    if (alreadyBooked) {
      return res.status(400).json("You already booked a seat");
    }

    // ❗ Check if seat already booked
    const seat = await Seat.findOne({ seatNumber });

    if (seat && seat.isBooked) {
      return res.status(400).json("Seat already booked");
    }

    const newSeat = await Seat.findOneAndUpdate(
      { seatNumber },
      { 
        isBooked: true, 
        bookedBy: userEmail,
        bookedAt: new Date()   // 🔥 advanced feature
      },
      { new: true, upsert: true }
    );

    res.json(newSeat);

  } catch (err) {
    console.log(err);
    res.status(500).json("Booking failed");
  }
});


// 🔁 RESET ALL SEATS (Teacher Feature)
router.delete("/reset", async (req, res) => {
  try {
    await Seat.updateMany(
      {},
      {
        isBooked: false,
        bookedBy: null,
        bookedAt: null
      }
    );

    await Notification.create({
      message:
        "Teacher has reset all seats. Your previous seat booking has been cancelled. Please book a new seat."
    });

    res.json({
      message: "All seats reset successfully"
    });

  } catch (err) {
    console.log("Reset error:", err);
    res.status(500).json({
      message: "Reset failed"
    });
  }
});
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