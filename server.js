const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();
const PORT = process.env.PORT || 4000;

const DATA_PATH = path.join(__dirname, "projects.json");
const TESTIMONIALS_PATH = path.join(__dirname, "testimonials.json");

app.use(cors({
  origin: ["https://muchtaralianwar.com", "http://localhost:5173"],
  methods: ["GET", "POST", "DELETE", "PUT"],
  credentials: true,
}));

app.use(express.json());

// Load projects.json safely
let projects = [];
try {
  const raw = fs.readFileSync(DATA_PATH, "utf-8");
  const parsed = JSON.parse(raw);
  if (Array.isArray(parsed)) {
    projects = parsed;
  } else {
    console.warn("projects.json is not an array. Initializing empty array.");
  }
} catch (e) {
  console.error("Error loading projects.json:", e.message);
  projects = [];
}

// Load testimonials.json safely
let testimonials = [];
try {
  const raw = fs.readFileSync(TESTIMONIALS_PATH, "utf-8");
  const parsed = JSON.parse(raw);
  if (Array.isArray(parsed)) {
    testimonials = parsed;
  } else {
    console.warn("testimonials.json is not an array. Initializing empty array.");
  }
} catch (e) {
  console.error("Error loading testimonials.json:", e.message);
  testimonials = [];
}

app.get("/", (req, res) => {
  res.send("✅ Portfolio Backend API is running");
});

// === PROJECT ROUTES ===
app.get("/api/projects", (req, res) => {
  res.json(projects);
});

app.get("/api/projects/:id", (req, res) => {
  const { id } = req.params;
  const project = projects.find((p) => p.id === id);
  if (project) {
    res.json(project);
  } else {
    res.status(404).json({ message: "Not found" });
  }
});

app.post("/api/projects", (req, res) => {
  const newProjects = req.body;
  if (!Array.isArray(newProjects)) {
    return res.status(400).json({ message: "Invalid format. Expected an array." });
  }

  projects = newProjects;
  fs.writeFile(DATA_PATH, JSON.stringify(projects, null, 2), (err) => {
    if (err) {
      console.error("Error saving projects.json:", err);
      return res.status(500).json({ message: "Failed to save data." });
    }
    res.json({ message: "Projects saved successfully." });
  });
});

// === TESTIMONIAL ROUTES ===
app.get("/api/testimonials", (req, res) => {
  res.json(testimonials);
});

app.post("/api/testimonials", (req, res) => {
  const newTestimonial = { id: uuidv4(), ...req.body };
  testimonials.unshift(newTestimonial);

  fs.writeFile(TESTIMONIALS_PATH, JSON.stringify(testimonials, null, 2), (err) => {
    if (err) {
      console.error("Error saving testimonials:", err);
      return res.status(500).json({ message: "Save failed" });
    }
    res.json({ message: "Saved", data: newTestimonial });
  });
});

app.delete("/api/testimonials/:id", (req, res) => {
  const { id } = req.params;
  const index = testimonials.findIndex((t) => t.id === id);
  if (index === -1) return res.status(404).json({ message: "Not found" });

  testimonials.splice(index, 1);

  fs.writeFile(TESTIMONIALS_PATH, JSON.stringify(testimonials, null, 2), (err) => {
    if (err) {
      console.error("Failed to save testimonials.json:", err);
      return res.status(500).json({ message: "Error saving file" });
    }
    res.json({ message: "Deleted successfully" });
  });
});

const morgan = require("morgan");
app.use(morgan("dev"));

// === SERVER LISTEN ===
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});

