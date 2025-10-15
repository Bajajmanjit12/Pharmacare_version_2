// server/routers/upload-router.js
const express = require("express");
const router = express.Router();

const multer = require("multer");
const path = require("path");
const mediaControllers = require("../controllers/media-controller");

// Multer storage configuration (keep your same behaviour)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "..", "uploads"));
  },
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "_" + Date.now() + "_" + Math.round(Math.random() * 1e9) + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage });

// POST /api/upload/new
router.post("/new", upload.array("files", 20), mediaControllers.imageUploader);

// GET /api/upload/data?month=YYYY-MM (your existing endpoint)
router.get("/data", mediaControllers.getMedia);

// GET /api/upload/all - list all uploads (new)
router.get("/all", mediaControllers.getAllMedia);

// PUT /api/upload/:id - update an edition (new)
router.put("/:id", upload.array("files", 20), mediaControllers.updateMedia);

// DELETE /api/upload/:id - delete an edition (new)
router.delete("/:id", mediaControllers.deleteMedia);

module.exports = router;
