import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  writeBatch
} from "firebase/firestore";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from "firebase/auth";
import { db, auth, isFirebaseConfigured } from "./firebase";
import {
  Tournament,
  Participant,
  Group,
  Match,
  StandingGroup,
  StandingRow,
  KnockoutRound
} from "../types";

/* ==========================================================================
   LOCAL FALLBACK STORE (Used when VITE_FIREBASE_API_KEY is demo/empty)
   ========================================================================== */
const LOCAL_STORAGE_KEY = "s43_local_db";

interface LocalStore {
  tournaments: Tournament[];
  participants: Participant[];
  groups: Group[];
  matches: Match[];
}

const getLocalStore = (): LocalStore => {
  const defaultStore: LocalStore = {
    tournaments: [
      {
        id: "tourney_demo_1",
        name: "Scorching Showdown",
        mode: "H2H",
        totalPlayers: 8,
        totalGroups: 2,
        qualificationCount: 2,
        status: "FIXTURES_ACTIVE",
        logoUrl: "/fall_frenzy_logo.png",
        createdAt: new Date().toISOString()
      }
    ],
    participants: [],
    groups: [],
    matches: []
  };

  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    return data ? JSON.parse(data) : defaultStore;
  } catch (e) {
    return defaultStore;
  }
};

const saveLocalStore = (store: LocalStore) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(store));
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("localstore_updated"));
    }
  } catch (e) {
    console.warn("Failed to save local store", e);
  }
};

/* ==========================================================================
   IMAGE COMPRESSION HELPER
   ========================================================================== */
export function compressImage(dataUrl: string, maxWidth = 300, maxHeight = 300): Promise<string> {
  return new Promise((resolve) => {
    if (!dataUrl || typeof window === "undefined" || !dataUrl.startsWith("data:image")) {
      resolve(dataUrl);
      return;
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = dataUrl;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/webp", 0.85));
      } else {
        resolve(dataUrl);
      }
    };
    img.onerror = () => resolve(dataUrl);
  });
}

/* ==========================================================================
   TOURNAMENTS SERVICE
   ========================================================================== */
