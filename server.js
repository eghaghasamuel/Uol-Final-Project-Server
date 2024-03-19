require("dotenv").config();
const express = require("express");
const cors = require("cors");
const passport = require("passport");
const cookieSession = require("cookie-session");
const mongoose = require("mongoose");
const passportConfig = require("./passport");
const authRoute = require("./routes/auth");
const tripRoute = require("./routes/trip");
const path  = require('path');

(async () => {
const app = express();
// Parse JSON bodies for this app
app.use(express.json());
// Connect to MongoDB

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });
const db = mongoose.connection;

db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

// Configure Passport
app.use(
  cookieSession({
    name: "session",
    keys: ["cyberwolve"],
    maxAge: 24 * 60 * 60 * 100,
  })
);

app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());


// Enable CORS
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
  })
);


// Use the local authentication strategy
passport.use(passportConfig.local);
app.get("/*", function (req,res){
  res.sendFile(path.join(__dirname,"../client/build/index.html"),
  function (err) {
    if (err) {
      res.status(500).send(err);
    }
  }
  )
})
// Routes
app.use("/auth", authRoute);
app.use("/trip", tripRoute);



const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Listening on port ${port}...`));
})()
