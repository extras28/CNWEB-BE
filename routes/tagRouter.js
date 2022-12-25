const express = require("express");
const tagController = require("../controllers/tagController");
const router = express.Router();

//create
router.post("/api/v1/tag/create", tagController.create);

module.exports = router;