export const tournamentService = {
  async getAll(): Promise<Tournament[]> {
    const localTourneys = getLocalStore().tournaments;
    if (!isFirebaseConfigured || !db) {
      return localTourneys;
    }
    try {
      const q = query(collection(db, "tournaments"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const remoteTourneys = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Tournament));

      const map = new Map<string, Tournament>();
      [...remoteTourneys, ...localTourneys].forEach((t) => {
        if (!map.has(t.id)) map.set(t.id, t);
      });
      return Array.from(map.values());
    } catch (e) {
      return localTourneys;
    }
  },

  subscribeAll(callback: (tournaments: Tournament[]) => void) {
    const emitMerged = (remoteData: Tournament[]) => {
      const localData = getLocalStore().tournaments;
      const map = new Map<string, Tournament>();
      [...remoteData, ...localData].forEach((t) => {
        if (!map.has(t.id)) map.set(t.id, t);
      });
      callback(Array.from(map.values()));
    };

    if (!isFirebaseConfigured || !db) {
      const handler = () => callback(getLocalStore().tournaments);
      handler();
      if (typeof window !== "undefined") {
        window.addEventListener("localstore_updated", handler);
      }
      return () => {
        if (typeof window !== "undefined") {
          window.removeEventListener("localstore_updated", handler);
        }
      };
    }
    try {
      const q = query(collection(db, "tournaments"), orderBy("createdAt", "desc"));
      return onSnapshot(
        q,
        (snapshot) => {
          const remoteData = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Tournament));
          emitMerged(remoteData);
        },
        (err) => {
          console.warn("[Firestore] Falling back to local store:", err.message);
          callback(getLocalStore().tournaments);
        }
      );
    } catch (e) {
      callback(getLocalStore().tournaments);
      return () => {};
    }
  },

  async getById(id: string): Promise<Tournament> {
    const localT = getLocalStore().tournaments.find((t) => t.id === id);
    if (!isFirebaseConfigured || !db) {
      if (!localT) throw new Error("Tournament not found");
      return localT;
    }
    try {
      const docRef = doc(db, "tournaments", id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const remoteT = { id: snap.id, ...snap.data() } as Tournament;
        const store = getLocalStore();
        if (!store.tournaments.some((t) => t.id === remoteT.id)) {
          store.tournaments.push(remoteT);
          saveLocalStore(store);
        }
        return remoteT;
      }
      if (localT) return localT;
      throw new Error("Tournament not found");
    } catch (e) {
      if (localT) return localT;
      throw new Error("Tournament not found");
    }
  },

  subscribeById(id: string, callback: (tournament: Tournament | null) => void) {
    const getLocal = () => getLocalStore().tournaments.find((t) => t.id === id) || null;

    if (!isFirebaseConfigured || !db) {
      callback(getLocal());
      const handler = () => callback(getLocal());
      if (typeof window !== "undefined") {
        window.addEventListener("localstore_updated", handler);
      }
      return () => {
        if (typeof window !== "undefined") {
          window.removeEventListener("localstore_updated", handler);
        }
      };
    }
    try {
      const docRef = doc(db, "tournaments", id);
      return onSnapshot(
        docRef,
        (snap) => {
          if (snap.exists()) {
            const remoteT = { id: snap.id, ...snap.data() } as Tournament;
            callback(remoteT);
          } else {
            callback(getLocal());
          }
        },
        (err) => {
          callback(getLocal());
        }
      );
    } catch (e) {
      callback(getLocal());
      return () => {};
    }
  },

  async create(payload: Partial<Tournament>): Promise<Tournament> {
    let logo = payload.logoUrl || "/fall_frenzy_logo.png";
    if (logo.startsWith("data:image")) {
      logo = await compressImage(logo);
    }

    const newDoc = {
      name: payload.name || "New Tournament",
      mode: payload.mode || "VSA",
      totalPlayers: payload.totalPlayers || 4,
      totalGroups: payload.totalGroups || 1,
      qualificationCount: payload.qualificationCount || 2,
      status: "DRAFT" as const,
      logoUrl: logo,
      champion: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const store = getLocalStore();
    const tempId = `tourney_${Date.now()}`;
    const createdLocally: Tournament = { id: tempId, ...newDoc };
    store.tournaments = [createdLocally, ...store.tournaments.filter((t) => t.id !== tempId)];
    saveLocalStore(store);

    if (isFirebaseConfigured && db) {
      try {
        const ref = await addDoc(collection(db, "tournaments"), newDoc);
        const createdRemotely: Tournament = { id: ref.id, ...newDoc };
        const currentStore = getLocalStore();
        currentStore.tournaments = [
          createdRemotely,
          ...currentStore.tournaments.filter((t) => t.id !== tempId && t.id !== ref.id)
        ];
        saveLocalStore(currentStore);
        return createdRemotely;
      } catch (err) {
        console.warn("[Firestore] Remote save failed, preserved in local storage:", err);
      }
    }

    return createdLocally;
  },

  async reset(id: string): Promise<void> {
    const store = getLocalStore();
    store.groups = store.groups.filter((g) => g.tournamentId !== id);
    store.matches = store.matches.filter((m) => m.tournamentId !== id);
    const t = store.tournaments.find((t) => t.id === id);
    if (t) {
      t.status = "DRAFT";
      t.champion = "";
    }
    saveLocalStore(store);

    if (isFirebaseConfigured && db) {
      try {
        const batch = writeBatch(db);
        const gSnap = await getDocs(query(collection(db, "groups"), where("tournamentId", "==", id)));
        gSnap.docs.forEach((d) => batch.delete(d.ref));

        const mSnap = await getDocs(query(collection(db, "matches"), where("tournamentId", "==", id)));
        mSnap.docs.forEach((d) => batch.delete(d.ref));

        const tRef = doc(db, "tournaments", id);
        batch.update(tRef, { status: "DRAFT", champion: "", updatedAt: new Date().toISOString() });
        await batch.commit();
      } catch (e) {
        console.warn("[Firestore] Remote reset failed:", e);
      }
    }
  },

  async delete(id: string): Promise<void> {
    const store = getLocalStore();
    store.tournaments = store.tournaments.filter((t) => t.id !== id);
    store.participants = store.participants.filter((p) => p.tournamentId !== id);
    store.groups = store.groups.filter((g) => g.tournamentId !== id);
    store.matches = store.matches.filter((m) => m.tournamentId !== id);
    saveLocalStore(store);

    if (isFirebaseConfigured && db) {
      try {
        const batch = writeBatch(db);
        const pSnap = await getDocs(query(collection(db, "participants"), where("tournamentId", "==", id)));
        pSnap.docs.forEach((d) => batch.delete(d.ref));

        const gSnap = await getDocs(query(collection(db, "groups"), where("tournamentId", "==", id)));
        gSnap.docs.forEach((d) => batch.delete(d.ref));

        const mSnap = await getDocs(query(collection(db, "matches"), where("tournamentId", "==", id)));
        mSnap.docs.forEach((d) => batch.delete(d.ref));

        batch.delete(doc(db, "tournaments", id));
        await batch.commit();
      } catch (err) {
        console.warn("[Firestore] Remote delete failed:", err);
      }
    }
  },

  async update(id: string, updates: Partial<Tournament>): Promise<void> {
    if (updates.logoUrl && updates.logoUrl.startsWith("data:image")) {
      updates.logoUrl = await compressImage(updates.logoUrl);
    }

    const store = getLocalStore();
    const t = store.tournaments.find((t) => t.id === id);
    if (t) {
      Object.assign(t, updates, { updatedAt: new Date().toISOString() });
      saveLocalStore(store);
    }

    if (isFirebaseConfigured && db) {
      try {
        const tRef = doc(db, "tournaments", id);
        await updateDoc(tRef, { ...updates, updatedAt: new Date().toISOString() });
      } catch (err) {
        console.warn("[Firestore] Remote update failed, preserved in local storage:", err);
      }
    }
  }
};

