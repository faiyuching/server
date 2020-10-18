const mongoose = require("mongoose");

const { Schema, model } = mongoose;

const topicSchema = new Schema(
  {
    __v: { type: Number, select: false },
    creator: { type: Schema.Types.ObjectId, ref: "User", required: true, select: false },
    name: { type: String, required: true },
    description: { type: String, required: false, select: false },
  },
  { timestamps: true }
);

module.exports = model("Topic", topicSchema);
