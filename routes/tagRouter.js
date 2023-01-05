const express = require("express");
const tagController = require("../controllers/tagController");
const router = express.Router();

//create
router.post("/api/v1/tag/create", tagController.create);
//find
router.get("/api/v1/tag/find", tagController.find);
//delete
router.delete("/api/v1/tag/delete", tagController.delete);
//update
router.put("/api/v1/tag/update", tagController.update);
// get personally
router.get("/api/v1/tag/find-by-person", tagController.findPersonally);

module.exports = router;