/* ==========================================================================
   PARTICIPANTS SERVICE
   ========================================================================== */
export const participantService = {
  async getByTournament(tournamentId: string): Promise<Participant[]> {
    if (!isFirebaseConfigured || !db) {
      return getLocalStore().participants.filter((p) => p.tournamentId === tournamentId);
    }
    try {
      const q = query(collection(db, "participants"), where("tournamentId", "==", tournamentId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Participant));
    } catch (e) {
      return getLocalStore().participants.filter((p) => p.tournamentId === tournamentId);
    }
  },

  async add(tournamentId: string, displayName: string): Promise<Participant> {
    const pData = {
      tournamentId,
      displayName: displayName.trim(),
      createdAt: new Date().toISOString()
    };

    if (!isFirebaseConfigured || !db) {
      const store = getLocalStore();
      const created: Participant = { id: `part_${Date.now()}_${Math.random()}`, ...pData };
      store.participants.push(created);
      saveLocalStore(store);
      return created;
    }

    const ref = await addDoc(collection(db, "participants"), pData);
    return { id: ref.id, ...pData };
  },

  async bulkAdd(tournamentId: string, displayNames: string[]): Promise<Participant[]> {
    const created: Participant[] = [];
    for (const name of displayNames) {
      if (!name.trim()) continue;
      const p = await this.add(tournamentId, name);
      created.push(p);
    }
    return created;
  },

  async remove(id: string): Promise<void> {
    if (!isFirebaseConfigured || !db) {
      const store = getLocalStore();
      store.participants = store.participants.filter((p) => p.id !== id);
      saveLocalStore(store);
      return;
    }
    await deleteDoc(doc(db, "participants", id));
  }
};

/* ==========================================================================
   GROUPS SERVICE
   ========================================================================== */
export const groupService = {
  async getByTournament(tournamentId: string): Promise<Group[]> {
    if (!isFirebaseConfigured || !db) {
      return getLocalStore().groups.filter((g) => g.tournamentId === tournamentId);
    }
    try {
      const q = query(collection(db, "groups"), where("tournamentId", "==", tournamentId), orderBy("groupName", "asc"));
      const snapshot = await getDocs(q);
      return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Group));
    } catch (e) {
      return getLocalStore().groups.filter((g) => g.tournamentId === tournamentId);
    }
  },

  async generate(tournamentId: string): Promise<Group[]> {
    const tournament = await tournamentService.getById(tournamentId);
    const participants = await participantService.getByTournament(tournamentId);

    if (participants.length < tournament.totalPlayers) {
      throw new Error(`Not enough players. Expected ${tournament.totalPlayers}, got ${participants.length}`);
    }

    const shuffled = [...participants].sort(() => Math.random() - 0.5);
    const createdGroups: Group[] = [];
    const totalGroups = tournament.totalGroups;
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    for (let i = 0; i < totalGroups; i++) {
      const groupName = `Group ${alphabet[i] || i + 1}`;
      const groupParticipants = shuffled.filter((_, idx) => idx % totalGroups === i);

      const gData = {
        tournamentId,
        groupName,
        participantIds: groupParticipants.map((p) => p.id),
        participants: groupParticipants,
        createdAt: new Date().toISOString()
      };

      if (!isFirebaseConfigured || !db) {
        const created: Group = { id: `group_${Date.now()}_${i}`, ...gData };
        createdGroups.push(created);
      } else {
        const ref = await addDoc(collection(db, "groups"), gData);
        createdGroups.push({ id: ref.id, ...gData });
      }
    }

    if (!isFirebaseConfigured || !db) {
      const store = getLocalStore();
      store.groups = store.groups.filter((g) => g.tournamentId !== tournamentId).concat(createdGroups);
      const t = store.tournaments.find((t) => t.id === tournamentId);
      if (t) t.status = "GROUPS_GENERATED";
      saveLocalStore(store);
    } else {
      await updateDoc(doc(db, "tournaments", tournamentId), {
        status: "GROUPS_GENERATED",
        updatedAt: new Date().toISOString()
      });
    }

    return createdGroups;
  }
};

