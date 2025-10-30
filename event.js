require('dotenv').config();
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const app = express();

app.use(express.json());

// MongoDB connection
const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);
let bookingsCollection;
let db;

// Available events
const availableEvents = ["Devhack", "Bot sumo", "3D Vision", "Aerophilia", "Robosoccer"];

// Connect to MongoDB
async function connectDB() {
  try {
    await client.connect();
    db = client.db("synergiaDB");
    bookingsCollection = db.collection("bookings");
    console.log("Connected to MongoDB successfully!");
  } catch (err) {
    console.error("MongoDB connection failed:", err);
  }
}

connectDB();
// 1️.GET /api/bookings — Get all bookings

app.get('/api/bookings', async (req, res) => {
  try {
    const bookings = await bookingsCollection.find().toArray();
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: "Error fetching bookings", error: err.message });
  }
});

// 2️.POST /api/bookings — Create a new booking

app.post('/api/bookings', async (req, res) => {
  try {
    const { name, email, event, ticketType } = req.body;

    if (!name || !email || !event) {
      return res.status(400).json({ message: "Name, email, and event are required!" });
    }

    if (!availableEvents.includes(event)) {
      return res.status(400).json({ message: `Event '${event}' does not exist!` });
    }

    const newBooking = {
      name,
      email,
      event,
      ticketType: ticketType || "Regular",
      createdAt: new Date()
    };

    const result = await bookingsCollection.insertOne(newBooking);
    res.status(201).json({
      message: "Booking created successfully!",
      bookingId: result.insertedId
    });
  } catch (err) {
    res.status(500).json({ message: "Error creating booking", error: err.message });
  }
});

// 3️. SEARCH BY EMAIL — GET /api/bookings/search?email=xyz

app.get('/api/bookings/search', async (req, res) => {
  try {
    const email = req.query.email;
    if (!email) {
      return res.status(400).json({ message: "Email query parameter required!" });
    }

    const results = await bookingsCollection.find({ email }).toArray();

    if (results.length === 0) {
      return res.status(404).json({ message: "No bookings found for this email!" });
    }

    res.json(results);
  } catch (err) {
    res.status(500).json({ message: "Error searching bookings", error: err.message });
  }
});

// 4️ FILTER BY EVENT — GET /api/bookings/filter?event=Bot sumo

app.get('/api/bookings/filter', async (req, res) => {
  try {
    const eventName = req.query.event;
    if (!eventName) {
      return res.status(400).json({ message: "Event query parameter is required!" });
    }

    const bookings = await bookingsCollection.find({ event: eventName }).toArray();

    if (bookings.length === 0) {
      return res.status(404).json({ message: `No bookings found for event '${eventName}'` });
    }

    res.json(bookings);
  } catch (error) {
    console.error(" Filter error:", error);
    res.status(500).json({ message: "Error fetching booking", error: error.message });
  }
});

// 5. GET /api/bookings/:id — Get booking by ID
app.get('/api/bookings/:id', async (req, res) => {
  try {
    const id = req.params.id;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid booking ID format!" });
    }

    const booking = await bookingsCollection.findOne({ _id: new ObjectId(id) });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found!" });
    }

    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: "Error fetching booking", error: err.message });
  }
});

// 6️ PUT /api/bookings/:id — Update participant details
app.put('/api/bookings/:id', async (req, res) => {
  try {
    const id = req.params.id;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid booking ID format!" });
    }

    const { name, email, event, ticketType } = req.body;

    if (event && !availableEvents.includes(event)) {
      return res.status(400).json({ message: `Event '${event}' does not exist!` });
    }

    const updateFields = {};
    if (name) updateFields.name = name;
    if (email) updateFields.email = email;
    if (event) updateFields.event = event;
    if (ticketType) updateFields.ticketType = ticketType;

    const result = await bookingsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Booking not found!" });
    }

    res.json({ message: "Booking updated successfully!" });
  } catch (err) {
    res.status(500).json({ message: "Error updating booking", error: err.message });
  }
});

// 7️ DELETE /api/bookings/:id — Delete a booking
app.delete('/api/bookings/:id', async (req, res) => {
  try {
    const id = req.params.id;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid booking ID format!" });
    }

    const result = await bookingsCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Booking not found!" });
    }

    res.json({ message: " Booking deleted successfully!" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting booking", error: err.message });
  }
});

// Server Start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Synergia Event Booking API running at http://localhost:${PORT}`)
);
