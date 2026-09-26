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

    const notification = await Notification.create({
      message:
        "Teacher has reset all seats. Your previous seat booking has been cancelled. Please book a new seat."
    });

    console.log("Notification created:", notification);

    res.json({
      message: "All seats reset successfully"
    });

  } catch (err) {
    console.log("Reset error:", err);

    res.status(500).json({
      message: "Reset failed",
      error: err.message
    });
  }
});