const mongoose = require("mongoose");
const { initializeApp } = require("firebase/app");
const { getFirestore, collection, addDoc } = require("firebase/firestore");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("MONGODB_URI missing in server/.env");
  process.exit(1);
}

// Firebase configuration using Web Client SDK
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "AIzaSyDemoApiKeyForS43Platform",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "s43-esports.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "s43-esports",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "s43-esports.firebasestorage.app",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "1234567890",
  appId: process.env.FIREBASE_APP_ID || "1:1234567890:web:abcdef123456"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Mongoose Models
const Tournament = mongoose.model("Tournament", new mongoose.Schema({}, { strict: false }));
const Participant = mongoose.model("Participant", new mongoose.Schema({}, { strict: false }));
const Group = mongoose.model("Group", new mongoose.Schema({}, { strict: false }));
const Match = mongoose.model("Match", new mongoose.Schema({}, { strict: false }));

async function migrateData() {
  console.log("==================================================");
  console.log("Migrating Data from MongoDB to Firebase Firestore");
  console.log("==================================================");

  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);
  console.log("✓ Connected to MongoDB.");

  // 1. Migrate Tournaments
  const tournaments = await Tournament.find({});
  console.log(`Found ${tournaments.length} tournaments in MongoDB.`);

  const tournamentIdMap = new Map();

  for (const t of tournaments) {
    const mongoId = t._id.toString();
    const data = {
      name: t.get("name") || "Untitled Tournament",
      mode: t.get("mode") || "VSA",
      totalPlayers: t.get("totalPlayers") || 4,
      totalGroups: t.get("totalGroups") || 1,
      qualificationCount: t.get("qualificationCount") || 2,
      status: t.get("status") || "DRAFT",
      logoUrl: t.get("logoUrl") || "",
      champion: t.get("champion") || "",
      createdAt: t.createdAt ? t.createdAt.toISOString() : new Date().toISOString(),
      updatedAt: t.updatedAt ? t.updatedAt.toISOString() : new Date().toISOString()
    };

    const docRef = await addDoc(collection(db, "tournaments"), data);
    tournamentIdMap.set(mongoId, docRef.id);
    console.log(`  ✓ Tournament migrated: "${data.name}" (Mongo: ${mongoId} -> Firestore: ${docRef.id})`);
  }

  // 2. Migrate Participants
  const participants = await Participant.find({});
  console.log(`\nFound ${participants.length} participants in MongoDB.`);

  const participantIdMap = new Map();

  for (const p of participants) {
    const mongoId = p._id.toString();
    const mongoTourneyId = p.get("tournamentId")?.toString();
    const firestoreTourneyId = tournamentIdMap.get(mongoTourneyId) || mongoTourneyId;

    const data = {
      tournamentId: firestoreTourneyId,
      displayName: p.get("displayName") || "Player",
      createdAt: p.createdAt ? p.createdAt.toISOString() : new Date().toISOString()
    };

    const docRef = await addDoc(collection(db, "participants"), data);
    participantIdMap.set(mongoId, { id: docRef.id, displayName: data.displayName });
    console.log(`  ✓ Participant migrated: "${data.displayName}" (${docRef.id})`);
  }

  // 3. Migrate Groups
  const groups = await Group.find({});
  console.log(`\nFound ${groups.length} groups in MongoDB.`);

  const groupIdMap = new Map();

  for (const g of groups) {
    const mongoId = g._id.toString();
    const mongoTourneyId = g.get("tournamentId")?.toString();
    const firestoreTourneyId = tournamentIdMap.get(mongoTourneyId) || mongoTourneyId;

    const mongoParticipantIds = g.get("participants") || [];
    const participantIds = [];
    const mappedParticipants = [];

    for (const pId of mongoParticipantIds) {
      const pidStr = pId.toString();
      const pInfo = participantIdMap.get(pidStr);
      if (pInfo) {
        participantIds.push(pInfo.id);
        mappedParticipants.push({ id: pInfo.id, displayName: pInfo.displayName });
      }
    }

    const data = {
      tournamentId: firestoreTourneyId,
      groupName: g.get("groupName") || "Group A",
      participantIds,
      participants: mappedParticipants,
      createdAt: g.createdAt ? g.createdAt.toISOString() : new Date().toISOString()
    };

    const docRef = await addDoc(collection(db, "groups"), data);
    groupIdMap.set(mongoId, docRef.id);
    console.log(`  ✓ Group migrated: "${data.groupName}" (${docRef.id})`);
  }

  // 4. Migrate Matches
  const matches = await Match.find({});
  console.log(`\nFound ${matches.length} matches in MongoDB.`);

  for (const m of matches) {
    const mongoTourneyId = m.get("tournamentId")?.toString();
    const mongoGroupId = m.get("groupId")?.toString();
    const mongoP1Id = m.get("participant1")?.toString();
    const mongoP2Id = m.get("participant2")?.toString();
    const mongoWinnerId = m.get("winner")?.toString();

    const firestoreTourneyId = tournamentIdMap.get(mongoTourneyId) || mongoTourneyId;
    const firestoreGroupId = mongoGroupId ? groupIdMap.get(mongoGroupId) || mongoGroupId : null;

    const p1Info = mongoP1Id ? participantIdMap.get(mongoP1Id) : null;
    const p2Info = mongoP2Id ? participantIdMap.get(mongoP2Id) : null;
    const winnerInfo = mongoWinnerId ? participantIdMap.get(mongoWinnerId) : null;

    const data = {
      tournamentId: firestoreTourneyId,
      groupId: firestoreGroupId,
      participant1Id: p1Info ? p1Info.id : null,
      participant1Name: p1Info ? p1Info.displayName : null,
      participant2Id: p2Info ? p2Info.id : null,
      participant2Name: p2Info ? p2Info.displayName : null,
      winnerId: winnerInfo ? winnerInfo.id : null,
      winnerName: winnerInfo ? winnerInfo.displayName : null,
      score1: m.get("score1") !== undefined ? m.get("score1") : null,
      score2: m.get("score2") !== undefined ? m.get("score2") : null,
      status: m.get("status") || "PENDING",
      roundNumber: m.get("roundNumber") || 1,
      legNumber: m.get("legNumber") || 1,
      isKnockout: m.get("isKnockout") || false,
      knockoutLabel: m.get("knockoutLabel") || null,
      createdAt: m.createdAt ? m.createdAt.toISOString() : new Date().toISOString(),
      updatedAt: m.updatedAt ? m.updatedAt.toISOString() : new Date().toISOString()
    };

    const docRef = await addDoc(collection(db, "matches"), data);
    console.log(`  ✓ Match migrated (Round ${data.roundNumber}): ${data.participant1Name || 'TBD'} vs ${data.participant2Name || 'TBD'}`);
  }

  console.log("\n==================================================");
  console.log("Migration Complete Successfully!");
  console.log("==================================================");

  await mongoose.disconnect();
  process.exit(0);
}

migrateData().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
