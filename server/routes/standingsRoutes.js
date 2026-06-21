const express = require("express");
const standingsService = require("../services/standingsService");

const router = express.Router();

// Get Tournament Standings
router.get("/:tournamentId", async (req, res) => {
  try {
    const standings = await standingsService.calculateStandings(req.params.tournamentId);
    res.status(200).json({ success: true, data: standings });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;
