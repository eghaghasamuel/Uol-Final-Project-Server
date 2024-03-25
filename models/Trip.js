const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema({
  title: { type: String, required: true },
  listTrip: {type: Object, required: false},
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, 
});

const Trip = mongoose.model("Trip", tripSchema);

module.exports = Trip;
