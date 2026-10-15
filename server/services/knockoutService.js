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

    // Helper to find group by letter or fallback index
    const findGroup = (letter, fallbackIdx) => {
      return (
        groupStandings.find(
          (g) =>
            (g.groupName && g.groupName.toUpperCase().includes(`GROUP ${letter}`)) ||
            (g.groupName && g.groupName.toUpperCase().trim() === letter)
        ) || groupStandings[fallbackIdx]
      );
    };

    // Helper to get qualified player by group object and position (1-indexed)
    const getQualifiedPlayer = (groupObj, pos) => {
      if (!groupObj || !groupObj.standings) return null;
      const standing = groupObj.standings.find((s) => s.position === pos);
      return standing ? standing.participantId : null;
    };

    if (numGroups >= 4) {
      // Starting round: Quarter Finals (QF)
      // Top 2 Group A vs Top 2 Group C
      // Top 2 Group B vs Top 2 Group D
      const groupA = findGroup("A", 0);
      const groupB = findGroup("B", 1);
      const groupC = findGroup("C", 2);
      const groupD = findGroup("D", 3);

      // Bracket structure places same-group qualifiers in opposite halves:
      // SF1 fed by QF1 (A1 vs C2) & QF2 (B1 vs D2)
      // SF2 fed by QF3 (C1 vs A2) & QF4 (D1 vs B2)
      matchesToInsert.push(
        {
          tournamentId,
          participant1: getQualifiedPlayer(groupA, 1),
          participant2: getQualifiedPlayer(groupC, 2),
          roundNumber: 1,
          legNumber: 1,
          isKnockout: true,
          knockoutLabel: "QF1",
          status: "PENDING",
        },
        {
          tournamentId,
          participant1: getQualifiedPlayer(groupB, 1),
          participant2: getQualifiedPlayer(groupD, 2),
          roundNumber: 1,
          legNumber: 1,
          isKnockout: true,
          knockoutLabel: "QF2",
          status: "PENDING",
        },
        {
          tournamentId,
          participant1: getQualifiedPlayer(groupC, 1),
          participant2: getQualifiedPlayer(groupA, 2),
          roundNumber: 1,
          legNumber: 1,
          isKnockout: true,
          knockoutLabel: "QF3",
          status: "PENDING",
        },
        {
          tournamentId,
          participant1: getQualifiedPlayer(groupD, 1),
          participant2: getQualifiedPlayer(groupB, 2),
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
      const groupA = findGroup("A", 0);
      const groupB = findGroup("B", 1);

      matchesToInsert.push(
        {
          tournamentId,
          participant1: getQualifiedPlayer(groupA, 1),
          participant2: getQualifiedPlayer(groupB, 2),
          roundNumber: 1,
          legNumber: 1,
          isKnockout: true,
          knockoutLabel: "SF1",
          status: "PENDING",
        },
        {
          tournamentId,
          participant1: getQualifiedPlayer(groupB, 1),
          participant2: getQualifiedPlayer(groupA, 2),
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
      const groupA = findGroup("A", 0);
      matchesToInsert.push({
        tournamentId,
        participant1: getQualifiedPlayer(groupA, 1),
        participant2: getQualifiedPlayer(groupA, 2),
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
