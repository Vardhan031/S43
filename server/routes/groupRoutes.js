const express = require("express");
const Group = require("../models/Group");
const groupService = require("../services/groupService");
const auth = require("../middleware/auth");

const router = express.Router();

// Generate Groups
router.post("/generate", auth, async (req, res) => {
  try {
    const { tournamentId } = req.body;
    const groups = await groupService.generateGroups(tournamentId);
    res.status(200).json({ success: true, count: groups.length, data: groups });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.get("/tournament/:tournamentId", async (req, res) => {
  try {
    const groups = await Group.find({ tournamentId: req.params.tournamentId })
      .sort({ groupName: 1 })
      .populate("participants");
    res.status(200).json({ success: true, count: groups.length, data: groups });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;
