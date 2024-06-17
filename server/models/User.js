const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["Admin", "Manager", "User"], required: true },
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization" },
});

module.exports = mongoose.model("User", userSchema);
