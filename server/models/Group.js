const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema(
  {
    tournamentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tournament",
      required: true,
      index: true,
    },

    groupName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 20,
    },

    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Participant",
      },
    ],
  },
  { timestamps: true }
);

// Prevent duplicate group names
groupSchema.index(
  {
    tournamentId: 1,
    groupName: 1,
  },
  { unique: true }
);

module.exports = mongoose.model(
  "Group",
  groupSchema
);