const Match = require("../models/Match");
const Group = require("../models/Group");
const Tournament = require("../models/Tournament");
const standingsService = require("./standingsService");

const knockoutService = {
  /**
   * Generates knockout stages based on group stage standings
   * @param {string} tournamentId
   */
  async generateBracket(tournamentId) {
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      throw new Error("Tournament not found");
    }

    // 1. Calculate final standings for all groups
    const groupStandings = await standingsService.calculateStandings(tournamentId);
    if (groupStandings.length === 0) {
      throw new Error("No standings found. Group stage must be completed first.");
    }

    // Clear existing knockout matches
    await Match.deleteMany({ tournamentId, isKnockout: true });

    const qCount = tournament.qualificationCount || 2;
    const numGroups = groupStandings.length;

    const matchesToInsert = [];

    // Helper to get qualified player by group index and position (1-indexed)
    const getQualifiedPlayer = (gIndex, pos) => {
      const group = groupStandings[gIndex];
      if (!group || !group.standings) return null;
      const standing = group.standings.find((s) => s.position === pos);
      return standing ? standing.participantId : null;
    };

    if (numGroups >= 4) {
      // Starting round: Quarter Finals (QF)
      // QF1: Group A #1 vs Group B #2
      // QF2: Group C #1 vs Group D #2
      // QF3: Group B #1 vs Group A #2
      // QF4: Group D #1 vs Group C #2
      matchesToInsert.push(
        {
          tournamentId,
          participant1: getQualifiedPlayer(0, 1),
          participant2: getQualifiedPlayer(1, 2),
          roundNumber: 1,
          legNumber: 1,
          isKnockout: true,
          knockoutLabel: "QF1",
          status: "PENDING",
        },
        {
          tournamentId,
          participant1: getQualifiedPlayer(2, 1),
          participant2: getQualifiedPlayer(3, 2),
          roundNumber: 1,
          legNumber: 1,
          isKnockout: true,
          knockoutLabel: "QF2",
          status: "PENDING",
        },
        {
          tournamentId,
          participant1: getQualifiedPlayer(1, 1),
          participant2: getQualifiedPlayer(0, 2),
          roundNumber: 1,
          legNumber: 1,
          isKnockout: true,
          knockoutLabel: "QF3",
          status: "PENDING",
        },
        {
          tournamentId,
          participant1: getQualifiedPlayer(3, 1),
          participant2: getQualifiedPlayer(2, 2),
          roundNumber: 1,
          legNumber: 1,
          isKnockout: true,
          knockoutLabel: "QF4",
          status: "PENDING",
        }
      );

      // Semi Finals (SF) - Placeholders
      matchesToInsert.push(
        {
          tournamentId,
          participant1: null,
          participant2: null,
          roundNumber: 2,
          legNumber: 1,
          isKnockout: true,
          knockoutLabel: "SF1",
          status: "PENDING",
        },
        {
          tournamentId,
          participant1: null,
          participant2: null,
          roundNumber: 2,
          legNumber: 1,
          isKnockout: true,
          knockoutLabel: "SF2",
          status: "PENDING",
        }
      );

      // Final - Placeholder
      matchesToInsert.push({
        tournamentId,
        participant1: null,
        participant2: null,
        roundNumber: 3,
        legNumber: 1,
        isKnockout: true,
        knockoutLabel: "FINAL",
        status: "PENDING",
      });
    } else if (numGroups >= 2) {
      // Starting round: Semi Finals (SF)
      // SF1: Group A #1 vs Group B #2
      // SF2: Group B #1 vs Group A #2
      matchesToInsert.push(
        {
          tournamentId,
          participant1: getQualifiedPlayer(0, 1),
          participant2: getQualifiedPlayer(1, 2),
          roundNumber: 1,
          legNumber: 1,
          isKnockout: true,
          knockoutLabel: "SF1",
          status: "PENDING",
        },
        {
          tournamentId,
          participant1: getQualifiedPlayer(1, 1),
          participant2: getQualifiedPlayer(0, 2),
          roundNumber: 1,
          legNumber: 1,
          isKnockout: true,
          knockoutLabel: "SF2",
          status: "PENDING",
        }
      );

      // Final - Placeholder
      matchesToInsert.push({
        tournamentId,
        participant1: null,
        participant2: null,
        roundNumber: 2,
        legNumber: 1,
        isKnockout: true,
        knockoutLabel: "FINAL",
        status: "PENDING",
      });
    } else {
      // 1 Group: Direct Final
      // Final: Group A #1 vs Group A #2
      matchesToInsert.push({
        tournamentId,
        participant1: getQualifiedPlayer(0, 1),
        participant2: getQualifiedPlayer(0, 2),
        roundNumber: 1,
        legNumber: 1,
        isKnockout: true,
        knockoutLabel: "FINAL",
        status: "PENDING",
      });
    }

    const createdMatches = await Match.insertMany(matchesToInsert);

    // Update tournament status
    tournament.status = "KNOCKOUTS_ACTIVE";
    await tournament.save();

    return createdMatches;
  },

  /**
   * Progresses winner of a knockout match to the next placeholder stage
   * @param {object} completedMatch - The match document that was completed
   */
  async handleKnockoutProgression(completedMatch) {
    if (!completedMatch.isKnockout || completedMatch.status !== "COMPLETED") return;

    const label = completedMatch.knockoutLabel;
    let winnerId = null;

    if (
      completedMatch.score1 >
      completedMatch.score2
    ) {
      winnerId =
        completedMatch.participant1;
    } else if (
      completedMatch.score2 >
      completedMatch.score1
    ) {
      winnerId =
        completedMatch.participant2;
    }
    const tournamentId = completedMatch.tournamentId;

    if (!winnerId) return;

    if (label.startsWith("QF")) {
      // QF1 & QF2 go to SF1. QF3 & QF4 go to SF2.
      if (label === "QF1" || label === "QF2") {
        const nextMatch = await Match.findOne({ tournamentId, knockoutLabel: "SF1" });
        if (nextMatch) {
          if (label === "QF1") nextMatch.participant1 = winnerId;
          else nextMatch.participant2 = winnerId;
          await nextMatch.save();
        }
      } else if (label === "QF3" || label === "QF4") {
        const nextMatch = await Match.findOne({ tournamentId, knockoutLabel: "SF2" });
        if (nextMatch) {
          if (label === "QF3") nextMatch.participant1 = winnerId;
          else nextMatch.participant2 = winnerId;
          await nextMatch.save();
        }
      }
    } else if (label.startsWith("SF")) {
      // SF1 & SF2 go to FINAL
      const nextMatch = await Match.findOne({ tournamentId, knockoutLabel: "FINAL" });
      if (nextMatch) {
        if (label === "SF1") nextMatch.participant1 = winnerId;
        else nextMatch.participant2 = winnerId;
        await nextMatch.save();
      }
    } else if (label === "FINAL") {
      // Final completed! Mark tournament status as COMPLETED
      const tournament = await Tournament.findById(tournamentId);
      if (tournament) {
        tournament.status = "COMPLETED";
        await tournament.save();
      }
    }
  },

  /**
   * Clears winner of a knockout match from the next stage when reset
   * @param {object} completedMatch - The match document that was reset
   */
  async handleKnockoutRegression(completedMatch) {
    if (!completedMatch.isKnockout) return;

    const label = completedMatch.knockoutLabel;
    const tournamentId = completedMatch.tournamentId;

    let nextMatch = null;
    let participantField = null;

    if (label.startsWith("QF")) {
      if (label === "QF1" || label === "QF2") {
        nextMatch = await Match.findOne({ tournamentId, knockoutLabel: "SF1" });
        participantField = label === "QF1" ? "participant1" : "participant2";
      } else if (label === "QF3" || label === "QF4") {
        nextMatch = await Match.findOne({ tournamentId, knockoutLabel: "SF2" });
        participantField = label === "QF3" ? "participant1" : "participant2";
      }
    } else if (label.startsWith("SF")) {
      nextMatch = await Match.findOne({ tournamentId, knockoutLabel: "FINAL" });
      participantField = label === "SF1" ? "participant1" : "participant2";
    }

    if (nextMatch && participantField) {
      nextMatch[participantField] = null;
      nextMatch.score1 = null;
      nextMatch.score2 = null;
      nextMatch.status = "PENDING";
      nextMatch.winner = null;
      await nextMatch.save();

      // Recurse to clear next rounds (SF to FINAL)
      await this.handleKnockoutRegression(nextMatch);
    } else if (label === "FINAL") {
      // If final is reset, revert tournament status to KNOCKOUTS_ACTIVE
      const Tournament = require("../models/Tournament");
      const tournament = await Tournament.findById(tournamentId);
      if (tournament && tournament.status === "COMPLETED") {
        tournament.status = "KNOCKOUTS_ACTIVE";
        await tournament.save();
      }
    }
  }
};

module.exports = knockoutService;
