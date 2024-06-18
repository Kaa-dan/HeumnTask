const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  status: { type: String, default: "Todo" },
  dueDate: { type: Date },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "Userr", required: true },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization",
    required: true,
  },
});

module.exports = mongoose.model("Task", taskSchema);
