const Group = require("../models/Group");
const Match = require("../models/Match");

const standingsService = {
  async calculateStandings(
    tournamentId
  ) {
    const groups = await Group.find({
      tournamentId,
    }).populate("participants");

    const results = [];

    for (const group of groups) {
      const standingsMap =
        new Map();

      // Initialize
      group.participants.forEach(
        (player) => {
          standingsMap.set(
            player._id.toString(),
            {
              participantId:
                player._id.toString(),

              displayName:
                player.displayName,

              played: 0,
              wins: 0,
              draws: 0,
              losses: 0,

              goalsFor: 0,
              goalsAgainst: 0,
              goalDifference: 0,

              points: 0,
            }
          );
        }
      );

      // Completed matches
      const completedMatches =
        await Match.find({
          tournamentId,
          groupId: group._id,

          status: "COMPLETED",
          isKnockout: false,
        });

      completedMatches.forEach(
        (match) => {
          const p1Id =
            match.participant1?.toString();

          const p2Id =
            match.participant2?.toString();

          const p1Stats =
            standingsMap.get(p1Id);

          const p2Stats =
            standingsMap.get(p2Id);

          if (
            !p1Stats ||
            !p2Stats
          )
            return;

          const s1 =
            match.score1 ?? 0;

          const s2 =
            match.score2 ?? 0;

          p1Stats.played += 1;
          p2Stats.played += 1;

          // Goals
          p1Stats.goalsFor += s1;
          p1Stats.goalsAgainst += s2;

          p2Stats.goalsFor += s2;
          p2Stats.goalsAgainst += s1;

          // Results
          if (s1 > s2) {
            p1Stats.wins += 1;
            p1Stats.points += 3;

            p2Stats.losses += 1;
          } else if (s2 > s1) {
            p2Stats.wins += 1;
            p2Stats.points += 3;

            p1Stats.losses += 1;
          } else {
            p1Stats.draws += 1;
            p1Stats.points += 1;

            p2Stats.draws += 1;
            p2Stats.points += 1;
          }
        }
      );

      const standingsList =
        Array.from(
          standingsMap.values()
        ).map((row) => {
          row.goalDifference =
            row.goalsFor -
            row.goalsAgainst;

          return row;
        });

      // Sorting
      standingsList.sort(
        (left, right) => {
          if (
            right.points !==
            left.points
          ) {
            return (
              right.points -
              left.points
            );
          }

          if (
            right.goalDifference !==
            left.goalDifference
          ) {
            return (
              right.goalDifference -
              left.goalDifference
            );
          }

          if (
            right.goalsFor !==
            left.goalsFor
          ) {
            return (
              right.goalsFor -
              left.goalsFor
            );
          }

          return left.displayName.localeCompare(
            right.displayName
          );
        }
      );

      const rankedStandings =
        standingsList.map(
          (row, index) => ({
            position: index + 1,
            ...row,
          })
        );

      results.push({
        groupId:
          group._id.toString(),

        groupName:
          group.groupName,

        standings:
          rankedStandings,
      });
    }

    return results;
  },
};

module.exports =
  standingsService;