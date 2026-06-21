const Match = require("../models/Match");
const Group = require("../models/Group");
const Tournament = require("../models/Tournament");

const fixtureService = {
  async generateFixtures(tournamentId) {
    const tournament = await Tournament.findById(
      tournamentId
    );

    if (!tournament) {
      throw new Error("Tournament not found");
    }

    const groups = await Group.find({
      tournamentId,
    });

    if (groups.length === 0) {
      throw new Error(
        "No groups generated for this tournament"
      );
    }

    // Remove old group fixtures
    await Match.deleteMany({
      tournamentId,
      isKnockout: false,
    });

    const matchesToInsert = [];

    for (const group of groups) {
      const players = [...group.participants];

      if (players.length < 2) continue;

      const isOdd =
        players.length % 2 !== 0;

      if (isOdd) {
        players.push(null);
      }

      const numPlayers = players.length;
      const roundsPerLeg =
        numPlayers - 1;

      // -------- LEG 1 --------
      const leg1 = [...players];

      for (
        let round = 1;
        round <= roundsPerLeg;
        round++
      ) {
        for (
          let index = 0;
          index < numPlayers / 2;
          index++
        ) {
          const home = leg1[index];

          const away =
            leg1[numPlayers - 1 - index];

          if (
            home !== null &&
            away !== null
          ) {
            matchesToInsert.push({
              tournamentId,
              groupId: group._id,

              participant1: home,
              participant2: away,

              roundNumber: round,
              legNumber: 1,

              status: "PENDING",
              isKnockout: false,
            });
          }
        }

        // rotate
        leg1.splice(
          1,
          0,
          leg1.pop()
        );
      }

      // -------- LEG 2 --------
      const leg2 = [...players];

      for (
        let round = 1;
        round <= roundsPerLeg;
        round++
      ) {
        for (
          let index = 0;
          index < numPlayers / 2;
          index++
        ) {
          const home = leg2[index];

          const away =
            leg2[numPlayers - 1 - index];

          if (
            home !== null &&
            away !== null
          ) {
            matchesToInsert.push({
              tournamentId,
              groupId: group._id,

              // reverse fixture
              participant1: away,
              participant2: home,

              roundNumber:
                roundsPerLeg + round,

              legNumber: 2,

              status: "PENDING",
              isKnockout: false,
            });
          }
        }

        // rotate
        leg2.splice(
          1,
          0,
          leg2.pop()
        );
      }
    }

    const createdMatches =
      await Match.insertMany(
        matchesToInsert
      );

    tournament.status =
      "FIXTURES_ACTIVE";

    await tournament.save();

    return createdMatches;
  },
};

module.exports = fixtureService;