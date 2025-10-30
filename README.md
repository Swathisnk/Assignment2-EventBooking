# Synergia Event Booking API (MongoDB version)

## Setup Instructions
1. Install dependencies:
   npm install

2. Add .env file:
   MONGO_URI=mongodb://localhost:27017/synergiaDB
   PORT=3000

3. Run the server:
   node index.js

## API Endpoints
GET     /api/bookings
POST    /api/bookings
GET     /api/bookings/:id
PUT     /api/bookings/:id
DELETE  /api/bookings/:id
GET     /api/bookings/search?email=xyz
GET     /api/bookings/filter?event=Devhack
