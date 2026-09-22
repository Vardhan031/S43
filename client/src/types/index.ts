export type TournamentMode = "VSA" | "H2H";

export type TournamentStatus =
  | "DRAFT"
  | "GROUPS_GENERATED"
  | "FIXTURES_ACTIVE"
  | "KNOCKOUTS_ACTIVE"
  | "COMPLETED";

export interface Tournament {
  id: string;
  name: string;
  mode: TournamentMode;
  totalPlayers: number;
  totalGroups: number;
  qualificationCount: number;
  status: TournamentStatus;
  logoUrl?: string;
  champion?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Participant {
  id: string;
  tournamentId: string;
  displayName: string;
  createdAt?: string;
}

export interface Group {
  id: string;
  tournamentId: string;
  groupName: string;
  participantIds: string[];
  participants: Participant[];
  createdAt?: string;
}

export interface Match {
  id: string;
  tournamentId: string;
  groupId: string | null;
  participant1Id: string | null;
  participant1Name: string | null;
  participant2Id: string | null;
  participant2Name: string | null;
  winnerId: string | null;
  winnerName: string | null;
  score1: number | null;
  score2: number | null;
  status: "PENDING" | "COMPLETED";
  roundNumber: number;
  legNumber: number;
  isKnockout: boolean;
  knockoutLabel: string | null;
  createdAt?: string;
  updatedAt?: string;
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
  id: string;
  roundName: string;
  roundOrder: number;
  matches: Match[];
}
