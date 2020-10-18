const Topic = require("../models/topic");
const Question = require("../models/question");
const Answer = require("../models/answer");
const mongoose = require("mongoose");

class QuestionCtl {
  async find(ctx) {
    let questions = [];
    if (ctx.query.filter !== "undefined" && ctx.query.id !== "undefined") {
      if (ctx.query.filter === "topic") {
        questions = await Question.find({ topic: ctx.query.id })
          .populate("creator")
          .sort({ createdAt: -1 });
      }
      if (ctx.query.filter === "creator") {
        questions = await Question.find({ creator: ctx.query.id })
          .populate("creator")
          .sort({ createdAt: -1 });
      }
    } else {
      questions = await Question.find().populate("creator").sort({ createdAt: -1 });
    }
    ctx.body = questions;
  }

  async findById(ctx) {
    const question = await Question.findById(ctx.params.id).populate("creator");
    ctx.body = question;
  }

  async create(ctx) {
    ctx.verifyParams({
      title: { type: "string", required: true },
      content: { type: "string", required: true },
    });
    if (!ctx.request.body.topic) {
      ctx.request.body.topic = [];
    }
    if (ctx.request.body.new_topic && ctx.request.body.new_topic !== "") {
      const newTopics = ctx.request.body.new_topic.split("#");
      for (const name of newTopics) {
        const topic = await Topic.findOne({ name }).exec();
        if (topic) {
          if (!ctx.request.body.topic.includes(topic._id.toString())) {
            ctx.request.body.topic.push(topic._id);
          }
        } else {
          const topic_id = mongoose.Types.ObjectId();
          await new Topic({
            name: name,
            _id: topic_id,
            creator: ctx.state.user._id,
          }).save();
          ctx.request.body.topic.push(topic_id);
        }
      }
    }
    await new Question(ctx.request.body).save();
    ctx.body = {
      status: "success",
      message: "创建成功",
    };
  }

  async checkOwner(ctx, next) {
    const question = await Question.findById(ctx.params.id).select("+creator");
    if (question.creator != ctx.state.user._id) {
      ctx.body = {
        status: "fail",
        message: "没有权限",
      };
    } else {
      await next();
    }
  }

  async update(ctx) {
    if (!ctx.request.body.topic) {
      ctx.request.body.topic = [];
    }
    if (ctx.request.body.new_topic && ctx.request.body.new_topic !== "") {
      const newTopics = ctx.request.body.new_topic.split("#");
      for (const name of newTopics) {
        const topic = await Topic.findOne({ name }).exec();
        if (topic) {
          if (!ctx.request.body.topic.includes(topic._id.toString())) {
            ctx.request.body.topic.push(topic._id);
          }
        } else {
          const topic_id = mongoose.Types.ObjectId();
          await new Topic({
            name: name,
            _id: topic_id,
            creator: ctx.state.user._id,
          }).save();
          ctx.request.body.topic.push(topic_id);
        }
      }
    }
    await Question.findByIdAndUpdate(ctx.params.id, ctx.request.body);
    ctx.body = {
      status: "success",
      message: "修改成功",
    };
  }
  async delete(ctx) {
    const answers = await Answer.find({ question: ctx.params.id });
    if (answers.length !== 0) {
      ctx.body = {
        status: "fail",
        message: "该帖子下有回复，无法删除",
      };
    } else {
      await Question.findByIdAndRemove(ctx.params.id);
      ctx.body = {
        status: "success",
        message: "删除成功",
      };
    }
  }

  async like(ctx) {
    const question = await Question.findById(ctx.params.id);
    if (
      !question.like.map((id) => id.toString()).includes(ctx.state.user._id)
    ) {
      question.like.push(ctx.state.user._id);
      question.save();
      ctx.body = {
        status: "success",
        message: "点赞成功",
      };
    }
  }

  async unlike(ctx) {
    const question = await Question.findById(ctx.params.id);
    const index = question.like
      .map((id) => id.toString())
      .indexOf(ctx.state.user._id);
    if (index > -1) {
      question.like.splice(index, 1);
      question.save();
      ctx.body = {
        status: "success",
        message: "取消点赞成功",
      };
    }
  }
}

module.exports = new QuestionCtl();
