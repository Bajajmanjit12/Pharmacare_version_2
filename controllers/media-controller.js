// server/controllers/media-controller.js
const path = require("path");
const fs = require("fs");
const Upload = require("../model/upload-model"); // your existing model

// helper: convert stored path (uploads/...) -> public path with leading slash (/uploads/...)
const toPublicPath = (p) => {
  if (!p) return p;
  // normalize slashes
  let normalized = p.replace(/\\/g, "/").trim();
  // If it's an absolute URL, return as-is
  if (/^https?:\/\//i.test(normalized)) return normalized;
  // if it contains 'uploads/' somewhere, extract from that point on
  const idx = normalized.indexOf("/uploads/");
  if (idx >= 0) {
    normalized = normalized.slice(idx + 1); // drop leading slash to make 'uploads/...'
  } else if (normalized.startsWith("uploads/")) {
    // already in desired form
  } else if (normalized.startsWith("./uploads/")) {
    normalized = normalized.slice(2); // ./uploads/... -> uploads/...
  } else {
    // fallback: ensure path is inside uploads by prefixing if it looks like a filename
    if (!normalized.startsWith("/")) normalized = `uploads/${normalized}`;
    else normalized = normalized.slice(1);
  }
  // ensure leading slash for public URL
  return normalized.startsWith("/") ? normalized : `/${normalized}`;
};

// ----------------- POST /new -----------------
const imageUploader = async (req, res, next) => {
  try {
    const { title, isSpecialEdition, date } = req.body;
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ message: "No files uploaded." });
    }

    if (!title) {
      return res.status(400).json({ message: "Title is required." });
    }

    let parsedDate;
    if (date) {
      const tempDate = new Date(date);
      if (isNaN(tempDate)) {
        return res.status(400).json({ message: "Invalid date format." });
      }
      parsedDate = tempDate;
    } else {
      parsedDate = new Date();
    }

    const pages = [];
    let pdfFile = null;

    for (const file of files) {
      const ext = path.extname(file.originalname).toLowerCase();
      // file.path is filesystem path like: /full/path/.../uploads/filename.ext or server\uploads\filename
      const raw = (file.path || "").replace(/\\/g, "/");
      // make relative stored path like uploads/filename.ext (no leading slash)
      let rel;
      const uploadsIndex = raw.indexOf("/uploads/");
      if (uploadsIndex >= 0) {
        rel = raw.slice(uploadsIndex + 1); // drop leading slash
      } else if (raw.includes("uploads/")) {
        // rare windows path like C:/.../uploads/...
        const i = raw.indexOf("uploads/");
        rel = raw.slice(i);
      } else {
        // fallback: use filename under uploads
        rel = `uploads/${file.filename || file.originalname}`;
      }

      if (ext === ".pdf") {
        if (pdfFile) {
          return res.status(400).json({ message: "Only one PDF file is allowed." });
        }
        pdfFile = rel; // store as uploads/filename.pdf
      } else if ([".jpg", ".jpeg", ".png", ".webp"].includes(ext)) {
        pages.push(rel); // store as uploads/filename.jpg
      }
    }

    if (!pdfFile) {
      return res.status(400).json({ message: "A PDF file is required." });
    }

    const newUpload = new Upload({
      title,
      date: parsedDate,
      pages,
      pdfFile,
      isSpecialEdition: isSpecialEdition === "true" || isSpecialEdition === true,
    });

    const saved = await newUpload.save();

    // return public paths (leading slash) so client can do ${API}${pdfFile}
    return res.status(201).json({
      message: "Upload successful",
      data: {
        _id: saved._id,
        title: saved.title,
        date: saved.date,
        isSpecialEdition: saved.isSpecialEdition,
        pdfFile: toPublicPath(saved.pdfFile),
        pages: (saved.pages || []).map((p) => toPublicPath(p)),
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    next(error);
  }
};

// ----------------- GET /data?month=YYYY-MM or date=YYYY-MM-DD -----------------
const getMedia = async (req, res, next) => {
  try {
    const { date, month } = req.query;

    if (date) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return res.status(400).json({ message: "Invalid or missing 'date' parameter. Use format YYYY-MM-DD." });
      }
      const startDate = new Date(`${date}T00:00:00.000Z`);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);

      const uploads = await Upload.find({ date: { $gte: startDate, $lt: endDate } }).sort({ date: -1 });
      const formattedUploads = uploads.map((upload) => ({
        _id: upload._id,
        title: upload.title,
        date: upload.date,
        isSpecialEdition: upload.isSpecialEdition,
        pdfFile: toPublicPath(upload.pdfFile),
        pages: (upload.pages || []).map((imgPath) => toPublicPath(imgPath)),
      }));

      return res.status(200).json({ message: "Uploads fetched successfully", data: formattedUploads });
    } else if (month) {
      const [year, mm] = month.split("-").map(Number);
      if (!year || !mm) return res.status(400).json({ message: "invalid month format" });
      const start = new Date(year, mm - 1, 1);
      const end = new Date(year, mm, 1);
      const uploads = await Upload.find({ date: { $gte: start, $lt: end } }).sort({ date: -1 });
      const formattedUploads = uploads.map((upload) => ({
        _id: upload._id,
        title: upload.title,
        date: upload.date,
        isSpecialEdition: upload.isSpecialEdition,
        pdfFile: toPublicPath(upload.pdfFile),
        pages: (upload.pages || []).map((imgPath) => toPublicPath(imgPath)),
      }));
      return res.status(200).json({ message: "Uploads fetched successfully", data: formattedUploads });
    } else {
      return res.status(400).json({ message: "Provide 'date' (YYYY-MM-DD) or 'month' (YYYY-MM)" });
    }
  } catch (error) {
    console.log(`Error From Get Media: `, error);
    next(error);
  }
};

