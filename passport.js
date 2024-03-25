const GoogleStrategy = require("passport-google-oauth20").Strategy;
const LocalStrategy = require("passport-local").Strategy;
const passport = require("passport");
const bcrypt = require("bcrypt");
const User = require("./models/User");


passport.use(
	new GoogleStrategy(
		{
			clientID: process.env.CLIENT_ID,
			clientSecret: process.env.CLIENT_SECRET,
			callbackURL: "/auth/google/callback",
			scope: ["profile", "email"],
		},
		async (accessToken, refreshToken, profile, callback) => {
			try {
				const { id, displayName, emails } = profile;
				let user = await User.findOne({ googleId: id });

				if (!user) {
					user = new User({
						googleId: id,
						displayName: displayName,
						email: emails[0].value,
					});

					await user.save();
				}
				return callback(null, user);
			} catch (error) {
				return callback(error);
			}
		}
	)
);


passport.use(
	new LocalStrategy({ usernameField: "email" }, async (email, password, done) => {
		try {
			const user = await User.findOne({ email });

			if (!user) {
				return done(null, false, { message: "Incorrect email." });
			}

			const isPasswordValid = await bcrypt.compare(password, user.password);

			if (!isPasswordValid) {
				return done(null, false, { message: "Incorrect password." });
			}

			return done(null, user);
		} catch (error) {
			return done(error);
		}
	})
);

passport.serializeUser((user, done) => {
	done(null, user);

});

passport.deserializeUser((user, done) => {
	done(null, user);
});

module.exports = {
	local: passport.authenticate('local'),
	google: passport.authenticate("google", { scope: ["profile", "email"] }),
	googleCallback: passport.authenticate("google", {
		successRedirect: process.env.CLIENT_URL,
		failureRedirect: "/auth/login/failed",
	}),
};
