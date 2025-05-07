const fs = require("fs");
const express = require("express");
const path = require("path");
const QRCode = require("qrcode");
const multer = require("multer");
require("dotenv").config();
const app = express();

fs.mkdirSync("uploads", { recursive: true });

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const PORT = process.env.PORT;

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

app.post("/upload", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded");
  }
  const fileUrl = `http://localhost:${PORT}/uploads/${req.file.filename}`;

  try {
    const qrCodeUrl = await QRCode.toDataURL(fileUrl);
    res.send(
      `<h1>File uploaded successfully</h1>
            <p>Download URL: <a href=${fileUrl} target="_blank">${fileUrl}</a></p>
            <img src="${qrCodeUrl}" alt="QR Code" />`
    );
  } catch (error) {
    console.error(error.message);
    res.status(444).json({
      message: "Error while generating QR Code",
    });
  }
});

app.get("/", (req, res) => {
  res.send(`
        <h1>Upload file</h1>
        <form action="/upload" method="post" enctype="multipart/form-data">
        <input type="file" name="file" required />
        <button type="submit">Upload</button>
        </form>`);
});

app.listen(PORT, () => {
  console.log(`Server is running on localhost: ${PORT}`);
});
