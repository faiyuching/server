const mongoose = require("mongoose");

const { Schema, model } = mongoose;

const questionSchema = new Schema(
  {
    __v: { type: Number, select: false },
    creator: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    topic: [{ type: Schema.Types.ObjectId, required: true, ref: "Topic" }],
    title: { type: String, required: true },
    content: { type: String, required: true },
    like: {
      type: [{ type: Schema.Types.ObjectId, ref: "User" }],
    },
  },
  { timestamps: true }
);

module.exports = model("Question", questionSchema);