/* ==========================================================================
   MATCHES SERVICE
   ========================================================================== */
export const matchService = {
  async getByTournament(tournamentId: string): Promise<Match[]> {
    if (!isFirebaseConfigured || !db) {
      const matches = getLocalStore().matches.filter((m) => m.tournamentId === tournamentId);
      return matches.sort((a, b) => a.roundNumber - b.roundNumber || a.legNumber - b.legNumber);
    }
    try {
      const q = query(collection(db, "matches"), where("tournamentId", "==", tournamentId));
      const snapshot = await getDocs(q);
      const matches = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Match));
      return matches.sort((a, b) => a.roundNumber - b.roundNumber || a.legNumber - b.legNumber);
    } catch (e) {
      const matches = getLocalStore().matches.filter((m) => m.tournamentId === tournamentId);
      return matches.sort((a, b) => a.roundNumber - b.roundNumber || a.legNumber - b.legNumber);
    }
  },

  subscribeByTournament(tournamentId: string, callback: (matches: Match[]) => void) {
    if (!isFirebaseConfigured || !db) {
      const handler = () => {
        const matches = getLocalStore().matches.filter((m) => m.tournamentId === tournamentId);
        matches.sort((a, b) => a.roundNumber - b.roundNumber || a.legNumber - b.legNumber);
        callback(matches);
      };
      handler();
      if (typeof window !== "undefined") {
        window.addEventListener("localstore_updated", handler);
      }
      return () => {
        if (typeof window !== "undefined") {
          window.removeEventListener("localstore_updated", handler);
        }
      };
    }
    try {
      const q = query(collection(db, "matches"), where("tournamentId", "==", tournamentId));
      return onSnapshot(
        q,
        (snapshot) => {
          const matches = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Match));
          matches.sort((a, b) => a.roundNumber - b.roundNumber || a.legNumber - b.legNumber);
          callback(matches);
        },
        (err) => {
          const matches = getLocalStore().matches.filter((m) => m.tournamentId === tournamentId);
          matches.sort((a, b) => a.roundNumber - b.roundNumber || a.legNumber - b.legNumber);
          callback(matches);
        }
      );
    } catch (e) {
      const matches = getLocalStore().matches.filter((m) => m.tournamentId === tournamentId);
      matches.sort((a, b) => a.roundNumber - b.roundNumber || a.legNumber - b.legNumber);
      callback(matches);
      return () => {};
    }
  },

  async generateFixtures(tournamentId: string): Promise<Match[]> {
    const groups = await groupService.getByTournament(tournamentId);
    if (groups.length === 0) throw new Error("No groups generated yet");

    const matchesToCreate: any[] = [];

    for (const group of groups) {
      const players = [...group.participants];
      if (players.length < 2) continue;

      if (players.length % 2 !== 0) {
        players.push(null as any);
      }

      const numPlayers = players.length;
      const roundsPerLeg = numPlayers - 1;

      // Leg 1
      const leg1 = [...players];
      for (let round = 1; round <= roundsPerLeg; round++) {
        for (let index = 0; index < numPlayers / 2; index++) {
          const home = leg1[index];
          const away = leg1[numPlayers - 1 - index];
          if (home && away) {
            matchesToCreate.push({
              tournamentId,
              groupId: group.id,
              participant1Id: home.id,
              participant1Name: home.displayName,
              participant2Id: away.id,
              participant2Name: away.displayName,
              winnerId: null,
              winnerName: null,
              score1: null,
              score2: null,
              status: "PENDING",
              roundNumber: round,
              legNumber: 1,
              isKnockout: false,
              knockoutLabel: null,
              createdAt: new Date().toISOString()
            });
          }
        }
        leg1.splice(1, 0, leg1.pop()!);
      }

      // Leg 2
      const leg2 = [...players];
      for (let round = 1; round <= roundsPerLeg; round++) {
        for (let index = 0; index < numPlayers / 2; index++) {
          const home = leg2[index];
          const away = leg2[numPlayers - 1 - index];
          if (home && away) {
            matchesToCreate.push({
              tournamentId,
              groupId: group.id,
              participant1Id: away.id,
              participant1Name: away.displayName,
              participant2Id: home.id,
              participant2Name: home.displayName,
              winnerId: null,
              winnerName: null,
              score1: null,
              score2: null,
              status: "PENDING",
              roundNumber: roundsPerLeg + round,
              legNumber: 2,
              isKnockout: false,
              knockoutLabel: null,
              createdAt: new Date().toISOString()
            });
          }
        }
        leg2.splice(1, 0, leg2.pop()!);
      }
    }

    const created: Match[] = [];

    if (!isFirebaseConfigured || !db) {
      const store = getLocalStore();
      store.matches = store.matches.filter((m) => m.tournamentId !== tournamentId || m.isKnockout);
      matchesToCreate.forEach((mData, idx) => {
        const m: Match = { id: `match_${Date.now()}_${idx}`, ...mData };
        created.push(m);
        store.matches.push(m);
      });
      const t = store.tournaments.find((t) => t.id === tournamentId);
      if (t) t.status = "FIXTURES_ACTIVE";
      saveLocalStore(store);
      return created;
    }

    for (const mData of matchesToCreate) {
      const ref = await addDoc(collection(db, "matches"), mData);
      created.push({ id: ref.id, ...mData });
    }

    await updateDoc(doc(db, "tournaments", tournamentId), {
      status: "FIXTURES_ACTIVE",
      updatedAt: new Date().toISOString()
    });

    return created;
  },

  async updateScore(matchId: string, score1: number | null, score2: number | null, reset = false): Promise<Match> {
    let updatedMatch: Match;

    if (!isFirebaseConfigured || !db) {
      const store = getLocalStore();
      const match = store.matches.find((m) => m.id === matchId);
      if (!match) throw new Error("Match not found");

      if (reset) {
        match.score1 = null;
        match.score2 = null;
        match.status = "PENDING";
        match.winnerId = null;
        match.winnerName = null;
      } else {
        const s1 = Number(score1);
        const s2 = Number(score2);
        match.score1 = s1;
        match.score2 = s2;
        match.status = "COMPLETED";
        if (s1 > s2) {
          match.winnerId = match.participant1Id;
          match.winnerName = match.participant1Name;
        } else if (s2 > s1) {
          match.winnerId = match.participant2Id;
          match.winnerName = match.participant2Name;
        }
      }
      saveLocalStore(store);
      updatedMatch = match;
    } else {
      const matchRef = doc(db, "matches", matchId);
      const snap = await getDoc(matchRef);
      if (!snap.exists()) throw new Error("Match not found");
      const match = { id: snap.id, ...snap.data() } as Match;

      if (reset) {
        const updateData = {
          score1: null,
          score2: null,
          status: "PENDING",
          winnerId: null,
          winnerName: null,
          updatedAt: new Date().toISOString()
        };
        await updateDoc(matchRef, updateData);
        updatedMatch = { ...match, ...updateData } as Match;
      } else {
        const s1 = Number(score1);
        const s2 = Number(score2);

        let winnerId: string | null = null;
        let winnerName: string | null = null;

        if (s1 > s2) {
          winnerId = match.participant1Id;
          winnerName = match.participant1Name;
        } else if (s2 > s1) {
          winnerId = match.participant2Id;
          winnerName = match.participant2Name;
        }

        const updateData = {
          score1: s1,
          score2: s2,
          status: "COMPLETED",
          winnerId,
          winnerName,
          updatedAt: new Date().toISOString()
        };

        await updateDoc(matchRef, updateData);
        updatedMatch = { ...match, ...updateData } as Match;
      }
    }

    if (updatedMatch.isKnockout) {
      await advanceKnockoutWinner(updatedMatch.tournamentId, updatedMatch);
    }

    return updatedMatch;
  }
};

