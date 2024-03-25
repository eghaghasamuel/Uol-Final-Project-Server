const router = require("express").Router();
const passport = require("passport");
const passportConfig = require("../passport");
const User = require("../models/User");
const Trip = require("../models/Trip");

router.get("/login/success", (req, res) => {
	console.log("SSSC", req.user)
	if (req.isAuthenticated()) {
	  res.status(200).json({
		error: false,
		message: "Successfully Logged In",
		user: req.user,
	  });
	} else {
	  res.status(403).json({ error: true, message: "Not Authorized" });
	}
  });
  


router.get("/login/failed", (req, res) => {
  res.status(401).json({
    error: true,
    message: "Log in failure",
  });
});

router.get("/google", passportConfig.google);
router.get("/google/callback", passportConfig.googleCallback);



router.post("/login", (req, res, next) => {
	passport.authenticate("local", (err, user, info) => {
	  if (err) {
		return res.status(500).json({ error: true, message: "Internal server error." });
	  }
	  if (!user) {
		return res.status(401).json({ error: true, message: "Login failed." });
	  }
	  req.login(user, (err) => {
		if (err) {
		  return res.status(500).json({ error: true, message: "Internal server error." });
		}
		console.log(req.isAuthenticated())
		
		return res.status(200).json({
		  error: false,
		  message: "Login successful.",
		  user: req.user,
		});
	  });
	})(req, res, next);
  });
  
  
router.post("/register", async (req, res) => {
	try {
	  const { email, password } = req.body;
	  const existingUser = await User.findOne({ email });
  
	  if (existingUser) {
		return res.status(400).json({ error: true, message: "User already exists." });
	  }
  
	  if (req.isAuthenticated() && req.user) {
		const { id, displayName } = req.user;
		const newUser = new User({ email, password, googleId: id, displayName });
		await newUser.save();
  
		req.login(newUser, (err) => {
		  if (err) {
			return res.status(500).json({ error: true, message: "Internal server error." });
		  }
		  console.log(req.isAuthenticated());
		  return res.status(201).json({
			error: false,
			message: "User registered successfully.",
			user: newUser,
		  });
		});
	  } else {
		const newUser = new User({ email, password });
		await newUser.save();
  
		req.login(newUser, (err) => {
		  if (err) {
			return res.status(500).json({ error: true, message: "Internal server error." });
		  }
		  console.log(req.isAuthenticated());
		  return res.status(201).json({
			error: false,
			message: "User registered successfully.",
			user: newUser,
		  });
		});
	  }
	} catch (error) {
	  res.status(500).json({ error: true, message: "Internal server error." });
	}
  });
  
  
router.get("/logout", (req, res) => {
  req.logout();
  res.redirect(process.env.CLIENT_URL);
});


module.exports = router;
