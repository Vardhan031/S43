const express = require("express");
const Participant = require("../models/Participant");
const Tournament = require("../models/Tournament");
const auth = require("../middleware/auth");

const router = express.Router();

// Add Participant
router.post("/", auth, async (req, res) => {
  try {
    const {
      tournamentId,
      displayName,
    } = req.body;

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

    if (
      tournament.status !== "DRAFT"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Roster additions can only be made in DRAFT status",
      });
    }

    const currentPlayersCount =
      await Participant.countDocuments({
        tournamentId,
      });

    if (
      currentPlayersCount >=
      tournament.totalPlayers
    ) {
      return res.status(400).json({
        success: false,
        message: `Roster is full. Limit is ${tournament.totalPlayers}`,
      });
    }

    const participant =
      await Participant.create({
        tournamentId,
        displayName:
          displayName.trim(),
      });

    res.status(201).json({
      success: true,
      data: participant,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// Bulk Add Participants
router.post("/bulk", auth, async (req, res) => {
  try {
    const {
      tournamentId,
      displayNames,
    } = req.body;

    if (
      !Array.isArray(displayNames)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "displayNames must be an array",
      });
    }

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

    if (
      tournament.status !== "DRAFT"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Roster additions can only be made in DRAFT status",
      });
    }

    const currentCount =
      await Participant.countDocuments({
        tournamentId,
      });

    const remainingSlots =
      tournament.totalPlayers -
      currentCount;

    if (remainingSlots <= 0) {
      return res.status(400).json({
        success: false,
        message:
          "Tournament roster is already full",
      });
    }

    const cleanedNames =
      displayNames
        .map((name) => name.trim())
        .filter(
          (name) => name !== ""
        );

    const playersToAdd =
      cleanedNames.slice(
        0,
        remainingSlots
      );

    const documentsToInsert =
      playersToAdd.map((name) => ({
        tournamentId,
        displayName: name,
      }));

    const addedParticipants =
      await Participant.insertMany(
        documentsToInsert,
        {
          ordered: false,
        }
      );

    res.status(201).json({
      success: true,
      count:
        addedParticipants.length,
      data: addedParticipants,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// Get Participants
router.get(
  "/tournament/:tournamentId",
  async (req, res) => {
    try {
      const participants =
        await Participant.find({
          tournamentId:
            req.params.tournamentId,
        }).sort({
          createdAt: 1,
        });

      res.status(200).json({
        success: true,
        count:
          participants.length,
        data: participants,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
);

// Delete Participant
router.delete("/:id", auth, async (req, res) => {
  try {
    const participant =
      await Participant.findById(
        req.params.id
      );

    if (!participant) {
      return res.status(404).json({
        success: false,
        message: "Player not found",
      });
    }

    const tournament =
      await Tournament.findById(
        participant.tournamentId
      );

    if (
      tournament &&
      tournament.status !==
      "DRAFT"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Players can only be removed while tournament is in DRAFT status",
      });
    }

    await participant.deleteOne();

    res.status(200).json({
      success: true,
      message:
        "Participant removed successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;