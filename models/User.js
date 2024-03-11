const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String },
  googleId: { type: String, unique: true },
  displayName: { type: String },
  trips: [{ type: mongoose.Schema.Types.ObjectId, ref: "Trip" }],
});

// Hash the password before saving to the database
userSchema.pre("save", async function (next) {
  try {
    // Hash the password only if it's present
    if (this.password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(this.password, salt);
      this.password = hashedPassword;
    }
    next();
  } catch (error) {
    next(error);
  }
});

const User = mongoose.model("User", userSchema);

module.exports = User;
