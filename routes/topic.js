const Router = require("koa-router");
const jwt = require("koa-jwt");
const router = new Router({ prefix: "/api/topic" });
const {
  find,
  findById,
  create,
  update,
  delete: del,
  checkOwner
} = require("../controllers/topic");
const dotenv = require("dotenv")
dotenv.config()
const secret  = process.env.TOKEN_SECRET;
const auth = jwt({ secret });

router.get("/", find);

router.get("/:id", findById);

router.post("/", auth, create);

router.patch("/:id", auth, checkOwner, update);

router.delete("/:id", auth, checkOwner, del);

module.exports = router;
