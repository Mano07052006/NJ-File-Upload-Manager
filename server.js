// server.js
import express from "express";
import multer from "multer";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Resolve __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// CORS for React frontend
app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());

// Upload folder
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Serve uploaded files statically
app.use("/uploads", express.static(uploadDir));

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) =>
    cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`),
});
const upload = multer({ storage });

// ======================== ROUTES ========================

// Test route
app.get("/", (req, res) => res.send("📁 File Upload Manager API Running"));

// Upload files
app.post("/upload", upload.array("files"), (req, res) => {
  console.log("Upload request received");
  if (!req.files || req.files.length === 0) {
    console.log("No files received");
    return res.status(400).json({ message: "No files uploaded" });
  }
  console.log("Files received:", req.files.map(f => f.filename));
  const files = req.files.map(f => ({
    filename: f.filename,
    path: `/uploads/${f.filename}`,
    size: f.size,
    mimetype: f.mimetype,
    uploadedAt: new Date(),
  }));
  res.status(200).json({ message: "✅ Files uploaded successfully", files });
});

// List all uploaded files
app.get("/files", (req, res) => {
  try {
    const fileList = fs.readdirSync(uploadDir).map(filename => {
      const filepath = path.join(uploadDir, filename);
      const stats = fs.statSync(filepath);
      return {
        filename,
        path: `/uploads/${filename}`,
        size: stats.size,
        uploadedAt: stats.birthtime,
      };
    });
    res.json(fileList);
  } catch (err) {
    console.error("Error fetching files:", err);
    res.status(500).json({ message: "Failed to fetch files", error: err.message });
  }
});

// Download a file
app.get("/download/:filename", (req, res) => {
  const filepath = path.join(uploadDir, req.params.filename);
  if (!fs.existsSync(filepath)) return res.status(404).send("File not found");
  console.log("Downloading file:", req.params.filename);
  res.download(filepath);
});

// Delete a file
app.delete("/delete/:filename", (req, res) => {
  const filepath = path.join(uploadDir, req.params.filename);
  if (!fs.existsSync(filepath)) return res.status(404).send("File not found");
  fs.unlinkSync(filepath);
  console.log("Deleted file:", req.params.filename);
  res.json({ message: "✅ File deleted successfully" });
});

// ======================== START SERVER ========================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
