const express = require("express");
const Match = require("../models/Match");
const knockoutService = require("../services/knockoutService");
const auth = require("../middleware/auth");

const router = express.Router();

// Generate Knockout Bracket
router.post("/tournaments/:id/generate-knockouts", auth, async (req, res) => {
  try {
    const tournamentId = req.params.id;
    const matches = await knockoutService.generateBracket(tournamentId);
    res.status(200).json({ success: true, count: matches.length, data: matches });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Get Knockout Bracket Details (formatted as rounds for the client tree)
router.get("/knockouts/:tournamentId", async (req, res) => {
  try {
    const tournamentId = req.params.tournamentId;

    // Fetch all knockout matches
    const matches = await Match.find({ tournamentId, isKnockout: true })
      .populate("participant1")
      .populate("participant2")
      .populate("winner")
      .sort({ roundNumber: 1, knockoutLabel: 1 });

    // Group matches into structured rounds (Round 1: QF, Round 2: SF, Round 3: Final)
    const roundsMap = {};
    matches.forEach((match) => {
      const rNum = match.roundNumber;
      if (!roundsMap[rNum]) {
        let roundName = `Round ${rNum}`;
        if (match.knockoutLabel?.startsWith("QF")) roundName = "Quarter Finals";
        else if (match.knockoutLabel?.startsWith("SF")) roundName = "Semi Finals";
        else if (match.knockoutLabel === "FINAL") roundName = "Final";

        roundsMap[rNum] = {
          _id: `round_${rNum}`,
          roundName,
          roundOrder: rNum,
          matches: [],
        };
      }
      roundsMap[rNum].matches.push(match);
    });

    const roundsList = Object.values(roundsMap).sort((left, right) => left.roundOrder - right.roundOrder);
    res.status(200).json({ success: true, data: { rounds: roundsList } });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;
