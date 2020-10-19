const Koa = require("koa");
const app = new Koa();
const routing = require("./routes");
const error = require("koa-json-error");
const koaBody = require("koa-body");
const path = require("path");
const koaStatic = require("koa-static");
const parameter = require("koa-parameter");
const mongoose = require("mongoose");
const sendFile = require("koa-sendfile");
const dotenv = require("dotenv")
dotenv.config()

mongoose.connect(
  process.env.MONGO_URL,
  { useNewUrlParser: true, useUnifiedTopology: true },
  () => {
    console.log("mongoose is running...");
  }
);
mongoose.connection.on("error", console.error);
mongoose.set("useFindAndModify", false);

// app.use(koaStatic(path.resolve('build/index.html')))
app.use(koaStatic(path.join(__dirname, "build")));

app.use(async function (ctx, next) {
  await sendFile(ctx, path.join(__dirname, "build", "index.html"));
  await next();
});

app.use(
  error({
    postFormat: (e, { stack, ...rest }) =>
      process.env.NODE_ENV === "production" ? rest : { stack, ...rest },
  })
);
app.use(
  koaBody({
    multipart: true,
    formidable: {
      uploadDir: path.join(__dirname, "build", "uploads"),
      keepExtensions: true,
    },
  })
);

app.use(parameter(app));
routing(app);

app.listen(process.env.PORT, () => {
  console.log("server running...");
});
