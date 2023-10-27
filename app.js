const express = require("express");
const cors = require("cors");
const expressRateLimit = require("express-rate-limit");
const expressMongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const hpp = require("hpp");
const xss = require("xss-clean");
const multer = require("multer");
const fs = require("fs");
const pdfkit = require("pdfkit");
const errorController = require("./controllers/errorController");

// * Express
const app = express();

// * Cors configuration
const allowedOrigins = ["https://localhost:3000", "https://mernpdf.vercel.app"];

app.use(
  cors({
    origin: function (origin, cb) {
      if (allowedOrigins.includes(origin) || !origin) cb(null, true);
      else cb(new Error("Not allowed by CORS!"));
    },
    credentials: true,
  })
);

// * API Limit
const limit = expressRateLimit({
  max: 100,
  windowsMs: 60 * 60 * 1000,
  message: "Too many requests.",
  standartHeaders: true,
  legacyHeaders: false,
});

app.use(express.json({ limit }));

// * Security
app.use(expressMongoSanitize());
app.use(helmet());
app.use(hpp());
app.use(xss());

// * Multer
const storage = multer.memoryStorage();
const upload = multer({ storage });

app.get("/", (req, res) => res.redirect("https://hsyntes.com"));

// * Convert img to pdf
app.post("/convert", upload.array("images", 10), (req, res) => {
  const images = req.files;
  const pdfPath = "MERNpdf.pdf";

  const doc = new pdfkit();

  // * File System Stream
  const pdfStream = fs.createWriteStream(pdfPath);

  // * Bind two stream
  doc.pipe(pdfStream);

  if (images.length > 0)
    images.forEach((image) => {
      doc.image(image.buffer, {
        fit: [500, 300],
        align: "center",
        valign: "center",
      });

      doc.addPage();
    });

  doc.end();

  // * Sending the file
  pdfStream.on("finish", () => res.sendFile(pdfPath, { root: __dirname }));
});

// * Error handling
app.use(errorController);

module.exports = app;
