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

app.use(express.json({ limit: "10mb" }));

app.use(
  express.urlencoded({
    limit: "10mb",
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
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log("No users found in database. Seeding default admin user...");
      await User.create({
        username: "admin",
        password: "admin123"
      });
      console.log("-----------------------------------------");
      console.log("DEFAULT ADMIN CREATED:");
      console.log("Username: admin");
      console.log("Password: admin123");
      console.log("Please change this password or create a new admin as soon as possible!");
      console.log("-----------------------------------------");
    }
  } catch (error) {
    console.error(`Failed to seed default admin: ${error.message}`);
  }
};

// Start Server
connectDB()
  .then(async () => {
    await seedDefaultAdmin();
    app.listen(PORT, () => {
      console.log(
        `Server running on port ${PORT}`
      );
    });
  })
  .catch((error) => {
    console.error(
      `Failed to start server: ${error.message}`
    );

    process.exit(1);
  });