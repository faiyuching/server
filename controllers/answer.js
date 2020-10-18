const Answer = require("../models/answer");
const Comment = require("../models/comment");
class AnswerCtl {
  async find(ctx) {
    let answers = [];
    if (ctx.query.filter !== "undefined" && ctx.query.id !== "undefined") {
      if (ctx.query.filter === "question") {
        answers = await Answer.find({ question: ctx.query.id })
          .populate("creator")
          .sort({ createdAt: -1 });
      }
      if (ctx.query.filter === "creator") {
        answers = await Answer.find({ creator: ctx.query.id })
          .populate("creator")
          .sort({ createdAt: -1 });
      }
    } else {
      answers = await Answer.find().populate("creator");
    }
    ctx.body = answers;
  }
  async findById(ctx) {
    const answer = await Answer.findById(ctx.params.id).populate("creator");
    ctx.body = answer;
  }

  async create(ctx) {
    ctx.verifyParams({
      content: { type: "string", required: true },
    });
    await new Answer(ctx.request.body).save();
    ctx.body = {
      status: "success",
      message: "创建成功",
    };
  }

  async checkOwner(ctx, next) {
    const answer = await Answer.findById(ctx.params.id);
    if (answer.creator != ctx.state.user._id) {
      ctx.body = {
        status: "fail",
        message: "没有权限",
      };
    } else {
      await next();
    }
  }

  async update(ctx) {
    await Answer.findByIdAndUpdate(ctx.params.id, ctx.request.body);
    ctx.body = {
      status: "success",
      message: "更新成功",
    };
  }
  async delete(ctx) {
    const comments = await Comment.find({ answer: ctx.params.id });
    if (comments.length !== 0) {
      ctx.body = {
        status: "fail",
        message: "该回复下有评论，无法删除",
      };
    } else {
      await Answer.findByIdAndRemove(ctx.params.id);
      ctx.body = {
        status: "success",
        message: "删除成功",
      };
    }
  }
  async like(ctx) {
    const answer = await Answer.findById(ctx.params.id);
    if (!answer.like.map((id) => id.toString()).includes(ctx.state.user._id)) {
      answer.like.push(ctx.state.user._id);
      answer.save();
      ctx.body = {
        status: "success",
        message: "点赞成功",
      };
    }
  }

  async unlike(ctx) {
    const answer = await Answer.findById(ctx.params.id);
    const index = answer.like
      .map((id) => id.toString())
      .indexOf(ctx.state.user._id);
    if (index > -1) {
      answer.like.splice(index, 1);
      answer.save();
      ctx.body = {
        status: "success",
        message: "取消点赞成功",
      };
    }
  }
}

module.exports = new AnswerCtl();
