const Router = require("koa-router");
const jwt = require("koa-jwt");
const router = new Router({ prefix: "/api/comment" });
const {
  find,
  findById,
  create,
  update,
  delete: del,
  checkOwner,
  like,
  unlike
} = require("../controllers/comment");

const { secret } = require("../conf");
const auth = jwt({ secret });

router.get("/", find);

router.get("/:id", findById);

router.post("/", auth, create);

router.patch("/:id", auth, checkOwner, update);

router.delete("/:id", auth, checkOwner, del);

router.put("/:id/like", auth, like);

router.delete("/:id/unlike", auth, unlike);

module.exports = router;
