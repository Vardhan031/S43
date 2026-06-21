const Group = require("../models/Group");
const Participant = require("../models/Participant");
const Tournament = require("../models/Tournament");

const groupService = {
  /**
   * Shuffles participants and divides them equally into groups
   * @param {string} tournamentId
   */
  async generateGroups(tournamentId) {
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      throw new Error("Tournament not found");
    }

    // Fetch all registered participants
    const participants = await Participant.find({ tournamentId });
    if (participants.length !== tournament.totalPlayers) {
      throw new Error(
        `Registered players count (${participants.length}) does not match tournament capacity (${tournament.totalPlayers})`
      );
    }

    // Clear any existing groups and fixtures
    await Group.deleteMany({ tournamentId });

    // Shuffle participants randomly (Fisher-Yates shuffle)
    const shuffled = [...participants];
    for (let index = shuffled.length - 1; index > 0; index--) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
    }

    const totalGroups = tournament.totalGroups;
    const playersPerGroup = Math.ceil(shuffled.length / totalGroups);

    const groupsToInsert = [];
    for (let index = 0; index < totalGroups; index++) {
      const start = index * playersPerGroup;
      const end = start + playersPerGroup;
      const groupPlayers = shuffled.slice(start, end);

      // Group name: "Group A", "Group B", etc.
      const groupName = `Group ${String.fromCharCode(65 + index)}`;

      groupsToInsert.push({
        tournamentId,
        groupName,
        participants: groupPlayers.map((player) => player._id),
      });
    }

    const createdGroups = await Group.insertMany(groupsToInsert);

    // Update tournament status
    tournament.status = "GROUPS_GENERATED";
    await tournament.save();

    return createdGroups;
  },
};

module.exports = groupService;