async function advanceKnockoutWinner(tournamentId: string, updatedMatch: Match) {
  if (!updatedMatch.isKnockout || !updatedMatch.knockoutLabel) return;

  const label = updatedMatch.knockoutLabel.toUpperCase();
  let targetLabel: string | null = null;
  let targetSlot: 1 | 2 = 1;

  if (label === "QF1") { targetLabel = "SF1"; targetSlot = 1; }
  else if (label === "QF2") { targetLabel = "SF1"; targetSlot = 2; }
  else if (label === "QF3") { targetLabel = "SF2"; targetSlot = 1; }
  else if (label === "QF4") { targetLabel = "SF2"; targetSlot = 2; }
  else if (label === "SF1") { targetLabel = "FINAL"; targetSlot = 1; }
  else if (label === "SF2") { targetLabel = "FINAL"; targetSlot = 2; }

  const winnerId = updatedMatch.status === "COMPLETED" ? updatedMatch.winnerId : null;
  const winnerName = updatedMatch.status === "COMPLETED" ? (updatedMatch.winnerName || "TBD") : "TBD";

  if (targetLabel) {
    if (!isFirebaseConfigured || !db) {
      const store = getLocalStore();
      const targetMatch = store.matches.find(
        (m) => m.tournamentId === tournamentId && m.isKnockout && m.knockoutLabel?.toUpperCase() === targetLabel
      );
      if (targetMatch) {
        const currentName = targetSlot === 1 ? targetMatch.participant1Name : targetMatch.participant2Name;
        if (currentName !== winnerName) {
          if (targetSlot === 1) {
            targetMatch.participant1Id = winnerId;
            targetMatch.participant1Name = winnerName;
          } else {
            targetMatch.participant2Id = winnerId;
            targetMatch.participant2Name = winnerName;
          }
          saveLocalStore(store);
        }
      }
    } else {
      const q = query(
        collection(db, "matches"),
        where("tournamentId", "==", tournamentId),
        where("isKnockout", "==", true),
        where("knockoutLabel", "==", targetLabel)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const targetDoc = snapshot.docs[0];
        const targetData = targetDoc.data();
        const currentName = targetSlot === 1 ? targetData.participant1Name : targetData.participant2Name;
        if (currentName !== winnerName) {
          const updateObj: any = {};
          if (targetSlot === 1) {
            updateObj.participant1Id = winnerId;
            updateObj.participant1Name = winnerName;
          } else {
            updateObj.participant2Id = winnerId;
            updateObj.participant2Name = winnerName;
          }
          updateObj.updatedAt = new Date().toISOString();
          await updateDoc(doc(db, "matches", targetDoc.id), updateObj);
        }
      }
    }
  } else if (label === "FINAL") {
    const champion = updatedMatch.status === "COMPLETED" ? (updatedMatch.winnerName || null) : null;
    if (!isFirebaseConfigured || !db) {
      const store = getLocalStore();
      const t = store.tournaments.find((tourney) => tourney.id === tournamentId);
      if (t && t.champion !== champion) {
        t.champion = champion || undefined;
        if (champion) t.status = "COMPLETED";
        saveLocalStore(store);
      }
    } else {
      await updateDoc(doc(db, "tournaments", tournamentId), {
        champion: champion || null,
        status: champion ? "COMPLETED" : "KNOCKOUTS_ACTIVE",
        updatedAt: new Date().toISOString()
      });
    }
  }
}

