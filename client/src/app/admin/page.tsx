"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Tournament,
  Participant,
  Group,
  Match,
  StandingGroup,
  KnockoutRound,
  authService,
} from "@/services/api";
import {
  tournamentService,
  participantService,
  groupService,
  matchService,
  standingsService,
  knockoutService,
} from "@/services/api";
import {
  Trophy,
  Users,
  PlusCircle,
  Play,
  RotateCcw,
  Save,
  CheckCircle,
  AlertTriangle,
  ChevronRight,
  ListPlus,
  Trash2,
  Gamepad,
  RefreshCw,
  Award,
  Zap,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import GroupGrid from "@/components/GroupGrid";
import StandingsTable from "@/components/StandingsTable";
import KnockoutBracket from "@/components/KnockoutBracket";

export default function AdminDashboard() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Tournaments state
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTourneyId, setSelectedTourneyId] = useState<string>("");
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);

  // Tournament creation form state
  const [newTourney, setNewTourney] = useState({
    name: "",
    mode: "H2H" as "H2H" | "VSA",
    totalPlayers: 16,
    totalGroups: 4,
    qualificationCount: 2,
    logoUrl: "",
  });

  // Selected tournament details
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [standings, setStandings] = useState<StandingGroup[]>([]);
  const [knockoutRounds, setKnockoutRounds] = useState<KnockoutRound[]>([]);

  // Input states
  const [singlePlayerName, setSinglePlayerName] = useState("");
  const [bulkPlayersText, setBulkPlayersText] = useState("");
  const [editingScores, setEditingScores] = useState<Record<string, { s1: string; s2: string }>>({});

  // UI state
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [activeAdminTab, setActiveAdminTab] = useState<"roster" | "groups_fixtures" | "scores" | "brackets">("roster");
  const [selectedScoreFilter, setSelectedScoreFilter] = useState<string>("");

  // Custom Modal Alert/Confirm state
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "alert" | "confirm";
    onConfirm?: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "alert",
  });

  const showCustomConfirm = (message: string, onConfirm: () => void) => {
    setModalConfig({
      isOpen: true,
      title: "Action Required",
      message,
      type: "confirm",
      onConfirm,
    });
  };

  const showCustomAlert = (message: string) => {
    setModalConfig({
      isOpen: true,
      title: "Notice",
      message,
      type: "alert",
    });
  };

  // Search states for scores entry tab
  const [adminSearchQuery, setAdminSearchQuery] = useState<string>("");
  const [selectedAdminMatchupId, setSelectedAdminMatchupId] = useState<string | null>(null);

  // Verify auth on mount, then load tournaments
  useEffect(() => {
    const verifyAuth = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.replace("/admin/login");
        return;
      }
      try {
        await authService.verify();
        setCheckingAuth(false);
        loadTournaments();
      } catch (err) {
        localStorage.removeItem("token");
        router.replace("/admin/login");
      }
    };
    verifyAuth();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.replace("/admin/login");
  };

  // Load active tournament data when selection changes
  useEffect(() => {
    if (selectedTourneyId) {
      const found = tournaments.find((t) => t._id === selectedTourneyId);
      setSelectedTournament(found || null);
      loadTournamentDetails(selectedTourneyId);
    } else {
      setSelectedTournament(null);
      clearDetails();
    }
  }, [selectedTourneyId, tournaments]);

  const loadTournaments = async () => {
    try {
      setLoading(true);
      const data = await tournamentService.getAll();
      setTournaments(data);
      if (data.length > 0 && !selectedTourneyId) {
        setSelectedTourneyId(data[0]._id);
      }
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError("Failed to load tournaments list from server.");
    } finally {
      setLoading(false);
    }
  };

  const loadTournamentDetails = async (id: string) => {
    try {
      setError(null);
      // Fetch participants
      const p = await participantService.getByTournament(id);
      setParticipants(p);

      // Fetch groups if tournament is past DRAFT
      let gData: Group[] = [];
      try {
        gData = await groupService.getByTournament(id);
        setGroups(gData);
      } catch (e) {
        setGroups([]);
      }

      // Fetch matches
      let mData: Match[] = [];
      try {
        mData = await matchService.getByTournament(id);
        setMatches(mData);

        // Initialize scores state for editing
        const scoresState: Record<string, { s1: string; s2: string }> = {};
        mData.forEach((m) => {
          scoresState[m._id] = {
            s1: m.score1 !== null ? String(m.score1) : "",
            s2: m.score2 !== null ? String(m.score2) : "",
          };
        });
        setEditingScores(scoresState);

        // Initialize active round or phase filter
        const kMatches = mData.filter((m) => m.isKnockout);
        setSelectedScoreFilter((prev) => {
          if (prev === "knockouts" && kMatches.length > 0) return prev;
          if (prev.startsWith("group_")) {
            const gId = prev.replace("group_", "");
            if (gData.some((g) => g._id === gId)) return prev;
          }
          if (gData.length > 0) {
            return `group_${gData[0]._id}`;
          }
          if (kMatches.length > 0) return "knockouts";
          return "";
        });
      } catch (e) {
        setMatches([]);
      }

      // Fetch standings
      try {
        const sData = await standingsService.getByTournament(id);
        setStandings(sData);
      } catch (e) {
        setStandings([]);
      }

      // Fetch knockouts
      try {
        const kData = await knockoutService.getByTournament(id);
        setKnockoutRounds(kData);
      } catch (e) {
        setKnockoutRounds([]);
      }
    } catch (err: any) {
      console.error(err);
      setError("Error loading tournament details.");
    }
  };

  const clearDetails = () => {
    setParticipants([]);
    setGroups([]);
    setMatches([]);
    setStandings([]);
    setKnockoutRounds([]);
    setEditingScores({});
    setSelectedScoreFilter("");
  };

  // Actions
  const handleCreateTournament = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTourney.name.trim()) return;

    try {
      setActionLoading(true);
      setError(null);
      const created = await tournamentService.create({
        name: newTourney.name.trim(),
        mode: newTourney.mode,
        totalPlayers: Number(newTourney.totalPlayers),
        totalGroups: Number(newTourney.totalGroups),
        qualificationCount: Number(newTourney.qualificationCount),
        logoUrl: newTourney.logoUrl,
      });

      setSuccessMsg(`Tournament "${created.name}" created successfully!`);
      setNewTourney({
        name: "",
        mode: "H2H",
        totalPlayers: 16,
        totalGroups: 4,
        qualificationCount: 2,
        logoUrl: "",
      });

      // Reload list and select it
      const data = await tournamentService.getAll();
      setTournaments(data);
      setSelectedTourneyId(created._id);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to create tournament.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteTournament = (id: string) => {
    showCustomConfirm(
      "Are you sure you want to delete this tournament? This will wipe all players, groups, fixtures, and scores associated with it!",
      async () => {
        try {
          setActionLoading(true);
          await tournamentService.delete(id);
          setSuccessMsg("Tournament deleted.");
          setSelectedTourneyId("");
          await loadTournaments();
        } catch (err: any) {
          console.error(err);
          setError("Failed to delete tournament.");
        } finally {
          setActionLoading(false);
        }
      }
    );
  };

  const handleAddParticipant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTourneyId || !singlePlayerName.trim()) return;

    if (selectedTournament && participants.length >= selectedTournament.totalPlayers) {
      showCustomAlert(`Cannot add player: The participant limit for this tournament has been reached (${selectedTournament.totalPlayers}).`);
      return;
    }

    try {
      setActionLoading(true);
      setError(null);
      await participantService.add(selectedTourneyId, singlePlayerName.trim());
      setSinglePlayerName("");
      setSuccessMsg("Player registered.");
      await loadTournamentDetails(selectedTourneyId);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to register player.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkAddParticipants = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTourneyId || !bulkPlayersText.trim()) return;

    const names = bulkPlayersText
      .split("\n")
      .map((n) => n.trim())
      .filter((n) => n.length > 0);

    if (names.length === 0) return;

    if (selectedTournament && participants.length + names.length > selectedTournament.totalPlayers) {
      showCustomAlert(`Cannot add players: Adding ${names.length} players would exceed the tournament limit of ${selectedTournament.totalPlayers} (current participants: ${participants.length}).`);
      return;
    }

    try {
      setActionLoading(true);
      setError(null);
      await participantService.bulkAdd(selectedTourneyId, names);
      setBulkPlayersText("");
      setSuccessMsg(`Bulk registered ${names.length} players.`);
      await loadTournamentDetails(selectedTourneyId);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to bulk register players.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveParticipant = async (pId: string) => {
    try {
      setActionLoading(true);
      await participantService.remove(pId);
      setSuccessMsg("Player removed.");
      await loadTournamentDetails(selectedTourneyId);
    } catch (err: any) {
      console.error(err);
      setError("Failed to remove player.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleGenerateGroups = async () => {
    if (!selectedTournament) return;
    
    const proceed = async () => {
      try {
        setActionLoading(true);
        setError(null);
        await groupService.generate(selectedTournament._id);
        setSuccessMsg("Groups generated successfully!");
        // Reload tournaments list to update status in selector, and details
        const list = await tournamentService.getAll();
        setTournaments(list);
        await loadTournamentDetails(selectedTournament._id);
        setActiveAdminTab("groups_fixtures");
      } catch (err: any) {
        console.error(err);
        setError(err.response?.data?.message || "Failed to generate groups.");
      } finally {
        setActionLoading(false);
      }
    };

    if (participants.length !== selectedTournament.totalPlayers) {
      showCustomConfirm(
        `Warning: You have registered ${participants.length} players but the tournament specifies ${selectedTournament.totalPlayers} total players. Generate groups anyway?`,
        proceed
      );
    } else {
      proceed();
    }
  };

  const handleGenerateFixtures = async () => {
    if (!selectedTournament) return;
    try {
      setActionLoading(true);
      setError(null);
      await matchService.generateFixtures(selectedTournament._id);
      setSuccessMsg("Fixtures generated successfully! Double Round-Robin is live.");
      const list = await tournamentService.getAll();
      setTournaments(list);
      await loadTournamentDetails(selectedTournament._id);
      setActiveAdminTab("scores");
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to generate fixtures.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateScore = async (matchId: string) => {
    const edit = editingScores[matchId];
    if (!edit || edit.s1 === "" || edit.s2 === "") {
      showCustomAlert("Please specify score inputs for both sides.");
      return;
    }

    const val1 = Number(edit.s1);
    const val2 = Number(edit.s2);

    if (isNaN(val1) || isNaN(val2)) {
      showCustomAlert("Scores must be valid numbers.");
      return;
    }

    // Verify knockout rules
    const match = matches.find((m) => m._id === matchId);
    if (match?.isKnockout && val1 === val2) {
      showCustomAlert("Knockout matches cannot end in a draw. Please input the final score including extra time/penalties to determine who advances.");
      return;
    }

    try {
      setError(null);
      await matchService.updateScore(matchId, val1, val2);
      setSuccessMsg("Match score recorded.");
      await loadTournamentDetails(selectedTourneyId);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to update match score.");
    }
  };

  const handleResetScore = async (matchId: string) => {
    showCustomConfirm(
      "Are you sure you want to reset the scores for this match? This will revert the match status to pending and clear the recorded results.",
      async () => {
        try {
          setError(null);
          await matchService.updateScore(matchId, null, null, true);
          
          // Clear local input fields for this match
          setEditingScores((prev) => ({
            ...prev,
            [matchId]: { s1: "", s2: "" },
          }));
          
          setSuccessMsg("Match score reset to pending.");
          await loadTournamentDetails(selectedTourneyId);
        } catch (err: any) {
          console.error(err);
          setError(err.response?.data?.message || "Failed to reset match score.");
        }
      }
    );
  };

  const handleGenerateKnockouts = async () => {
    if (!selectedTournament) return;
    try {
      setActionLoading(true);
      setError(null);
      await knockoutService.generateBracket(selectedTournament._id);
      setSuccessMsg("Knockout brackets generated from group stage results!");
      const list = await tournamentService.getAll();
      setTournaments(list);
      await loadTournamentDetails(selectedTournament._id);
      setActiveAdminTab("scores");
      setSelectedScoreFilter("knockouts");
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to generate knockout bracket. Ensure group standings contain qualified players.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleScoreChange = (matchId: string, side: "s1" | "s2", val: string) => {
    setEditingScores((prev) => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        [side]: val,
      },
    }));
  };

  const getStatusLabel = (status: Tournament["status"]) => {
    switch (status) {
      case "DRAFT":
        return "Drafting Rosters";
      case "GROUPS_GENERATED":
        return "Groups Formed";
      case "FIXTURES_ACTIVE":
        return "Group Stage Live";
      case "KNOCKOUTS_ACTIVE":
        return "Knockouts Live";
      case "COMPLETED":
        return "Completed";
    }
  };

  // Filter matches into Group vs Knockout
  const groupMatches = matches.filter((m) => !m.isKnockout);
  const knockoutMatches = matches.filter((m) => m.isKnockout);

  // Group stage rounds
  const groupRounds = Array.from(new Set(groupMatches.map((m) => m.roundNumber))).sort((a, b) => a - b);

  // Group all matches involving the searched competitor into matchup pairs
  interface AdminMatchup {
    id: string;
    participant1?: Participant;
    participant2?: Participant;
    leg1?: Match;
    leg2?: Match;
    groupId?: string;
    groupName?: string;
  }

  const searchedAdminMatchups = useMemo(() => {
    if (!adminSearchQuery.trim()) return [];
    const query = adminSearchQuery.trim().toLowerCase();

    // Filter matches where participant 1 or 2 contains the query
    const filtered = matches.filter((m) => {
      const name1 = m.participant1?.displayName.toLowerCase() || "";
      const name2 = m.participant2?.displayName.toLowerCase() || "";
      return name1.includes(query) || name2.includes(query);
    });

    const matchupMap: Record<string, AdminMatchup> = {};

    filtered.forEach((m) => {
      const p1 = m.participant1;
      const p2 = m.participant2;
      const p1Id = p1?._id || "tbd1";
      const p2Id = p2?._id || "tbd2";
      const key = [p1Id, p2Id].sort().join("_");

      if (!matchupMap[key]) {
        let displayP1 = p1;
        let displayP2 = p2;
        if (p1 && p2 && p1.displayName.localeCompare(p2.displayName) > 0) {
          displayP1 = p2;
          displayP2 = p1;
        }

        let gName = "";
        if (!m.isKnockout && m.groupId) {
          const gObj = groups.find((g) => g._id === m.groupId);
          gName = gObj ? gObj.groupName : "";
        } else if (m.isKnockout) {
          gName = "Knockouts";
        }

        matchupMap[key] = {
          id: key,
          participant1: displayP1 || undefined,
          participant2: displayP2 || undefined,
          groupId: m.groupId || undefined,
          groupName: gName,
        };
      }

      if (m.legNumber === 2) {
        matchupMap[key].leg2 = m;
      } else {
        if (!matchupMap[key].leg1) {
          matchupMap[key].leg1 = m;
        } else {
          matchupMap[key].leg2 = m;
        }
      }
    });

    return Object.values(matchupMap);
  }, [matches, adminSearchQuery, groups]);

  const tournamentOptions = useMemo(() => {
    return tournaments.map((t) => ({
      value: t._id,
      label: `${t.name} (${t.mode} - ${getStatusLabel(t.status)})`,
    }));
  }, [tournaments]);

  const scoreFilterOptions = useMemo(() => {
    const list = groups.map((group) => ({
      value: `group_${group._id}`,
      label: `${group.groupName} Matches`,
    }));
    if (knockoutMatches.length > 0) {
      list.push({
        value: "knockouts",
        label: "Knockout Stage",
      });
    }
    return list;
  }, [groups, knockoutMatches]);

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="flex flex-col items-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-500/30 border-t-transparent" />
          <p className="mt-4 text-xs font-bold uppercase tracking-wider text-slate-500">
            Verifying Admin Session...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-grow bg-black pb-20">
      {/* Header Panel */}
      <div className="border-b border-slate-900 bg-black/40 py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tight text-white sm:text-3xl flex items-center gap-2">
                <Trophy className="h-7 w-7 text-orange-400" />
                Tournament Control Center
              </h1>
              <p className="text-xs text-slate-500 font-semibold mt-1">
                Admin workflows: create, register, group, schedule, record, and generate brackets.
              </p>
            </div>

            {/* Quick selection dropdown */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-auto">
                <CustomSelect
                  value={selectedTourneyId}
                  onChange={setSelectedTourneyId}
                  options={tournamentOptions}
                  placeholder="Select Tournament..."
                  className="w-full sm:min-w-[230px]"
                />
              </div>

              {selectedTournament && (
                <button
                  onClick={() => handleDeleteTournament(selectedTournament._id)}
                  className="flex items-center justify-center h-10 w-full sm:w-9 rounded-lg border border-red-500/25 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition active:scale-95 cursor-pointer"
                  title="Delete Selected Tournament"
                >
                  <Trash2 className="h-4 w-4 mr-1.5 sm:mr-0" />
                  <span className="sm:hidden text-xs font-bold uppercase tracking-wider">Delete Tournament</span>
                </button>
              )}

              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 h-10 w-full sm:w-auto rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-xs font-bold text-slate-400 hover:text-white transition active:scale-95 cursor-pointer"
                title="Log Out"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main dashboard body */}
      <div className="mx-auto max-w-7xl px-4 mt-8 sm:px-6 lg:px-8">
        {/* Alerts banner */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/5 p-4 flex items-start gap-2.5">
            <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-red-400 uppercase tracking-wider">Operation Error</p>
              <p className="text-sm font-semibold text-slate-300 mt-1">{error}</p>
            </div>
            <button className="ml-auto text-xs text-slate-500 hover:text-white" onClick={() => setError(null)}>×</button>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 flex items-start gap-2.5">
            <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Success</p>
              <p className="text-sm font-semibold text-slate-300 mt-1">{successMsg}</p>
            </div>
            <button className="ml-auto text-xs text-slate-500 hover:text-white" onClick={() => setSuccessMsg(null)}>×</button>
          </div>
        )}

        {/* Outer Columns: Creation vs Management */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Column 1: Creation panel */}
          <div className="space-y-6">
            <div className="rounded-xl border border-slate-800 bg-slate-900/10 p-5 backdrop-blur-sm shadow-md">
              <h2 className="text-base font-black uppercase tracking-wider text-orange-400 mb-4 flex items-center gap-1.5">
                <PlusCircle className="h-5 w-5" />
                Create Tournament
              </h2>
              <form onSubmit={handleCreateTournament} className="space-y-4">
                {/* Tournament Name */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500">Tournament Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Champions Cup H2H"
                    value={newTourney.name}
                    onChange={(e) => setNewTourney({ ...newTourney, name: e.target.value })}
                    className="w-full rounded-lg border border-slate-800 bg-black px-3.5 py-2.5 text-xs text-slate-200 focus:border-orange-400 focus:outline-none"
                  />
                </div>

                {/* Mode Select */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500">Mode</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setNewTourney({ ...newTourney, mode: "H2H" })}
                      className={`rounded-lg py-2.5 text-xs font-bold transition border ${newTourney.mode === "H2H"
                        ? "bg-gradient-to-r from-[#ff4e00] to-[#ff8c00] border-transparent text-slate-950 font-black shadow-md shadow-orange-500/10"
                        : "border-slate-800 bg-black text-slate-500 hover:text-slate-300"
                        }`}
                    >
                      H2H Mode
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewTourney({ ...newTourney, mode: "VSA" })}
                      className={`rounded-lg py-2.5 text-xs font-bold transition border ${newTourney.mode === "VSA"
                        ? "bg-gradient-to-r from-[#ff4e00] to-[#ff8c00] border-transparent text-slate-950 font-black shadow-md shadow-orange-500/10"
                        : "border-slate-800 bg-black text-slate-500 hover:text-slate-300"
                        }`}
                    >
                      VSA Mode
                    </button>
                  </div>
                </div>

                {/* Number of players & groups config */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500">Max Players</label>
                    <input
                      type="number"
                      min={4}
                      max={128}
                      required
                      value={newTourney.totalPlayers}
                      onChange={(e) => setNewTourney({ ...newTourney, totalPlayers: Number(e.target.value) })}
                      className="w-full rounded-lg border border-slate-800 bg-black px-3.5 py-2.5 text-xs text-slate-200 focus:border-orange-400 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500">Num of Groups</label>
                    <input
                      type="number"
                      min={1}
                      max={32}
                      required
                      value={newTourney.totalGroups}
                      onChange={(e) => setNewTourney({ ...newTourney, totalGroups: Number(e.target.value) })}
                      className="w-full rounded-lg border border-slate-800 bg-black px-3.5 py-2.5 text-xs text-slate-200 focus:border-orange-400 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Qualification counts */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500">
                    Qualification Count (Top X per group)
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={newTourney.qualificationCount}
                    onChange={(e) => setNewTourney({ ...newTourney, qualificationCount: Number(e.target.value) })}
                    className="w-full rounded-lg border border-slate-800 bg-black px-3.5 py-2.5 text-xs text-slate-200 focus:border-orange-400 focus:outline-none"
                  />
                  <span className="block text-[9px] text-slate-600 font-semibold leading-normal">
                    This determines how many top standings players in each group advance to single elimination brackets.
                  </span>
                </div>

                {/* Tournament Logo Upload */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500">Tournament Logo</label>
                  <div className="flex items-center gap-3">
                    {newTourney.logoUrl && (
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-slate-800 bg-black">
                        <img src={newTourney.logoUrl} alt="Preview" className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setNewTourney({ ...newTourney, logoUrl: "" })}
                          className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 hover:opacity-100 transition-opacity text-[10px] font-bold text-red-400"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setNewTourney({ ...newTourney, logoUrl: reader.result as string });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="hidden"
                        id="logo-upload"
                      />
                      <label
                        htmlFor="logo-upload"
                        className="flex cursor-pointer items-center justify-center rounded-lg border border-dashed border-slate-850 bg-black px-4 py-2.5 text-center text-xs font-bold text-slate-400 hover:border-orange-400/50 hover:text-slate-300 transition"
                      >
                        {newTourney.logoUrl ? "Change Image" : "Upload Logo Image"}
                      </label>
                    </div>
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="w-full py-3 rounded-lg bg-gradient-to-r from-[#ff4e00] to-[#ff8c00] text-slate-950 font-black uppercase tracking-wider text-xs shadow-md shadow-[0_0_15px_rgba(212,175,55,0.15)] active:scale-95 transition"
                >
                  {actionLoading ? "Processing..." : "Create Tournament"}
                </button>
              </form>
            </div>

            {/* General Info Card */}

          </div>

          {/* Column 2 & 3: Management Workspace */}
          <div className="lg:col-span-2 space-y-6">
            {!selectedTournament ? (
              <div className="rounded-xl border border-dashed border-slate-800 p-12 text-center bg-slate-900/10 h-full flex flex-col justify-center items-center">
                <Gamepad className="h-12 w-12 text-slate-700 animate-pulse mb-3" />
                <p className="text-slate-400 font-bold uppercase tracking-wider text-sm">No Tournament Selected</p>
                <p className="text-slate-600 text-xs mt-1">Please select an existing tournament or create a new one to manage.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Active Tournament Status Banner */}
                <div className="rounded-xl border border-slate-850 bg-slate-900/25 p-5 backdrop-blur-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500">Currently Managing:</span>
                    <h2 className="text-lg font-black uppercase text-white mt-0.5">{selectedTournament.name}</h2>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="rounded bg-orange-950/40 px-2 py-0.5 text-[9px] font-black text-orange-400 border border-orange-500/20 uppercase tracking-wider">
                        {selectedTournament.mode}
                      </span>
                      <span className="rounded bg-slate-800 px-2 py-0.5 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                        {getStatusLabel(selectedTournament.status)}
                      </span>
                      <span className="text-[10px] text-slate-500 font-semibold">
                        ({participants.length} / {selectedTournament.totalPlayers} Roster size)
                      </span>
                    </div>
                  </div>

                  <Link
                    href={`/tournaments/${selectedTournament._id}`}
                    target="_blank"
                    className="rounded-lg border border-slate-800 bg-black hover:bg-slate-900 transition px-3.5 py-2 text-xs font-black uppercase tracking-wider text-slate-400 hover:text-white flex items-center gap-1.5"
                  >
                    Public Page
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

                {/* Step tabs controller */}
                <div className="flex border-b border-slate-900">
                  <button
                    onClick={() => setActiveAdminTab("roster")}
                    className={`border-b-2 px-4 py-3 text-xs font-black uppercase tracking-wider transition ${activeAdminTab === "roster"
                      ? "border-orange-400 text-orange-400 bg-orange-950/20"
                      : "border-transparent text-slate-500 hover:text-slate-300"
                      }`}
                  >
                    1. Roster ({participants.length})
                  </button>
                  <button
                    onClick={() => setActiveAdminTab("groups_fixtures")}
                    className={`border-b-2 px-4 py-3 text-xs font-black uppercase tracking-wider transition ${activeAdminTab === "groups_fixtures"
                      ? "border-orange-400 text-orange-400 bg-orange-950/20"
                      : "border-transparent text-slate-500 hover:text-slate-300"
                      }`}
                  >
                    2. Brackets & Pools
                  </button>
                  <button
                    onClick={() => setActiveAdminTab("scores")}
                    className={`border-b-2 px-4 py-3 text-xs font-black uppercase tracking-wider transition ${activeAdminTab === "scores"
                      ? "border-orange-400 text-orange-400 bg-orange-950/20"
                      : "border-transparent text-slate-500 hover:text-slate-300"
                      }`}
                  >
                    3. Match Scores ({matches.length})
                  </button>
                </div>

                {/* Tabs display */}
                <div className="mt-4">
                  {/* TAB 1: ROSTER MANAGER */}
                  {activeAdminTab === "roster" && (
                    <div className="space-y-6">
                      {selectedTournament.status !== "DRAFT" && (
                        <div className="rounded-xl border border-orange-500/20 bg-orange-500/5 p-4 flex items-start gap-2.5 text-xs text-orange-400 font-semibold">
                          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-orange-500" />
                          <p>
                            Roster is locked because the tournament has started. Additions and removals are disabled.
                          </p>
                        </div>
                      )}

                      {/* Roster Add Inputs */}
                      {selectedTournament.status === "DRAFT" && (
                        <div className="grid gap-6 md:grid-cols-2">
                          {/* Solo Add */}
                          <div className="rounded-xl border border-slate-900 bg-black p-4 space-y-3">
                            <h3 className="text-xs font-black uppercase text-slate-400 flex items-center gap-1">
                              <PlusCircle className="h-4 w-4 text-[#ff4e00]" />
                              Solo Player Add
                            </h3>
                            <form onSubmit={handleAddParticipant} className="flex gap-2">
                              <input
                                type="text"
                                required
                                placeholder="Player nickname"
                                value={singlePlayerName}
                                onChange={(e) => setSinglePlayerName(e.target.value)}
                                className="flex-1 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-200 focus:border-orange-400 focus:outline-none"
                              />
                              <button
                                type="submit"
                                disabled={actionLoading}
                                className="rounded-lg bg-gradient-to-r from-[#ff4e00] to-[#ff8c00] text-slate-950 font-black hover:brightness-110 px-4 py-2 text-xs transition"
                              >
                                Add
                              </button>
                            </form>
                          </div>

                          {/* Bulk Add */}
                          <div className="rounded-xl border border-slate-900 bg-black p-4 space-y-3">
                            <h3 className="text-xs font-black uppercase text-slate-400 flex items-center gap-1">
                              <ListPlus className="h-4 w-4 text-[#ff4e00]" />
                              Bulk Roster Import
                            </h3>
                            <form onSubmit={handleBulkAddParticipants} className="space-y-3">
                              <textarea
                                required
                                rows={3}
                                placeholder="Paste player names (one per line)"
                                value={bulkPlayersText}
                                onChange={(e) => setBulkPlayersText(e.target.value)}
                                className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-200 focus:border-orange-400 focus:outline-none resize-none font-mono"
                              ></textarea>
                              <button
                                type="submit"
                                disabled={actionLoading}
                                className="w-full rounded-lg bg-gradient-to-r from-[#ff4e00] to-[#ff8c00] text-slate-950 font-black hover:brightness-110 py-2 text-xs transition"
                              >
                                Import List
                              </button>
                            </form>
                          </div>
                        </div>
                      )}

                      {/* Participant List Display */}
                      <div className="rounded-xl border border-slate-900 bg-black p-4">
                        <div className="mb-4 flex items-center justify-between border-b border-slate-850 pb-2">
                          <h3 className="text-xs font-black uppercase text-slate-400">
                            Registered Roster
                          </h3>
                          <span className="text-[10px] font-bold text-slate-500">
                            {participants.length} / {selectedTournament.totalPlayers} Players registered
                          </span>
                        </div>

                        {participants.length === 0 ? (
                          <div className="py-8 text-center text-slate-500 text-xs">
                            Roster is currently empty. Add players above to begin.
                          </div>
                        ) : (
                          <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
                            {participants.map((player) => (
                              <div
                                key={player._id}
                                className="flex items-center justify-between rounded-lg bg-slate-900/30 border border-slate-800/40 px-3 py-2 text-xs font-semibold text-slate-300"
                              >
                                <span className="truncate">{player.displayName}</span>
                                {selectedTournament.status === "DRAFT" && (
                                  <button
                                    onClick={() => handleRemoveParticipant(player._id)}
                                    className="text-slate-600 hover:text-red-400 transition ml-2"
                                    title="Remove Player"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* TAB 2: GROUPS & FIXTURES GENERATION */}
                  {activeAdminTab === "groups_fixtures" && (
                    <div className="space-y-8">
                      {/* Generation Actions Card */}
                      <div className="rounded-xl border border-slate-800 bg-slate-900/10 p-5 backdrop-blur-sm space-y-6">
                        <h3 className="text-xs font-black uppercase tracking-wider text-orange-400">
                          Setup Controls
                        </h3>

                        <div className="grid gap-4 sm:grid-cols-2">
                          {/* Group Division Button */}
                          <div className="rounded-xl border border-slate-850 bg-black p-4 flex flex-col justify-between h-40">
                            <div>
                              <h4 className="text-xs font-black uppercase text-white flex items-center gap-1">
                                <Award className="h-4 w-4 text-[#ff4e00]" />
                                1. Divide Roster Groups
                              </h4>
                              <p className="text-[11px] text-slate-500 font-semibold mt-1.5 leading-normal">
                                Shuffles the roster and distributes players evenly into {selectedTournament.totalGroups} separate pool groups.
                              </p>
                            </div>
                            <button
                              onClick={handleGenerateGroups}
                              disabled={actionLoading || selectedTournament.status !== "DRAFT"}
                              className={`w-full py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition ${selectedTournament.status === "DRAFT"
                                ? "bg-gradient-to-r from-[#ff4e00] to-[#ff8c00] text-slate-950 font-black hover:brightness-110 active:scale-95"
                                : "bg-slate-900 border border-slate-850 text-slate-500 cursor-not-allowed"
                                }`}
                            >
                              {selectedTournament.status === "DRAFT" ? "Generate Pools" : "Pools Locked"}
                            </button>
                          </div>

                          {/* Double Round-Robin Fixtures Button */}
                          <div className="rounded-xl border border-slate-850 bg-black p-4 flex flex-col justify-between h-40">
                            <div>
                              <h4 className="text-xs font-black uppercase text-white flex items-center gap-1">
                                <Zap className="h-4 w-4 text-[#ff4e00]" />
                                2. Generate Match Fixtures
                              </h4>
                              <p className="text-[11px] text-slate-500 font-semibold mt-1.5 leading-normal">
                                Generates a double round-robin matchup matrix (Home vs Away legs) for every pool.
                              </p>
                            </div>
                            <button
                              onClick={handleGenerateFixtures}
                              disabled={
                                actionLoading || selectedTournament.status !== "GROUPS_GENERATED"
                              }
                              className={`w-full py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition ${selectedTournament.status === "GROUPS_GENERATED"
                                ? "bg-gradient-to-r from-[#ff4e00] to-[#ff8c00] text-slate-950 font-black hover:brightness-110 active:scale-95"
                                : "bg-slate-900 border border-slate-850 text-slate-500 cursor-not-allowed"
                                }`}
                            >
                              {selectedTournament.status === "GROUPS_GENERATED"
                                ? "Create Match Fixtures"
                                : selectedTournament.status === "DRAFT"
                                  ? "Pool Groups First"
                                  : "Fixtures Active"}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Display current Pools and Standings overview */}
                      {groups.length > 0 && (
                        <div className="space-y-4">
                          <h3 className="text-xs font-black uppercase text-slate-400">
                            Current Group Standings Preview
                          </h3>
                          <div className="grid gap-6 sm:grid-cols-2">
                            {groups.map((group) => {
                              const s = standings.find((sg) => sg.groupId === group._id);
                              if (!s) return <GroupGrid key={group._id} groups={[group]} />;
                              return (
                                <StandingsTable
                                  key={group._id}
                                  group={s}
                                  qualificationCount={selectedTournament.qualificationCount}
                                />
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 3: SCORES ENTRY WORKSPACE */}
                  {activeAdminTab === "scores" && (
                    <div className="space-y-6">
                      {/* Dropdown phase selector, Search and Generation triggers */}
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/10 border border-slate-900 rounded-xl p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full md:w-auto">
                          <div className="space-y-1 w-full sm:w-auto">
                            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500">
                              Select Phase or Round to Edit
                            </label>
                            {matches.length === 0 ? (
                              <p className="text-slate-500 text-xs font-semibold">No fixtures generated yet.</p>
                            ) : (
                              <CustomSelect
                                value={selectedScoreFilter}
                                onChange={setSelectedScoreFilter}
                                options={scoreFilterOptions}
                                placeholder="Select Phase..."
                                className="w-full sm:min-w-[200px]"
                              />
                            )}
                          </div>

                          {matches.length > 0 && (
                            <div className="space-y-1 w-full sm:w-auto flex-grow sm:flex-grow-0">
                              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500">
                                Search Competitor
                              </label>
                              <div className="relative">
                                <input
                                  type="text"
                                  placeholder="Type player name..."
                                  value={adminSearchQuery}
                                  onChange={(e) => {
                                    setAdminSearchQuery(e.target.value);
                                    setSelectedAdminMatchupId(null);
                                  }}
                                  className="w-full rounded-lg border border-slate-800 bg-black px-3.5 py-2.5 text-xs font-bold text-slate-200 focus:border-orange-400 focus:outline-none sm:min-w-[200px]"
                                />
                                {adminSearchQuery && (
                                  <button
                                    onClick={() => {
                                      setAdminSearchQuery("");
                                      setSelectedAdminMatchupId(null);
                                    }}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs font-black cursor-pointer"
                                  >
                                    ×
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {selectedTournament.status === "FIXTURES_ACTIVE" && (
                          <button
                            onClick={handleGenerateKnockouts}
                            disabled={actionLoading}
                            className="rounded-lg bg-gradient-to-r from-[#ff4e00] to-[#ff8c00] hover:brightness-110 text-slate-950 font-black px-5 py-2.5 text-xs uppercase tracking-wider transition active:scale-95 w-full md:w-auto shrink-0 cursor-pointer text-center"
                          >
                            Generate Knockout Bracket
                          </button>
                        )}
                      </div>

                      {/* Filtered Match Results Grid */}
                      <div className="mt-4">
                        {matches.length === 0 ? (
                          <div className="rounded-xl border border-dashed border-slate-850 p-8 text-center bg-slate-900/5">
                            <p className="text-slate-500 text-xs">Generate group stage fixtures first in Step 2.</p>
                          </div>
                        ) : adminSearchQuery ? (
                          /* SEARCH RESULTS MATCHUPS LIST */
                          <div className="space-y-4">
                            <div className="border-b border-slate-900 pb-2 flex justify-between items-center">
                              <h3 className="text-xs font-black uppercase tracking-wider text-orange-400">
                                Matchups for "{adminSearchQuery}" ({searchedAdminMatchups.length} found)
                              </h3>
                              <button
                                onClick={() => {
                                  setAdminSearchQuery("");
                                  setSelectedAdminMatchupId(null);
                                }}
                                className="text-[10px] font-black uppercase text-slate-500 hover:text-white cursor-pointer"
                              >
                                Clear search
                              </button>
                            </div>

                            {searchedAdminMatchups.length === 0 ? (
                              <p className="text-slate-500 text-xs font-semibold">No matches found for competitor "{adminSearchQuery}".</p>
                            ) : (
                              <div className="space-y-3">
                                {searchedAdminMatchups.map((mu) => {
                                  const isExpanded = selectedAdminMatchupId === mu.id;

                                  const leg1Comp = mu.leg1?.status === "COMPLETED";
                                  const leg2Comp = mu.leg2?.status === "COMPLETED";
                                  let statusText = "PENDING";
                                  if (leg1Comp && leg2Comp) {
                                    statusText = `Leg 1: ${mu.leg1?.score1}-${mu.leg1?.score2} | Leg 2: ${mu.leg2?.score1}-${mu.leg2?.score2}`;
                                  } else if (leg1Comp) {
                                    statusText = `Leg 1: ${mu.leg1?.score1}-${mu.leg1?.score2} | Leg 2: PENDING`;
                                  } else if (leg2Comp) {
                                    statusText = `Leg 1: PENDING | Leg 2: ${mu.leg2?.score1}-${mu.leg2?.score2}`;
                                  }

                                  return (
                                    <div
                                      key={mu.id}
                                      className="rounded-xl border border-slate-800 bg-[#060404] overflow-hidden transition-all duration-300"
                                    >
                                      <button
                                        onClick={() => setSelectedAdminMatchupId(isExpanded ? null : mu.id)}
                                        className="w-full text-left p-4 hover:bg-slate-900/40 flex flex-col sm:flex-row justify-between sm:items-center gap-2 cursor-pointer transition-colors"
                                      >
                                        <div className="flex items-center gap-2.5">
                                          <span className="text-xs font-black text-white font-kanit italic uppercase tracking-wider">
                                            {mu.participant1?.displayName || "TBD"}
                                          </span>
                                          <span className="text-[9px] font-black uppercase text-orange-400 bg-orange-950/40 px-1.5 py-0.5 rounded border border-orange-500/20">
                                            VS
                                          </span>
                                          <span className="text-xs font-black text-white font-kanit italic uppercase tracking-wider">
                                            {mu.participant2?.displayName || "TBD"}
                                          </span>
                                        </div>

                                        <div className="flex items-center gap-3.5 text-[10px]">
                                          {mu.groupName && (
                                            <span className="text-slate-500 font-bold uppercase tracking-wider">
                                              {mu.groupName}
                                            </span>
                                          )}
                                          <span className={`font-black uppercase tracking-wider ${leg1Comp || leg2Comp ? "text-emerald-400" : "text-slate-500"}`}>
                                            {statusText}
                                          </span>
                                          <span className="text-orange-400 font-black">
                                            {isExpanded ? "▲" : "▼"}
                                          </span>
                                        </div>
                                      </button>

                                      {isExpanded && (
                                        <div className="p-4 bg-black/40 border-t border-slate-900 grid gap-4 sm:grid-cols-2">
                                          {mu.leg1 && (
                                            <MatchScoreCard
                                              m={mu.leg1}
                                              editingScores={editingScores}
                                              handleScoreChange={handleScoreChange}
                                              handleUpdateScore={handleUpdateScore}
                                              handleResetScore={handleResetScore}
                                            />
                                          )}
                                          {mu.leg2 && (
                                            <MatchScoreCard
                                              m={mu.leg2}
                                              editingScores={editingScores}
                                              handleScoreChange={handleScoreChange}
                                              handleUpdateScore={handleUpdateScore}
                                              handleResetScore={handleResetScore}
                                            />
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        ) : selectedScoreFilter === "knockouts" ? (
                          <div className="space-y-4">
                            <div className="border-b border-slate-900 pb-2">
                              <h3 className="text-xs font-black uppercase tracking-wider text-orange-400">
                                Knockout Phase Matchups
                              </h3>
                              <p className="text-[10px] text-slate-500 font-semibold mt-1">
                                Notice: Knockout matches cannot end in draws. Input score updates carefully.
                              </p>
                            </div>

                            {knockoutMatches.length === 0 ? (
                              <p className="text-slate-500 text-xs">No knockout matches generated yet.</p>
                            ) : (
                              <div className="grid gap-4 sm:grid-cols-2">
                                {knockoutMatches.map((m) => (
                                  <MatchScoreCard
                                    key={m._id}
                                    m={m}
                                    editingScores={editingScores}
                                    handleScoreChange={handleScoreChange}
                                    handleUpdateScore={handleUpdateScore}
                                    handleResetScore={handleResetScore}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (() => {
                          const groupId = selectedScoreFilter.replace("group_", "");
                          const groupObj = groups.find((g) => g._id === groupId);
                          const groupMatchesList = groupMatches.filter((m) => m.groupId === groupId);
                          const sortedMatches = [...groupMatchesList].sort((a, b) => a.roundNumber - b.roundNumber || a.legNumber - b.legNumber);

                          return (
                            <div className="space-y-4">
                              <div className="border-b border-slate-900 pb-2">
                                <h3 className="text-xs font-black uppercase tracking-wider text-orange-400">
                                  {groupObj ? `${groupObj.groupName} Match Fixtures` : "Group Matches"}
                                </h3>
                              </div>

                              {sortedMatches.length === 0 ? (
                                <p className="text-slate-500 text-xs">No matches found for this group.</p>
                              ) : (
                                <div className="grid gap-4 sm:grid-cols-2">
                                  {sortedMatches.map((m) => (
                                    <MatchScoreCard
                                      key={m._id}
                                      m={m}
                                      editingScores={editingScores}
                                      handleScoreChange={handleScoreChange}
                                      handleUpdateScore={handleUpdateScore}
                                      handleResetScore={handleResetScore}
                                    />
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  )}
                </div>

                {/* Display brackets if knockouts are active */}
                {selectedTournament.status === "KNOCKOUTS_ACTIVE" && (
                  <div className="border-t border-slate-900 pt-8 mt-8">
                    <h3 className="text-xs font-black uppercase text-slate-400 mb-4">
                      Knockout Bracket Progress
                    </h3>
                    <KnockoutBracket rounds={knockoutRounds} />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Custom Modal Alert/Confirm */}
      {modalConfig.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md rounded-2xl border border-orange-500/30 bg-[#0A0909] p-6 shadow-[0_0_50px_rgba(212,175,55,0.15)]">
            <h3 className="font-kanit font-black italic text-lg uppercase tracking-wide bg-gradient-to-r from-[#ff4e00] to-[#ff8c00] bg-clip-text text-transparent">
              {modalConfig.title}
            </h3>
            <p className="mt-3 text-xs font-semibold leading-relaxed text-slate-300">
              {modalConfig.message}
            </p>
            <div className="mt-6 flex justify-end gap-3">
              {modalConfig.type === "confirm" ? (
                <>
                  <button
                    onClick={() => setModalConfig((prev) => ({ ...prev, isOpen: false }))}
                    className="rounded-lg border border-slate-800 bg-black hover:bg-slate-900 transition px-4 py-2 text-xs font-black uppercase tracking-wider text-slate-400 hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setModalConfig((prev) => ({ ...prev, isOpen: false }));
                      if (modalConfig.onConfirm) modalConfig.onConfirm();
                    }}
                    className="rounded-lg bg-gradient-to-r from-[#ff4e00] to-[#ff8c00] text-slate-950 font-black hover:brightness-110 transition px-4 py-2 text-xs uppercase tracking-wider cursor-pointer"
                  >
                    Confirm
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setModalConfig((prev) => ({ ...prev, isOpen: false }))}
                  className="rounded-lg bg-gradient-to-r from-[#ff4e00] to-[#ff8c00] text-slate-950 font-black hover:brightness-110 transition px-5 py-2 text-xs uppercase tracking-wider cursor-pointer"
                >
                  OK
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface MatchScoreCardProps {
  m: Match;
  editingScores: Record<string, { s1: string; s2: string }>;
  handleScoreChange: (matchId: string, side: "s1" | "s2", val: string) => void;
  handleUpdateScore: (matchId: string) => void;
  handleResetScore: (matchId: string) => void;
}

function MatchScoreCard({
  m,
  editingScores,
  handleScoreChange,
  handleUpdateScore,
  handleResetScore,
}: MatchScoreCardProps) {
  const matchScore = editingScores[m._id] || { s1: "", s2: "" };
  const complete = m.status === "COMPLETED";

  return (
    <div
      className={`rounded-xl border p-4 transition-all bg-slate-900/10 ${complete ? "border-slate-800" : "border-orange-500/20 bg-orange-950/5 hover:border-orange-500/40"
        }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between text-[9px] uppercase font-bold text-slate-500 mb-3">
        <span>{m.isKnockout ? `Knockout #${m.knockoutLabel}` : `Leg ${m.legNumber}`}</span>
        <span
          className={`px-1.5 py-0.5 rounded font-black ${complete ? "bg-slate-800 text-slate-400" : "bg-orange-950 text-orange-400 border border-orange-500/20"
            }`}
        >
          {m.status}
        </span>
      </div>

      {/* Row Player Inputs */}
      <div className="space-y-2">
        {/* Player 1 Row */}
        <div className="flex items-center justify-between gap-4">
          <span className="truncate text-xs font-semibold text-slate-300">
            {m.participant1?.displayName || "TBD"}
          </span>
          <input
            type="number"
            min={0}
            placeholder="0"
            value={matchScore.s1}
            onChange={(e) => handleScoreChange(m._id, "s1", e.target.value)}
            disabled={!m.participant1 || !m.participant2}
            className="w-16 rounded border border-slate-800 bg-black py-1 text-center font-mono text-xs text-orange-400 font-bold focus:border-orange-400 focus:outline-none"
          />
        </div>

        {/* Player 2 Row */}
        <div className="flex items-center justify-between gap-4">
          <span className="truncate text-xs font-semibold text-slate-300">
            {m.participant2?.displayName || "TBD"}
          </span>
          <input
            type="number"
            min={0}
            placeholder="0"
            value={matchScore.s2}
            onChange={(e) => handleScoreChange(m._id, "s2", e.target.value)}
            disabled={!m.participant1 || !m.participant2}
            className="w-16 rounded border border-slate-800 bg-black py-1 text-center font-mono text-xs text-orange-400 font-bold focus:border-orange-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Action Submit */}
      {m.participant1 && m.participant2 && (
        <div className="mt-3.5 flex gap-2">
          {complete && (
            <button
              onClick={() => handleResetScore(m._id)}
              className="flex items-center justify-center h-8.5 w-8.5 shrink-0 rounded bg-red-950/20 border border-red-500/30 text-red-400 hover:bg-red-500/20 hover:text-red-200 transition active:scale-95 cursor-pointer"
              title="Reset match result to pending"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={() => handleUpdateScore(m._id)}
            className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded bg-slate-900 border border-slate-850 text-[10px] font-black uppercase tracking-wider text-orange-400 hover:bg-slate-850 hover:text-white transition active:scale-95"
          >
            <Save className="h-3.5 w-3.5" />
            {complete ? "Update score" : "Save result"}
          </button>
        </div>
      )}
    </div>
  );
}

interface CustomSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface CustomSelectProps {
  value: string;
  onChange: (val: string) => void;
  options: CustomSelectOption[];
  placeholder?: string;
  className?: string;
}

function CustomSelect({
  value,
  onChange,
  options,
  placeholder = "Select...",
  className = "",
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find((o) => o.value === value);

  useEffect(() => {
    if (!isOpen) return;
    const handleOutsideClick = () => setIsOpen(false);
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, [isOpen]);

  return (
    <div className={`relative w-full sm:w-auto sm:inline-block ${className}`} onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-2.5 rounded-lg border border-slate-800 bg-slate-900 px-4 py-2.5 text-xs font-bold text-slate-200 focus:border-orange-400 focus:outline-none cursor-pointer select-none text-left"
      >
        <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        <span className="text-slate-500 text-[10px]">▼</span>
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 mt-1.5 z-40 w-full rounded-lg border border-slate-800 bg-[#0A0909] p-1 shadow-2xl shadow-black/90 animate-fade-in max-h-60 overflow-y-auto scrollbar-thin">
          {options.length === 0 ? (
            <div className="px-3 py-2 text-xs text-slate-500 font-semibold">No options available</div>
          ) : (
            options.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  disabled={option.disabled}
                  onClick={() => {
                    if (!option.disabled) {
                      onChange(option.value);
                      setIsOpen(false);
                    }
                  }}
                  className={`w-full text-left rounded px-3 py-2 text-xs font-semibold transition cursor-pointer select-none ${
                    isSelected
                      ? "bg-gradient-to-r from-[#ff4e00] to-[#ff8c00] text-slate-950 font-black"
                      : option.disabled
                      ? "text-slate-600 cursor-not-allowed"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  {option.label}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