// ----------------- GET /all -----------------
const getAllMedia = async (req, res, next) => {
  try {
    const list = await Upload.find().sort({ date: -1 });
    const formatted = list.map((upload) => ({
      _id: upload._id,
      title: upload.title,
      date: upload.date,
      isSpecialEdition: upload.isSpecialEdition,
      pdfFile: toPublicPath(upload.pdfFile),
      pages: (upload.pages || []).map((p) => toPublicPath(p)),
    }));
    res.json({ message: "ok", data: formatted });
  } catch (err) {
    next(err);
  }
};

// ----------------- PUT /:id -----------------
const updateMedia = async (req, res, next) => {
  try {
    const id = req.params.id;
    const existing = await Upload.findById(id);
    if (!existing) return res.status(404).json({ message: "Edition not found" });

    const { title, date, isSpecialEdition } = req.body;
    if (typeof title !== "undefined") existing.title = title;
    if (typeof date !== "undefined" && date) {
      const tmp = new Date(date);
      if (isNaN(tmp)) return res.status(400).json({ message: "Invalid date" });
      existing.date = tmp;
    }
    if (typeof isSpecialEdition !== "undefined")
      existing.isSpecialEdition = isSpecialEdition === "true" || isSpecialEdition === true;

    // handle newly uploaded files (req.files)
    const files = req.files || [];
    // find pdf among newly uploaded files
    const pdfObj = files.find((f) => path.extname(f.originalname).toLowerCase() === ".pdf");

    if (pdfObj) {
      // delete old PDF file from disk if exists (existing.pdfFile stored as 'uploads/...')
      if (existing.pdfFile) {
        const oldPdfPath = path.join(__dirname, "..", existing.pdfFile); // safe because existing.pdfFile is relative
        if (fs.existsSync(oldPdfPath)) {
          try { fs.unlinkSync(oldPdfPath); } catch (e) { /* ignore */ }
        }
      }
      // store new pdfFile as relative 'uploads/...'
      const raw = (pdfObj.path || "").replace(/\\/g, "/");
      const uploadsIndex = raw.indexOf("/uploads/");
      let relPdf = uploadsIndex >= 0 ? raw.slice(uploadsIndex + 1) : (raw.includes("uploads/") ? raw.slice(raw.indexOf("uploads/")) : `uploads/${pdfObj.filename || pdfObj.originalname}`);
      existing.pdfFile = relPdf;
    }

    // other files treated as pages -> append to pages array (store as 'uploads/...')
    const pageFiles = files
      .filter((f) => f !== pdfObj)
      .map((f) => {
        const raw = (f.path || "").replace(/\\/g, "/");
        const uploadsIndex = raw.indexOf("/uploads/");
        if (uploadsIndex >= 0) return raw.slice(uploadsIndex + 1);
        if (raw.includes("uploads/")) return raw.slice(raw.indexOf("uploads/"));
        return `uploads/${f.filename || f.originalname}`;
      });

    if (pageFiles.length) {
      existing.pages = (existing.pages || []).concat(pageFiles);
    }

    const saved = await existing.save();
    return res.json({
      message: "updated",
      data: {
        _id: saved._id,
        title: saved.title,
        date: saved.date,
        isSpecialEdition: saved.isSpecialEdition,
        pdfFile: toPublicPath(saved.pdfFile),
        pages: (saved.pages || []).map((p) => toPublicPath(p)),
      },
    });
  } catch (err) {
    next(err);
  }
};

// ----------------- DELETE /:id -----------------
const deleteMedia = async (req, res, next) => {
  try {
    const id = req.params.id;
    const doc = await Upload.findById(id);
    if (!doc) return res.status(404).json({ message: "Edition not found" });

    // delete pdf file (doc.pdfFile stored as 'uploads/...')
    if (doc.pdfFile) {
      const pdfPath = path.join(__dirname, "..", doc.pdfFile);
      if (fs.existsSync(pdfPath)) {
        try { fs.unlinkSync(pdfPath); } catch (e) { /* ignore */ }
      }
    }

    // delete pages files
    if (doc.pages && doc.pages.length) {
      for (const p of doc.pages) {
        const pPath = path.join(__dirname, "..", p);
        if (fs.existsSync(pPath)) {
          try { fs.unlinkSync(pPath); } catch (e) { /* ignore */ }
        }
      }
    }

    await Upload.findByIdAndDelete(id);
    return res.json({ message: "deleted" });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  imageUploader,
  getMedia,
  getAllMedia,
  updateMedia,
  deleteMedia,
};
