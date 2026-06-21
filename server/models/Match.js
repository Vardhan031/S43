const mongoose = require("mongoose");

const matchSchema = new mongoose.Schema(
  {
    tournamentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tournament",
      required: true,
      index: true,
    },

    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      default: null,
      index: true,
    },

    participant1: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Participant",
      default: null,
    },

    participant2: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Participant",
      default: null,
    },

    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Participant",
      default: null,
    },

    score1: {
      type: Number,
      default: null,
      min: 0,
    },

    score2: {
      type: Number,
      default: null,
      min: 0,
    },

    status: {
      type: String,
      enum: ["PENDING", "COMPLETED"],
      default: "PENDING",
      index: true,
    },

    roundNumber: {
      type: Number,
      required: true,
      min: 1,
    },

    legNumber: {
      type: Number,
      required: true,
      default: 1,
    },

    isKnockout: {
      type: Boolean,
      default: false,
      index: true,
    },

    knockoutLabel: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// Better query performance
matchSchema.index({
  tournamentId: 1,
  groupId: 1,
  roundNumber: 1,
});

module.exports = mongoose.model(
  "Match",
  matchSchema
);