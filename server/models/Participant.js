const mongoose = require("mongoose");

const participantSchema =
  new mongoose.Schema(
    {
      tournamentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tournament",
        required: true,
        index: true,
      },

      displayName: {
        type: String,
        required: [
          true,
          "Player display name is required",
        ],
        trim: true,
        maxlength: 30,
      },
    },
    { timestamps: true }
  );

// Unique player names per tournament
participantSchema.index(
  {
    tournamentId: 1,
    displayName: 1,
  },
  { unique: true }
);

module.exports = mongoose.model(
  "Participant",
  participantSchema
);