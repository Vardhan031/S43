import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api";

export const api = axios.create({
  baseURL: API_BASE_URL,

  headers: {
    "Content-Type":
      "application/json",
  },
});

// Add request interceptor to attach JWT token if it exists in localStorage
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

/* =========================
   TYPES
========================= */

export interface Tournament {
  _id: string;

  name: string;

  mode: "VSA" | "H2H";

  totalPlayers: number;

  totalGroups: number;

  qualificationCount: number;

  status:
  | "DRAFT"
  | "GROUPS_GENERATED"
  | "FIXTURES_ACTIVE"
  | "KNOCKOUTS_ACTIVE"
  | "COMPLETED";

  logoUrl?: string;

  createdAt?: string;

  updatedAt?: string;
}

export interface Participant {
  _id: string;

  tournamentId: string;

  displayName: string;

  createdAt?: string;
}

export interface Group {
  _id: string;

  tournamentId: string;

  groupName: string;

  participants: Participant[];
}

export interface Match {
  _id: string;

  tournamentId: string;

  groupId: string | null;

  participant1: Participant | null;

  participant2: Participant | null;

  winner?: Participant | null;

  score1: number | null;

  score2: number | null;

  status: "PENDING" | "COMPLETED";

  roundNumber: number;

  legNumber: number;

  isKnockout: boolean;

  knockoutLabel: string | null;
}

export interface StandingRow {
  position: number;

  participantId: string;

  displayName: string;

  played: number;

  wins: number;

  draws: number;

  losses: number;

  goalsFor: number;

  goalsAgainst: number;

  goalDifference: number;

  points: number;
}

export interface StandingGroup {
  groupId: string;

  groupName: string;

  standings: StandingRow[];
}

export interface KnockoutRound {
  _id: string;

  roundName: string;

  roundOrder: number;

  matches: Match[];
}

/* =========================
   TOURNAMENTS
========================= */

export const tournamentService = {
  async getAll() {
    const { data } =
      await api.get<{
        success: boolean;
        data: Tournament[];
      }>("/tournaments");

    return data.data;
  },

  async getById(id: string) {
    const { data } =
      await api.get<{
        success: boolean;
        data: Tournament;
      }>(`/tournaments/${id}`);

    return data.data;
  },

  async create(
    payload: Partial<Tournament>
  ) {
    const { data } =
      await api.post<{
        success: boolean;
        data: Tournament;
      }>("/tournaments", payload);

    return data.data;
  },

  async reset(id: string) {
    const { data } =
      await api.post<{
        success: boolean;
        message: string;
      }>(
        `/tournaments/${id}/reset`
      );

    return data;
  },

  async delete(id: string) {
    const { data } =
      await api.delete<{
        success: boolean;
        message: string;
      }>(`/tournaments/${id}`);

    return data;
  },
};

/* =========================
   PARTICIPANTS
========================= */

export const participantService = {
  async getByTournament(
    tournamentId: string
  ) {
    const { data } =
      await api.get<{
        success: boolean;
        data: Participant[];
      }>(
        `/participants/tournament/${tournamentId}`
      );

    return data.data;
  },

  async add(
    tournamentId: string,
    displayName: string
  ) {
    const { data } =
      await api.post<{
        success: boolean;
        data: Participant;
      }>("/participants", {
        tournamentId,
        displayName,
      });

    return data.data;
  },

  async bulkAdd(
    tournamentId: string,
    displayNames: string[]
  ) {
    const { data } =
      await api.post<{
        success: boolean;
        data: Participant[];
      }>(
        "/participants/bulk",
        {
          tournamentId,
          displayNames,
        }
      );

    return data.data;
  },

  async remove(id: string) {
    const { data } =
      await api.delete<{
        success: boolean;
        message: string;
      }>(`/participants/${id}`);

    return data;
  },
};

/* =========================
   GROUPS
========================= */

export const groupService = {
  async generate(
    tournamentId: string
  ) {
    const { data } =
      await api.post<{
        success: boolean;
        data: Group[];
      }>("/groups/generate", {
        tournamentId,
      });

    return data.data;
  },

  async getByTournament(
    tournamentId: string
  ) {
    const { data } =
      await api.get<{
        success: boolean;
        data: Group[];
      }>(
        `/groups/tournament/${tournamentId}`
      );

    return data.data;
  },
};

/* =========================
   MATCHES
========================= */

export const matchService = {
  async generateFixtures(
    tournamentId: string
  ) {
    const { data } =
      await api.post<{
        success: boolean;
        data: Match[];
      }>("/matches/generate", {
        tournamentId,
      });

    return data.data;
  },

  async getByTournament(
    tournamentId: string
  ) {
    const { data } =
      await api.get<{
        success: boolean;
        data: Match[];
      }>(
        `/matches/tournament/${tournamentId}`
      );

    return data.data;
  },

  async updateScore(
    matchId: string,
    score1: number | null,
    score2: number | null,
    reset?: boolean
  ) {
    const { data } =
      await api.patch<{
        success: boolean;
        data: Match;
      }>(`/matches/${matchId}`, {
        score1,
        score2,
        reset,
      });

    return data.data;
  },
};

/* =========================
   STANDINGS
========================= */

export const standingsService = {
  async getByTournament(
    tournamentId: string
  ) {
    const { data } =
      await api.get<{
        success: boolean;
        data: StandingGroup[];
      }>(
        `/standings/${tournamentId}`
      );

    return data.data;
  },
};

/* =========================
   KNOCKOUTS
========================= */

export const knockoutService = {
  async generateBracket(
    tournamentId: string
  ) {
    const { data } =
      await api.post<{
        success: boolean;
        data: Match[];
      }>(
        `/tournaments/${tournamentId}/generate-knockouts`
      );

    return data.data;
  },

  async getByTournament(
    tournamentId: string
  ) {
    const { data } =
      await api.get<{
        success: boolean;
        data: {
          rounds: KnockoutRound[];
        };
      }>(
        `/knockouts/${tournamentId}`
      );

    return data.data.rounds;
  },
};

/* =========================
   AUTH
========================= */

export const authService = {
  async login(payload: any) {
    const { data } = await api.post<{
      success: boolean;
      token: string;
      user: { id: string; username: string };
    }>("/auth/login", payload);
    return data;
  },

  async verify() {
    const { data } = await api.get<{
      success: boolean;
      user: { id: string; username: string };
    }>("/auth/verify");
    return data;
  },
};