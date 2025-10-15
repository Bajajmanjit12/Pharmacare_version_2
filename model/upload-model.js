const mongoose = require("mongoose");

const uploadSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  pages: {
    type: [String], // Array of image URLs or file paths
    validate: {
      validator: function (arr) {
        return arr.every((item) => typeof item === "string");
      },
      message: "Each page must be a string path.",
    },
  },
  pdfFile: {
    type: String, // Path or URL to PDF file
    required: true,
  },
  isSpecialEdition: {
    type: Boolean,
    required: true,
    // default: false,
  },
});

const Upload = new mongoose.model("Upload", uploadSchema);

module.exports = Upload;