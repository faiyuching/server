const Comment = require("../models/comment");

class CommentCtl {
  async find(ctx) {
    let comments = [];
    if (ctx.query.filter !== "undefined" && ctx.query.id !== "undefined") {
      if (ctx.query.filter === "answer") {
        comments = await Comment.find({ answer: ctx.query.id })
          .populate("creator")
          .populate("replyto");
      }
      if (ctx.query.filter === "question") {
        comments = await Comment.find({ question: ctx.query.id })
          .populate("creator")
          .populate("replyto");
      }
    } else {
      comments = await Comment.find().populate("creator");
    }
    ctx.body = comments;
  }
  async findById(ctx) {
    const comment = await Comment.findById(ctx.params.id);
    ctx.body = comment;
  }

  async create(ctx) {
    ctx.verifyParams({
      content: { type: "string", required: true },
    });
    await new Comment(ctx.request.body).save();
    ctx.body = {
      status: "success",
      message: "创建成功",
    };
  }

  async checkOwner(ctx, next) {
    const comment = await Comment.findById(ctx.params.id);
    if (comment.creator != ctx.state.user._id) {
      ctx.body = {
        status: "fail",
        message: "没有权限",
      };
    } else {
      await next();
    }
  }

  async update(ctx) {
    await Comment.findByIdAndUpdate(ctx.params.id, ctx.request.body);
    ctx.body = {
      status: "success",
      message: "更新成功",
    };
  }
  async delete(ctx) {
    await Comment.findByIdAndRemove(ctx.params.id);
    ctx.body = {
      status: "success",
      message: "删除成功",
    };
  }

  async like(ctx) {
    const comment = await Comment.findById(ctx.params.id);
    if (!comment.like.map(id => id.toString()).includes(ctx.state.user._id)) {
      comment.like.push(ctx.state.user._id);
      comment.save();
      ctx.body = {
        status: "success",
        message: "点赞成功",
      };
    }
  }

  async unlike(ctx) {
    const comment = await Comment.findById(ctx.params.id);
    const index = comment.like.map(id => id.toString()).indexOf(ctx.state.user._id);
    if (index > -1) {
      comment.like.splice(index, 1);
      comment.save();
      ctx.body = {
        status: "success",
        message: "取消点赞成功",
      };
    }
  }
}

module.exports = new CommentCtl();
