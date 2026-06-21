const express = require("express");

const Tournament = require("../models/Tournament");
const Participant = require("../models/Participant");
const Group = require("../models/Group");
const Match = require("../models/Match");
const auth = require("../middleware/auth");

const router = express.Router();

// Create Tournament
router.post("/", auth, async (req, res) => {
  try {
    const {
      name,
      mode,
      totalPlayers,
      totalGroups,
      qualificationCount,
      logoUrl,
    } = req.body;

    const tournament =
      await Tournament.create({
        name,
        mode,
        totalPlayers,
        totalGroups,
        qualificationCount:
          qualificationCount || 2,
        logoUrl: logoUrl || "",
      });

    res.status(201).json({
      success: true,
      data: tournament,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// List Tournaments
router.get("/", async (req, res) => {
  try {
    const tournaments =
      await Tournament.find().sort({
        createdAt: -1,
      });

    res.status(200).json({
      success: true,
      data: tournaments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Get Tournament
router.get("/:id", async (req, res) => {
  try {
    const tournament =
      await Tournament.findById(
        req.params.id
      );

    if (!tournament) {
      return res.status(404).json({
        success: false,
        message:
          "Tournament not found",
      });
    }

    res.status(200).json({
      success: true,
      data: tournament,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// Reset Tournament
router.post(
  "/:id/reset",
  auth,
  async (req, res) => {
    try {
      const tournamentId =
        req.params.id;

      const tournament =
        await Tournament.findById(
          tournamentId
        );

      if (!tournament) {
        return res.status(404).json({
          success: false,
          message:
            "Tournament not found",
        });
      }

      await Group.deleteMany({
        tournamentId,
      });

      await Match.deleteMany({
        tournamentId,
      });

      tournament.status = "DRAFT";

      await tournament.save();

      res.status(200).json({
        success: true,
        message:
          "Tournament reset successfully",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
);

// Delete Tournament
router.delete("/:id", auth, async (req, res) => {
  try {
    const tournamentId =
      req.params.id;

    const tournament =
      await Tournament.findByIdAndDelete(
        tournamentId
      );

    if (!tournament) {
      return res.status(404).json({
        success: false,
        message:
          "Tournament not found",
      });
    }

    await Participant.deleteMany({
      tournamentId,
    });

    await Group.deleteMany({
      tournamentId,
    });

    await Match.deleteMany({
      tournamentId,
    });

    res.status(200).json({
      success: true,
      message:
        "Tournament deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;