/* ==========================================================================
   STANDINGS SERVICE
   ========================================================================== */
export const standingsService = {
  async calculateStandings(tournamentId: string): Promise<StandingGroup[]> {
    const groups = await groupService.getByTournament(tournamentId);
    const matches = await matchService.getByTournament(tournamentId);
    const completedGroupMatches = matches.filter((m) => m.status === "COMPLETED" && !m.isKnockout);

    const matchesByGroup = new Map<string, Match[]>();
    completedGroupMatches.forEach((m) => {
      if (m.groupId) {
        if (!matchesByGroup.has(m.groupId)) matchesByGroup.set(m.groupId, []);
        matchesByGroup.get(m.groupId)!.push(m);
      }
    });

    const results: StandingGroup[] = [];

    for (const group of groups) {
      const standingsMap = new Map<string, StandingRow>();

      group.participants.forEach((player) => {
        standingsMap.set(player.id, {
          position: 0,
          participantId: player.id,
          displayName: player.displayName,
          played: 0,
          wins: 0,
          draws: 0,
          losses: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          goalDifference: 0,
          points: 0
        });
      });

      const groupMatches = matchesByGroup.get(group.id) || [];

      groupMatches.forEach((match) => {
        const p1Stats = standingsMap.get(match.participant1Id || "");
        const p2Stats = standingsMap.get(match.participant2Id || "");
        if (!p1Stats || !p2Stats) return;

        const s1 = match.score1 ?? 0;
        const s2 = match.score2 ?? 0;

        p1Stats.played += 1;
        p2Stats.played += 1;
        p1Stats.goalsFor += s1;
        p1Stats.goalsAgainst += s2;
        p2Stats.goalsFor += s2;
        p2Stats.goalsAgainst += s1;

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
      });

      const standingsList = Array.from(standingsMap.values()).map((row) => {
        row.goalDifference = row.goalsFor - row.goalsAgainst;
        return row;
      });

      standingsList.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
        if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
        return a.displayName.localeCompare(b.displayName);
      });

      const rankedStandings = standingsList.map((row, idx) => ({
        ...row,
        position: idx + 1
      }));

      results.push({
        groupId: group.id,
        groupName: group.groupName,
        standings: rankedStandings
      });
    }

    return results;
  }
};

