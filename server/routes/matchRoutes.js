const express = require("express");
const Match = require("../models/Match");
const fixtureService = require("../services/fixtureService");
const knockoutService = require("../services/knockoutService");
const auth = require("../middleware/auth");

const router = express.Router();

// Generate Fixtures
router.post("/generate", auth, async (req, res) => {
  try {
    const { tournamentId } = req.body;

    const matches =
      await fixtureService.generateFixtures(
        tournamentId
      );

    res.status(200).json({
      success: true,
      count: matches.length,
      data: matches,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// Get Tournament Matches
router.get(
  "/tournament/:tournamentId",
  async (req, res) => {
    try {
      const matches = await Match.find({
        tournamentId:
          req.params.tournamentId,
      })
        .populate("participant1")
        .populate("participant2")
        .populate("winner")
        .sort({
          roundNumber: 1,
          legNumber: 1,
          createdAt: 1,
        });

      res.status(200).json({
        success: true,
        count: matches.length,
        data: matches,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
);

// Update Match Result
router.patch("/:id", auth, async (req, res) => {
  try {
    const { score1, score2, reset } = req.body;

    const match =
      await Match.findById(req.params.id);

    if (!match) {
      return res.status(404).json({
        success: false,
        message: "Match not found",
      });
    }

    if (reset) {
      match.score1 = null;
      match.score2 = null;
      match.status = "PENDING";
      match.winner = null;

      await match.save();

      // Regress subsequent knockouts if applicable
      if (match.isKnockout) {
        await knockoutService.handleKnockoutRegression(match);
      }

      await match.populate("participant1");
      await match.populate("participant2");
      await match.populate("winner");

      return res.status(200).json({
        success: true,
        data: match,
      });
    }

    match.score1 = Number(score1);
    match.score2 = Number(score2);

    match.status = "COMPLETED";

    // Winner Logic
    if (match.score1 > match.score2) {
      match.winner =
        match.participant1;
    } else if (
      match.score2 > match.score1
    ) {
      match.winner =
        match.participant2;
    } else {
      // Draws not allowed in knockouts
      if (match.isKnockout) {
        return res.status(400).json({
          success: false,
          message:
            "Knockout matches cannot end in a draw",
        });
      }

      match.winner = null;
    }

    await match.save();

    await match.populate(
      "participant1"
    );

    await match.populate(
      "participant2"
    );

    await match.populate("winner");

    // Progress knockout bracket
    if (match.isKnockout) {
      await knockoutService.handleKnockoutProgression(
        match
      );
    }

    res.status(200).json({
      success: true,
      data: match,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;