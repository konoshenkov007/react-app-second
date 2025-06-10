const router = require("express").Router();
const uploadImage = require("../controller/uploadController");
router.route("/upload").post(uploadImage);

module.exports = router;