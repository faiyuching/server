const mongoose = require("mongoose");

const { Schema, model } = mongoose;

const commentSchema = new Schema(
  {
    __v: { type: Number, select: false },
    creator: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    question: { type: Schema.Types.ObjectId, required: true, ref: "Question" },
    answer: { type: Schema.Types.ObjectId, required: true, ref: "Answer" },
    replyto: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    content: { type: String, required: true },
    like: {
      type: [{ type: Schema.Types.ObjectId, ref: "User" }],
    },
  },
  { timestamps: true }
);

module.exports = model("Comment", commentSchema);
