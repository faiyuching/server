const mongoose = require("mongoose");

const { Schema, model } = mongoose;

const userSchema = new Schema(
  {
    __v: { type: Number, select: false },
    telephone: { type: String, required: true, select: false },
    password: { type: String, required: true, select: false },
    username: { type: String, required: true },
    avatar: {
      type: String,
      required: false,
      default:
        "https://res.wx.qq.com/a/wx_fed/webwx/res/static/img/2KriyDK.png",
    },
    introduction: { type: String, required: false },
    city: { type: String, required: false, select: false },
    field: { type: String, required: false, select: false },
    skill: { type: String, required: false, select: false },
    picture: {
      type: String,
      required: false,
      default:
        "https://pic1.zhimg.com/80/v2-7248e3df3e65bb7f58a6f20da805b0b7_r.jpg",
    },
    following: {
      type: [{ type: Schema.Types.ObjectId, ref: "User" }],
    },
    followers: {
      type: [{ type: Schema.Types.ObjectId, ref: "User" }],
    },
  },
  { timestamps: true }
);

module.exports = model("User", userSchema);
