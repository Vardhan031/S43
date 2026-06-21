const mongoose = require("mongoose");

const tournamentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [
        true,
        "Tournament name is required",
      ],
      trim: true,
      maxlength: 60,
    },

    mode: {
      type: String,
      enum: ["VSA", "H2H"],
      required: [
        true,
        "Tournament mode (VSA or H2H) is required",
      ],
    },

    totalPlayers: {
      type: Number,
      required: [
        true,
        "Total players count is required",
      ],
      min: [
        2,
        "Must have at least 2 players",
      ],
    },

    totalGroups: {
      type: Number,
      required: [
        true,
        "Total groups count is required",
      ],
      min: [
        1,
        "Must have at least 1 group",
      ],
    },

    qualificationCount: {
      type: Number,
      required: [
        true,
        "Qualification count is required",
      ],
      default: 2,
      min: 1,
    },

    status: {
      type: String,
      enum: [
        "DRAFT",
        "GROUPS_GENERATED",
        "FIXTURES_ACTIVE",
        "KNOCKOUTS_ACTIVE",
        "COMPLETED",
      ],
      default: "DRAFT",
    },
    logoUrl: {
      type: String,
      trim: true,
      default: "",
    },
    champion: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "Tournament",
  tournamentSchema
);