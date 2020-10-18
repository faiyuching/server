const Router = require("koa-router");
const jwt = require("koa-jwt");
const router = new Router({ prefix: "/api/user" });
const {
  find,
  findById,
  create,
  update,
  delete: del,
  login,
  checkOwner,
  checkUserExist,
  follow,
  unfollow,
  avatarUpload,
  pictureUpload
} = require("../controllers/user");

const { secret } = require("../conf");
const auth = jwt({ secret });

router.get("/", find);
router.get("/:id", findById);
router.post("/", create);
router.patch("/:id", auth, checkOwner, update);
router.delete("/:id", auth, checkOwner, del);
router.post("/login", login);

router.put("/follow/:id", auth, checkUserExist, follow);
router.delete("/unfollow/:id", auth, checkUserExist, unfollow);

router.post("/update/avatar/:id", auth, checkOwner, avatarUpload);
router.post("/update/picture/:id", auth, checkOwner, pictureUpload);

module.exports = router;
