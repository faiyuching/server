const jsonwebtoken = require("jsonwebtoken");
const path = require("path");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv")
dotenv.config()

class UserCtl {
  async find(ctx) {
    if (ctx.query.filter !== "undefined" && ctx.query.id !== "undefined") {
      if (ctx.query.filter === "following") {
        const users = await User.findById(ctx.query.id)
          .select("+following")
          .populate("following");
        ctx.body = users.following;
      }
      if (ctx.query.filter === "followers") {
        const users = await User.findById(ctx.query.id)
          .select("+followers")
          .populate("followers");
        ctx.body = users.followers;
      }
    } else {
      ctx.body = await User.find();
    }
  }

  async findById(ctx) {
    const user = await User.findById(ctx.params.id)
      .select("+telephone")
      .select("+city")
      .select("+field")
      .select("+skill");
    ctx.body = user;
  }

  async create(ctx) {
    ctx.verifyParams({
      username: { type: "string", required: true },
      telephone: { type: "string", required: true },
      password: { type: "string", required: true },
    });

    const { telephone } = ctx.request.body;
    const findUserTel = await User.findOne({ telephone });
    if (findUserTel) {
      ctx.body = {
        status: "fail",
        message: "手机号已被注册",
      };
    }
    if (!findUserTel) {
      try {
        ctx.request.body.password = await bcrypt.hash(
          ctx.request.body.password,
          12
        );
      } catch (err) {
        console.log(err);
      }
      await new User(ctx.request.body).save();
      ctx.body = {
        status: "success",
        message: "注册成功",
      };
    }
  }

  async checkOwner(ctx, next) {
    if (ctx.params.id !== ctx.state.user._id) {
      ctx.body = {
        status: "fail",
        message: "没有权限",
      };
    } else {
      await next();
    }
  }

  async update(ctx) {
    if (ctx.request.body.telephone) {
      const { telephone } = ctx.request.body;
      const user = await User.findOne({ telephone });
      if (user) {
        ctx.body = {
          status: "fail",
          message: "手机号已被注册",
        };
      }
      if (!user) {
        await User.findByIdAndUpdate(ctx.params.id, ctx.request.body);
        ctx.body = {
          status: "success",
          message: "修改成功",
        };
      }
    }
    if (ctx.request.body.password) {
      const user = await User.findOne({_id:ctx.params.id}).select("+password");
      if (user) {
        try {
          ctx.request.body.password = await bcrypt.hash( ctx.request.body.password, 12 );
          await User.findByIdAndUpdate(ctx.params.id, ctx.request.body);
          ctx.body = {
            status: "success",
            message: "修改成功",
          };
        } catch (err) {
          ctx.body = {
            status: "fail",
            message: "修改失败",
          };
        }
      }
      if (!user) {
        ctx.body = {
          status: "fail",
          message: "用户不存在",
        };
      }
    }
    if (
      ctx.request.body.username ||
      ctx.request.body.introduction ||
      ctx.request.body.city ||
      ctx.request.body.field ||
      ctx.request.body.skill
    ) {
      await User.findByIdAndUpdate(ctx.params.id, ctx.request.body);
      ctx.body = {
        status: "success",
        message: "修改成功",
      };
    }
  }

  async delete(ctx) {
    await User.findByIdAndRemove(ctx.params.id);
    ctx.body = {
      status: "success",
      message: "删除成功",
    };
  }

  async login(ctx) {
    ctx.verifyParams({
      telephone: { type: "string", required: true },
      password: { type: "string", required: true },
    });

    const user = await User.findOne({
      telephone: ctx.request.body.telephone,
    }).select("+password");
    if (!user) {
      // ctx.throw(401, "用户名或密码不正确");
      ctx.body = {
        status: "fail",
        message: "手机号未注册",
      };
    } else {
      const match = await bcrypt.compare(
        ctx.request.body.password,
        user.password
      );
      if (match) {
        const { _id, username } = user;
        const token = jsonwebtoken.sign({ _id, username }, process.env.TOKEN_SECRET, {
          expiresIn: "1d",
        });
        ctx.body = {
          status: "success",
          message: "登录成功",
          token: token,
        };
      } else {
        ctx.body = {
          status: "fail",
          message: "密码错误",
        };
      }
    }
  }

  async checkUserExist(ctx, next) {
    const user = await User.findById(ctx.params.id);
    if (!user) {
      ctx.body = {
        status: "fail",
        message: "用户不存在",
      };
    } else {
      await next();
    }
  }
  async follow(ctx) {
    const me = await User.findById(ctx.state.user._id).select("+following");
    if (!me.following.map((id) => id.toString()).includes(ctx.params.id)) {
      me.following.push(ctx.params.id);
      me.save();
    }
    const you = await User.findById(ctx.params.id).select("+followers");
    if (
      !you.followers.map((id) => id.toString()).includes(ctx.state.user._id)
    ) {
      you.followers.push(ctx.state.user._id);
      you.save();
    }
    ctx.body = {
      status: "success",
      message: "关注成功",
    };
  }
  async unfollow(ctx) {
    const me = await User.findById(ctx.state.user._id).select("+following");
    const index1 = me.following
      .map((id) => id.toString())
      .indexOf(ctx.params.id);
    if (index1 > -1) {
      me.following.splice(index1, 1);
      me.save();
    }
    const you = await User.findById(ctx.params.id).select("+followers");
    const index2 = you.followers
      .map((id) => id.toString())
      .indexOf(ctx.state.user._id);
    if (index2 > -1) {
      you.followers.splice(index2, 1);
      you.save();
    }
    ctx.body = {
      status: "success",
      message: "取关成功",
    };
  }

  async avatarUpload(ctx) {
    // console.log("host",ctx.request.header.origin)
    const avatar = ctx.request.files.avatar;
    const basename = path.basename(avatar.path);
    const avatarUrl = `${ctx.request.header.origin}/uploads/${basename}`;
    const user = await User.findById(ctx.params.id);
    user.avatar = avatarUrl;
    user.save();
    if (user) {
      ctx.body = {
        status: "success",
        message: "修改成功",
      };
    }
  }

  async pictureUpload(ctx) {
    // console.log(ctx.request.files.avatar)
    const picture = ctx.request.files.picture;
    const basename = path.basename(picture.path);
    const pictureUrl = `${ctx.request.header.origin}/uploads/${basename}`;
    const user = await User.findById(ctx.params.id);
    user.picture = pictureUrl;
    user.save();
    if (user) {
      ctx.body = {
        status: "success",
        message: "修改成功",
      };
    }
  }
}

module.exports = new UserCtl();