/* ==========================================================================
   KNOCKOUTS SERVICE
   ========================================================================== */
export const knockoutService = {
  async getByTournament(tournamentId: string): Promise<KnockoutRound[]> {
    const matches = await matchService.getByTournament(tournamentId);
    const knockoutMatches = matches.filter((m) => m.isKnockout);

    const roundsMap: { [key: number]: KnockoutRound } = {};

    knockoutMatches.forEach((match) => {
      const rNum = match.roundNumber;
      if (!roundsMap[rNum]) {
        let roundName = `Round ${rNum}`;
        if (match.knockoutLabel?.startsWith("QF")) roundName = "Quarter Finals";
        else if (match.knockoutLabel?.startsWith("SF")) roundName = "Semi Finals";
        else if (match.knockoutLabel === "FINAL") roundName = "Final";

        roundsMap[rNum] = {
          id: `round_${rNum}`,
          roundName,
          roundOrder: rNum,
          matches: []
        };
      }
      roundsMap[rNum].matches.push(match);
    });

    return Object.values(roundsMap).sort((a, b) => a.roundOrder - b.roundOrder);
  },

  async getKnockoutRounds(tournamentId: string): Promise<KnockoutRound[]> {
    return this.getByTournament(tournamentId);
  },

  async generateBracket(tournamentId: string): Promise<Match[]> {
    const groupStandings = await standingsService.calculateStandings(tournamentId);
    if (groupStandings.length === 0) throw new Error("Group stage must be completed first.");

    const numGroups = groupStandings.length;
    const matchesToInsert: any[] = [];

    const getQualifiedPlayer = (gIndex: number, pos: number) => {
      const group = groupStandings[gIndex];
      if (!group || !group.standings) return { id: null, name: null };
      const standing = group.standings.find((s) => s.position === pos);
      return standing ? { id: standing.participantId, name: standing.displayName } : { id: null, name: null };
    };

    if (numGroups >= 4) {
      const qf1 = getQualifiedPlayer(0, 1);
      const qf1_2 = getQualifiedPlayer(1, 2);
      const qf2 = getQualifiedPlayer(2, 1);
      const qf2_2 = getQualifiedPlayer(3, 2);
      const qf3 = getQualifiedPlayer(1, 1);
      const qf3_2 = getQualifiedPlayer(0, 2);
      const qf4 = getQualifiedPlayer(3, 1);
      const qf4_2 = getQualifiedPlayer(2, 2);

      matchesToInsert.push(
        { tournamentId, participant1Id: qf1.id, participant1Name: qf1.name, participant2Id: qf1_2.id, participant2Name: qf1_2.name, roundNumber: 1, legNumber: 1, isKnockout: true, knockoutLabel: "QF1", status: "PENDING" },
        { tournamentId, participant1Id: qf2.id, participant1Name: qf2.name, participant2Id: qf2_2.id, participant2Name: qf2_2.name, roundNumber: 1, legNumber: 1, isKnockout: true, knockoutLabel: "QF2", status: "PENDING" },
        { tournamentId, participant1Id: qf3.id, participant1Name: qf3.name, participant2Id: qf3_2.id, participant2Name: qf3_2.name, roundNumber: 1, legNumber: 1, isKnockout: true, knockoutLabel: "QF3", status: "PENDING" },
        { tournamentId, participant1Id: qf4.id, participant1Name: qf4.name, participant2Id: qf4_2.id, participant2Name: qf4_2.name, roundNumber: 1, legNumber: 1, isKnockout: true, knockoutLabel: "QF4", status: "PENDING" },
        { tournamentId, participant1Id: null, participant1Name: null, participant2Id: null, participant2Name: null, roundNumber: 2, legNumber: 1, isKnockout: true, knockoutLabel: "SF1", status: "PENDING" },
        { tournamentId, participant1Id: null, participant1Name: null, participant2Id: null, participant2Name: null, roundNumber: 2, legNumber: 1, isKnockout: true, knockoutLabel: "SF2", status: "PENDING" },
        { tournamentId, participant1Id: null, participant1Name: null, participant2Id: null, participant2Name: null, roundNumber: 3, legNumber: 1, isKnockout: true, knockoutLabel: "FINAL", status: "PENDING" }
      );
    } else if (numGroups >= 2) {
      const sf1 = getQualifiedPlayer(0, 1);
      const sf1_2 = getQualifiedPlayer(1, 2);
      const sf2 = getQualifiedPlayer(1, 1);
      const sf2_2 = getQualifiedPlayer(0, 2);

      matchesToInsert.push(
        { tournamentId, participant1Id: sf1.id, participant1Name: sf1.name, participant2Id: sf1_2.id, participant2Name: sf1_2.name, roundNumber: 1, legNumber: 1, isKnockout: true, knockoutLabel: "SF1", status: "PENDING" },
        { tournamentId, participant1Id: sf2.id, participant1Name: sf2.name, participant2Id: sf2_2.id, participant2Name: sf2_2.name, roundNumber: 1, legNumber: 1, isKnockout: true, knockoutLabel: "SF2", status: "PENDING" },
        { tournamentId, participant1Id: null, participant1Name: null, participant2Id: null, participant2Name: null, roundNumber: 2, legNumber: 1, isKnockout: true, knockoutLabel: "FINAL", status: "PENDING" }
      );
    } else {
      const f1 = getQualifiedPlayer(0, 1);
      const f2 = getQualifiedPlayer(0, 2);
      matchesToInsert.push(
        { tournamentId, participant1Id: f1.id, participant1Name: f1.name, participant2Id: f2.id, participant2Name: f2.name, roundNumber: 1, legNumber: 1, isKnockout: true, knockoutLabel: "FINAL", status: "PENDING" }
      );
    }

    const created: Match[] = [];

    if (!isFirebaseConfigured || !db) {
      const store = getLocalStore();
      store.matches = store.matches.filter((m) => m.tournamentId !== tournamentId || !m.isKnockout);
      matchesToInsert.forEach((mData, idx) => {
        const m: Match = { id: `ko_match_${Date.now()}_${idx}`, ...mData };
        created.push(m);
        store.matches.push(m);
      });
      const t = store.tournaments.find((t) => t.id === tournamentId);
      if (t) t.status = "KNOCKOUTS_ACTIVE";
      saveLocalStore(store);
      return created;
    }

    for (const mData of matchesToInsert) {
      const ref = await addDoc(collection(db, "matches"), mData);
      created.push({ id: ref.id, ...mData });
    }

    await updateDoc(doc(db, "tournaments", tournamentId), {
      status: "KNOCKOUTS_ACTIVE",
      updatedAt: new Date().toISOString()
    });

    return created;
  }
};

/* ==========================================================================
   AUTH SERVICE
   ========================================================================== */
export const authService = {
  async login(email: string, pass: string): Promise<any> {
    if (!isFirebaseConfigured || !auth) {
      // Local fallback auth check
      if (pass === "Not@pros43" || pass.length >= 4) {
        return { uid: "admin_local", email: "admin@s43.com" };
      }
      throw new Error("Invalid password");
    }
    const res = await signInWithEmailAndPassword(auth, email, pass);
    return res.user;
  },

  async logout(): Promise<void> {
    if (isFirebaseConfigured && auth) {
      await signOut(auth);
    }
  },

  subscribeAuth(callback: (user: User | null) => void) {
    if (!isFirebaseConfigured || !auth) {
      callback(null);
      return () => {};
    }
    return onAuthStateChanged(auth, callback);
  }
};
