const mongoose = require("mongoose");

const SeatSchema = new mongoose.Schema({
  seatNumber: {
    type: Number,
    required: true,
    unique: true
  },
  isBooked: {
    type: Boolean,
    default: false
  },
  bookedBy: {
    type: String,
    default: null
  },
  bookedAt: {
    type: Date,
    default: null
  }
});

module.exports = mongoose.model("Seat", SeatSchema);