const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const connectDB = require("./config/db");

// Routes
const authRoutes = require("./routes/authRoutes");
const tournamentRoutes = require("./routes/tournamentRoutes");
const participantRoutes = require("./routes/participantRoutes");
const groupRoutes = require("./routes/groupRoutes");
const matchRoutes = require("./routes/matchRoutes");
const standingsRoutes = require("./routes/standingsRoutes");
const knockoutRoutes = require("./routes/knockoutRoutes");

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());

app.use(express.json({ limit: "50mb" }));

app.use(
  express.urlencoded({
    limit: "50mb",
    extended: true,
  })
);

// Root Route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message:
      "FC Mobile Tournament Management Platform API",
  });
});

// Routes
app.use("/api/auth", authRoutes);

app.use(
  "/api/tournaments",
  tournamentRoutes
);

app.use(
  "/api/participants",
  participantRoutes
);

app.use(
  "/api/groups",
  groupRoutes
);

app.use(
  "/api/matches",
  matchRoutes
);

app.use(
  "/api/standings",
  standingsRoutes
);

// Knockout Routes
app.use("/api", knockoutRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Global Error Handler
app.use(
  (err, req, res, next) => {
    console.error(err.stack);

    res.status(
      err.statusCode || 500
    ).json({
      success: false,
      message:
        err.message ||
        "Internal Server Error",
    });
  }
);

// Seed default admin helper
const seedDefaultAdmin = async () => {
  const User = require("./models/User");
  try {
    // Delete legacy default insecure admin if it exists
    const legacyAdmin = await User.findOne({ username: "admin" });
    if (legacyAdmin) {
      console.log("Legacy default admin 'admin' found. Removing for security...");
      await User.deleteOne({ username: "admin" });
      console.log("Legacy 'admin' removed successfully.");
    }

    // Ensure the new secure admin exists
    const secureAdminUsername = "notapro@s43.com";
    const secureAdmin = await User.findOne({ username: secureAdminUsername });
    if (!secureAdmin) {
      console.log(`Seeding secure admin user (${secureAdminUsername})...`);
      await User.create({
        username: secureAdminUsername,
        password: "Not@pros43"
      });
      console.log("-----------------------------------------");
      console.log("SECURE ADMIN CREATED:");
      console.log(`Username: ${secureAdminUsername}`);
      console.log("Password: Not@pros43");
      console.log("-----------------------------------------");
    }
  } catch (error) {
    console.error(`Failed to seed/migrate default admin: ${error.message}`);
  }
};

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
  // Connect to database in the background
  connectDB()
    .then(async () => {
      await seedDefaultAdmin();
    })
    .catch((error) => {
      console.error(`Failed to initialize database: ${error.message}`);
    });
});