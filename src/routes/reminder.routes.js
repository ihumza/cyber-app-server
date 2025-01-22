const {
  listUsers,
  addUser,
  editProfile,
  editUser,
  deleteUser,
  getUserByUsername,
} = require("../controllers/user.controller");
const sanitize = require("../middlewares/sanitize-body");

const router = require("express").Router();

router.route("/").get(listUsers);
router.route("/:username").get(getUserByUsername);
router.route("/add").post(sanitize, addUser);
router.route("/:id").put(sanitize, editUser);
router.route("/:id").delete(sanitize, deleteUser);

module.exports = router;
