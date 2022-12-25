const express = require("express");
const tagController = require("../controllers/tagController");
const router = express.Router();

//create
router.post("/api/v1/tag/create", tagController.create);
//find
router.get("/api/v1/tag/find", tagController.find);

module.exports = router;
