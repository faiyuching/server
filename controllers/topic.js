const Topic = require("../models/topic");
const Question = require("../models/question");
class TopicCtl {
  async find(ctx) {
    let topics = [];
    if (ctx.query.filter === "all") {
      topics = await Topic.find();
    }
    ctx.body = topics;
  }

  async findById(ctx) {
    const topic = await Topic.findById(ctx.params.id)
      .select("+creator")
      .select("+description");
    ctx.body = topic;
  }

  async create(ctx) {
    ctx.verifyParams({
      name: { type: "string", required: true },
    });
    const { name } = ctx.request.body;
    const topic = await Topic.findOne({ name });
    if (topic) {
      ctx.body = {
        status: "fail",
        message: "话题已存在",
      };
    } else {
      await new Topic(ctx.request.body).save();
      ctx.body = {
        status: "success",
        message: "创建成功",
      };
    }
  }

  async checkOwner(ctx, next) {
    const topic = await Topic.findById(ctx.params.id).select("+creator");
    if (topic.creator != ctx.state.user._id) {
      ctx.body = {
        status: "fail",
        message: "没有权限",
      };
    } else {
      await next();
    }
  }

  async update(ctx) {
    ctx.verifyParams({
      name: { type: "string", required: false },
      description: { type: "string", required: false },
    });
    const topic = await Topic.findByIdAndUpdate(
      ctx.params.id,
      ctx.request.body
    );
    if (topic) {
      ctx.body = {
        status: "success",
        message: "修改成功",
      };
    } else {
      ctx.body = {
        status: "fail",
        message: "修改失败",
      };
    }
  }

  async delete(ctx) {
    const topics = await Question.find({ topic: ctx.params.id });
    if (topics.length !== 0) {
      ctx.body = {
        status: "fail",
        message: "该话题下有帖子，无法删除",
      };
    } else {
      await Topic.findByIdAndRemove(ctx.params.id);
      ctx.body = {
        status: "success",
        message: "删除成功",
      };
    }
  }
}

module.exports = new TopicCtl();
