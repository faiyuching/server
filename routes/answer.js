const Router = require("koa-router");
const jwt = require("koa-jwt");
const router = new Router({ prefix: "/api/answer" });
const {
  find,
  findById,
  create,
  update,
  delete: del,
  checkOwner,
  like,
  unlike,
} = require("../controllers/answer");
const dotenv = require("dotenv");
dotenv.config();
const secret = process.env.TOKEN_SECRET;
const auth = jwt({ secret });

router.get("/", find);

router.get("/:id", findById);

router.post("/", auth, create);

router.patch("/:id", auth, checkOwner, update);

router.delete("/:id", auth, checkOwner, del);

router.put("/:id/like", auth, like);

router.delete("/:id/unlike", auth, unlike);

module.exports = router;
