import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Tournament, Participant, Match, StandingGroup } from "../types";
import {
  tournamentService,
  participantService,
  groupService,
  matchService,
  standingsService,
  knockoutService,
  authService,
  compressImage
} from "../services/firebaseService";
import CustomDropdown from "../components/CustomDropdown";
import { useAlert } from "../context/AlertContext";

import {
  Trophy,
  Users,
  Plus,
  Trash2,
  Zap,
  LogOut,
  ChevronRight,
  AlertTriangle,
  Upload,
  RotateCcw,
  Save,
  CheckCircle2
} from "lucide-react";

interface MatchScoreCardProps {
  match: Match;
  onUpdateScore: (score1: number, score2: number) => Promise<void>;
  onResetScore: () => Promise<void>;
}

function MatchScoreCard({ match, onUpdateScore, onResetScore }: MatchScoreCardProps) {
  const [s1, setS1] = useState<string>(
    match.score1 !== null && match.score1 !== undefined ? String(match.score1) : ""
  );
  const [s2, setS2] = useState<string>(
    match.score2 !== null && match.score2 !== undefined ? String(match.score2) : ""
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setS1(match.score1 !== null && match.score1 !== undefined ? String(match.score1) : "");
    setS2(match.score2 !== null && match.score2 !== undefined ? String(match.score2) : "");
  }, [match.score1, match.score2]);

  const isCompleted = match.status === "COMPLETED";

  // Check if score inputs differ from saved match scores
  const isModified =
    !isCompleted ||
    (s1 !== "" && Number(s1) !== match.score1) ||
    (s2 !== "" && Number(s2) !== match.score2);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (s1 === "" || s2 === "") return;
    setSaving(true);
    try {
      await onUpdateScore(Number(s1), Number(s2));
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    setSaving(true);
    try {
      await onResetScore();
      setS1("");
      setS2("");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-neutral-800 bg-[#07090e] p-4 sm:p-5 shadow-lg flex flex-col justify-between space-y-4">
      {/* Top Header Row */}
      <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
        <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400">
          {match.isKnockout ? match.knockoutLabel?.toUpperCase() : `LEG ${match.legNumber || 1}`}
        </span>
        <span
          className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md border ${
            isCompleted
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "bg-orange-500/10 border-orange-500/30 text-orange-400"
          }`}
        >
          {isCompleted ? "COMPLETED" : "PENDING"}
        </span>
      </div>

      {/* Competitors & Score Inputs */}
      <form onSubmit={handleSave} className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-black text-white truncate flex-1">
            {match.participant1Name || "TBD"}
          </span>
          <input
            type="number"
            min={0}
            value={s1}
            onChange={(e) => setS1(e.target.value)}
            placeholder="0"
            className="w-14 rounded-xl border border-neutral-800 bg-[#0d111a] py-2 text-center text-sm font-extrabold text-white focus:border-orange-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-black text-white truncate flex-1">
            {match.participant2Name || "TBD"}
          </span>
          <input
            type="number"
            min={0}
            value={s2}
            onChange={(e) => setS2(e.target.value)}
            placeholder="0"
            className="w-14 rounded-xl border border-neutral-800 bg-[#0d111a] py-2 text-center text-sm font-extrabold text-white focus:border-orange-500 focus:outline-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2 border-t border-neutral-900">
          {/* Reset Button (Always enabled) */}
          <button
            type="button"
            onClick={handleReset}
            disabled={saving}
            title="Reset Match Score"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-red-900/50 bg-red-950/20 text-red-400 hover:bg-red-900/40 transition cursor-pointer disabled:opacity-50"
          >
            <RotateCcw className="h-4 w-4" />
          </button>

          {/* Primary Action Button */}
          {isCompleted && !isModified ? (
            /* Match Recorded at least once and not edited -> Green UPDATED button */
            <button
              type="button"
              disabled
              className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/15 py-2.5 text-xs font-black uppercase tracking-wider text-emerald-400 cursor-default"
            >
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              UPDATED
            </button>
          ) : isCompleted && isModified ? (
            /* Match Recorded but score modified in input -> MODIFY SCORE button */
            <button
              type="submit"
              disabled={saving || s1 === "" || s2 === ""}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-orange-500 bg-orange-500/20 hover:bg-orange-500/30 py-2.5 text-xs font-black uppercase tracking-wider text-orange-400 transition cursor-pointer disabled:opacity-50"
            >
              <Save className="h-3.5 w-3.5" />
              {saving ? "MODIFYING..." : "MODIFY SCORE"}
            </button>
          ) : (
            /* Match Pending -> UPDATE SCORE button */
            <button
              type="submit"
              disabled={saving || s1 === "" || s2 === ""}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-orange-500/50 bg-orange-500/10 hover:bg-orange-500/20 py-2.5 text-xs font-black uppercase tracking-wider text-orange-400 transition cursor-pointer disabled:opacity-50"
            >
              <Save className="h-3.5 w-3.5" />
              {saving ? "SAVING..." : "UPDATE SCORE"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default function Admin() {
  const navigate = useNavigate();
  const { success: alertSuccess, error: alertError, showConfirm } = useAlert();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [standings, setStandings] = useState<StandingGroup[]>([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Active tab state: roster | brackets | scores
  const [activeTab, setActiveTab] = useState<"roster" | "brackets" | "scores">("roster");

  // Tab 3 Filter States
  const [selectedPhase, setSelectedPhase] = useState<string>("ALL");
  const [searchCompetitor, setSearchCompetitor] = useState<string>("");

  // Form states
  const [newPlayerName, setNewPlayerName] = useState("");
  const [bulkPlayerNames, setBulkPlayerNames] = useState("");
  const [newTourney, setNewTourney] = useState<{
    name: string;
    mode: "VSA" | "H2H";
    totalPlayers: number;
    totalGroups: number;
    qualificationCount: number;
    logoUrl: string;
  }>({
    name: "",
    mode: "H2H",
    totalPlayers: 16,
    totalGroups: 4,
    qualificationCount: 2,
    logoUrl: ""
  });

  useEffect(() => {
    const authed = localStorage.getItem("admin_authenticated");
    if (!authed) {
      navigate("/admin/login");
      return;
    }

    const unsub = tournamentService.subscribeAll((data) => {
      setTournaments(data);
      if (data.length > 0) {
        setSelectedTournament((prev) => {
          if (prev) {
            const updated = data.find((t) => t.id === prev.id);
            if (updated && updated.status === prev.status && updated.name === prev.name) {
              return prev;
            }
            return updated || data[0];
          }
          return data[0];
        });
      }
      setLoading(false);
    });

    return () => unsub();
  }, [navigate]);

  useEffect(() => {
    if (!selectedTournament?.id) return;
    const tId = selectedTournament.id;

    participantService.getByTournament(tId).then(setParticipants);

    const unsubMatches = matchService.subscribeByTournament(tId, (mList) => {
      setMatches(mList);
      standingsService.calculateStandings(tId).then(setStandings);
    });

    return () => unsubMatches();
  }, [selectedTournament?.id]);

  const handleLogout = () => {
    authService.logout();
    localStorage.removeItem("admin_authenticated");
    navigate("/admin/login");
  };

  const handleLogoUploadForNew = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const dataUrl = evt.target?.result as string;
      if (dataUrl) {
        const compressed = await compressImage(dataUrl);
        setNewTourney((prev) => ({ ...prev, logoUrl: compressed }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleLogoUploadForSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedTournament) return;
    setActionLoading(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const dataUrl = evt.target?.result as string;
      if (dataUrl) {
        try {
          await tournamentService.update(selectedTournament.id, { logoUrl: dataUrl });
          await refreshTournamentData(selectedTournament.id);
          alertSuccess("Tournament logo updated successfully!");
        } catch (err: any) {
          alertError(err.message);
        } finally {
          setActionLoading(false);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCreateTournament = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const payload = {
        ...newTourney,
        logoUrl: newTourney.logoUrl || "/fall_frenzy_logo.png"
      };
      const created = await tournamentService.create(payload);
      setSelectedTournament(created);
      alertSuccess("Tournament created successfully!");
      setNewTourney({
        name: "",
        mode: "H2H",
        totalPlayers: 16,
        totalGroups: 4,
        qualificationCount: 2,
        logoUrl: ""
      });
    } catch (err: any) {
      alertError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddParticipant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTournament) return;
    const trimmed = newPlayerName.trim();
    if (!trimmed) return;

    if (participants.length >= selectedTournament.totalPlayers) {
      alertError(`Roster capacity reached (${selectedTournament.totalPlayers} players max).`);
      return;
    }

    const isDuplicate = participants.some(
      (p) => p.displayName.trim().toLowerCase() === trimmed.toLowerCase()
    );
    if (isDuplicate) {
      alertError(`Player "${trimmed}" is already registered.`);
      return;
    }

    setActionLoading(true);
    try {
      await participantService.add(selectedTournament.id, trimmed);
      setNewPlayerName("");
      const updated = await participantService.getByTournament(selectedTournament.id);
      setParticipants(updated);
      alertSuccess(`Player "${trimmed}" added!`);
    } catch (err: any) {
      alertError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTournament) return;
    const rawLines = bulkPlayerNames.split("\n").map((n) => n.trim()).filter((n) => n.length > 0);
    if (rawLines.length === 0) return;

    const remainingSlots = selectedTournament.totalPlayers - participants.length;
    if (remainingSlots <= 0) {
      alertError(`Roster is full (${selectedTournament.totalPlayers} players max).`);
      return;
    }

    // Deduplicate within the batch itself
    const seenBatch = new Set<string>();
    const uniqueBatch: string[] = [];
    for (const name of rawLines) {
      const lower = name.toLowerCase();
      if (!seenBatch.has(lower)) {
        seenBatch.add(lower);
        uniqueBatch.push(name);
      }
    }

    // Check against already registered participants
    const existingLower = new Set(participants.map((p) => p.displayName.trim().toLowerCase()));
    const toAdd: string[] = [];
    const skippedDuplicates: string[] = [];

    for (const name of uniqueBatch) {
      if (existingLower.has(name.toLowerCase())) {
        skippedDuplicates.push(name);
      } else {
        toAdd.push(name);
      }
    }

    if (toAdd.length === 0) {
      alertError("All entered players are already registered.");
      return;
    }

    if (toAdd.length > remainingSlots) {
      alertError(
        `Cannot add ${toAdd.length} players. Only ${remainingSlots} slot(s) remaining (Max ${selectedTournament.totalPlayers}).`
      );
      return;
    }

    setActionLoading(true);
    try {
      await participantService.bulkAdd(selectedTournament.id, toAdd);
      setBulkPlayerNames("");
      const updated = await participantService.getByTournament(selectedTournament.id);
      setParticipants(updated);
      if (skippedDuplicates.length > 0) {
        alertSuccess(`Added ${toAdd.length} player(s). (${skippedDuplicates.length} duplicates skipped)`);
      } else {
        alertSuccess(`Added ${toAdd.length} player(s)!`);
      }
    } catch (err: any) {
      alertError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveParticipant = async (pId: string) => {
    if (!selectedTournament) return;
    try {
      await participantService.remove(pId);
      const updated = await participantService.getByTournament(selectedTournament.id);
      setParticipants(updated);
    } catch (err: any) {
      alertError(err.message);
    }
  };

  const refreshTournamentData = async (tId: string) => {
    try {
      const allTourneys = await tournamentService.getAll();
      setTournaments(allTourneys);
      const updatedT = allTourneys.find((t) => t.id === tId);
      if (updatedT) setSelectedTournament(updatedT);

      const mList = await matchService.getByTournament(tId);
      setMatches(mList);
      const sList = await standingsService.calculateStandings(tId);
      setStandings(sList);
    } catch (e) {
      console.warn("Failed to refresh tournament data:", e);
    }
  };

  const handleGenerateGroups = async () => {
    if (!selectedTournament) return;
    setActionLoading(true);
    try {
      await groupService.generate(selectedTournament.id);
      await refreshTournamentData(selectedTournament.id);
      alertSuccess("Groups generated successfully!");
    } catch (err: any) {
      alertError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleGenerateFixtures = async () => {
    if (!selectedTournament) return;
    setActionLoading(true);
    try {
      await matchService.generateFixtures(selectedTournament.id);
      await refreshTournamentData(selectedTournament.id);
      alertSuccess("Fixtures generated successfully!");
    } catch (err: any) {
      alertError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleGenerateKnockouts = async () => {
    if (!selectedTournament) return;
    setActionLoading(true);
    try {
      await knockoutService.generateBracket(selectedTournament.id);
      await refreshTournamentData(selectedTournament.id);
      alertSuccess("Knockout stage initialized!");
    } catch (err: any) {
      alertError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetTournament = () => {
    if (!selectedTournament) return;
    showConfirm({
      title: "Reset Tournament",
      message: "Reset this tournament? All groups and matches will be wiped. This cannot be undone.",
      type: "warning",
      confirmText: "Reset",
      onConfirm: async () => {
        setActionLoading(true);
        try {
          await tournamentService.reset(selectedTournament.id);
          await refreshTournamentData(selectedTournament.id);
          alertSuccess("Tournament reset to Draft state.");
        } catch (err: any) {
          alertError(err.message);
        } finally {
          setActionLoading(false);
        }
      }
    });
  };

  const handleDeleteTournament = () => {
    if (!selectedTournament) return;
    showConfirm({
      title: "Delete Tournament",
      message: "Permanently delete this tournament? All data will be lost. This cannot be undone.",
      type: "danger",
      confirmText: "Delete",
      onConfirm: async () => {
        setActionLoading(true);
        try {
          await tournamentService.delete(selectedTournament.id);
          setSelectedTournament(null);
          alertSuccess("Tournament deleted.");
        } catch (err: any) {
          alertError(err.message);
        } finally {
          setActionLoading(false);
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <p className="text-xs font-bold uppercase tracking-widest text-neutral-500">
          Loading Control Center...
        </p>
      </div>
    );
  }

  const isRosterLocked = selectedTournament ? selectedTournament.status !== "DRAFT" : false;

  // Phase options for Tab 3 filter
  const phaseOptions = [
    { value: "ALL", label: "All Matches" },
    ...standings.map((sg) => ({
      value: sg.groupId,
      label: `${sg.groupName} Matches`
    })),
    { value: "LEG_1", label: "Leg 1 Matches" },
    { value: "LEG_2", label: "Leg 2 Matches" },
    { value: "KNOCKOUTS", label: "Knockout Matches" }
  ];

  const getPhaseTitle = (phase: string) => {
    if (phase === "ALL") return "ALL MATCH FIXTURES";
    if (phase === "LEG_1") return "LEG 1 MATCH FIXTURES";
    if (phase === "LEG_2") return "LEG 2 MATCH FIXTURES";
    if (phase === "KNOCKOUTS") return "KNOCKOUT MATCH FIXTURES";
    const foundGroup = standings.find((sg) => sg.groupId === phase);
    if (foundGroup) return `${foundGroup.groupName.toUpperCase()} MATCH FIXTURES`;
    return "MATCH FIXTURES";
  };

  const filteredMatches = matches.filter((m) => {
    if (selectedPhase !== "ALL") {
      if (selectedPhase === "LEG_1") {
        if (m.isKnockout || m.legNumber !== 1) return false;
      } else if (selectedPhase === "LEG_2") {
        if (m.isKnockout || m.legNumber !== 2) return false;
      } else if (selectedPhase === "KNOCKOUTS") {
        if (!m.isKnockout) return false;
      } else {
        if (m.groupId !== selectedPhase) return false;
      }
    }

    if (searchCompetitor.trim()) {
      const q = searchCompetitor.toLowerCase().trim();
      const p1 = (m.participant1Name || "").toLowerCase();
      const p2 = (m.participant2Name || "").toLowerCase();
      if (!p1.includes(q) && !p2.includes(q)) return false;
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-black text-slate-100 selection:bg-orange-500 selection:text-black">
      {/* Top Header */}
      <header className="border-b border-neutral-900 bg-black px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex flex-col gap-4 md:flex-row md:items-center md:justify-between max-w-7xl">
          {/* Header Left Title */}
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-500 text-black font-extrabold">
                <Trophy className="h-4 w-4" />
              </span>
              <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wide text-white">
                Tournament Control Center
              </h1>
            </div>
            <p className="text-xs font-medium text-neutral-500 mt-1">
              Admin workflows: create, register, group, schedule, record, and generate brackets.
            </p>
          </div>

          {/* Header Right Actions */}
          <div className="flex items-center gap-3">
            <div className="w-64 sm:w-80">
              <CustomDropdown
                options={tournaments.map((t) => ({
                  value: t.id,
                  label: `${t.name} (${t.mode} - ${
                    t.status === "KNOCKOUTS_ACTIVE"
                      ? "Knockouts Live"
                      : t.status === "FIXTURES_ACTIVE"
                      ? "League Stage"
                      : t.status
                  })`
                }))}
                value={selectedTournament?.id || ""}
                onChange={(val) => {
                  const found = tournaments.find((t) => t.id === val);
                  if (found) setSelectedTournament(found);
                }}
                placeholder="Select Tournament"
              />
            </div>

            {selectedTournament && (
              <button
                type="button"
                onClick={handleDeleteTournament}
                title="Delete Tournament"
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-red-900/50 bg-red-950/20 text-red-400 hover:bg-red-900/40 hover:text-red-200 transition"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-xl border border-neutral-800 bg-[#0d111a] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-neutral-300 hover:text-white hover:border-neutral-700 transition"
            >
              <LogOut className="h-3.5 w-3.5" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Left Column: Create Tournament Form */}
          <div className="lg:col-span-4">
            <div className="rounded-2xl border border-neutral-800 bg-[#07090e] p-5 sm:p-6">
              <h2 className="text-base font-extrabold uppercase tracking-wide text-orange-500 mb-5 flex items-center gap-2">
                <Plus className="h-4 w-4 text-orange-500" />
                Create Tournament
              </h2>

              <form onSubmit={handleCreateTournament} className="space-y-4">
                {/* Tournament Name */}
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 mb-1.5">
                    Tournament Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newTourney.name}
                    onChange={(e) => setNewTourney({ ...newTourney, name: e.target.value })}
                    placeholder="e.g. Champions Cup H2H"
                    className="w-full rounded-xl border border-neutral-800 bg-[#0d111a] px-3.5 py-2.5 text-xs text-white placeholder-neutral-600 focus:border-orange-500 focus:outline-none"
                  />
                </div>

                {/* Mode Selector */}
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 mb-1.5">
                    Mode
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setNewTourney({ ...newTourney, mode: "H2H" })}
                      className={`rounded-xl py-2.5 text-xs font-extrabold transition ${
                        newTourney.mode === "H2H"
                          ? "bg-orange-500 text-black shadow-md shadow-orange-500/20"
                          : "border border-neutral-800 bg-[#0d111a] text-neutral-400 hover:text-white"
                      }`}
                    >
                      H2H Mode
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewTourney({ ...newTourney, mode: "VSA" })}
                      className={`rounded-xl py-2.5 text-xs font-extrabold transition ${
                        newTourney.mode === "VSA"
                          ? "bg-orange-500 text-black shadow-md shadow-orange-500/20"
                          : "border border-neutral-800 bg-[#0d111a] text-neutral-400 hover:text-white"
                      }`}
                    >
                      VSA Mode
                    </button>
                  </div>
                </div>

                {/* Max Players & Num of Groups */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 mb-1.5">
                      Max Players
                    </label>
                    <input
                      type="number"
                      min={2}
                      value={newTourney.totalPlayers}
                      onChange={(e) => setNewTourney({ ...newTourney, totalPlayers: Number(e.target.value) })}
                      className="w-full rounded-xl border border-neutral-800 bg-[#0d111a] px-3.5 py-2 text-xs text-white focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 mb-1.5">
                      Num of Groups
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={newTourney.totalGroups}
                      onChange={(e) => setNewTourney({ ...newTourney, totalGroups: Number(e.target.value) })}
                      className="w-full rounded-xl border border-neutral-800 bg-[#0d111a] px-3.5 py-2 text-xs text-white focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Qualification Count */}
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 mb-1.5">
                    Qualification Count (Top X per group)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={newTourney.qualificationCount}
                    onChange={(e) => setNewTourney({ ...newTourney, qualificationCount: Number(e.target.value) })}
                    className="w-full rounded-xl border border-neutral-800 bg-[#0d111a] px-3.5 py-2 text-xs text-white focus:border-orange-500 focus:outline-none"
                  />
                  <p className="mt-1 text-[10px] font-medium text-neutral-500 leading-tight">
                    This determines how many top standings players in each group advance to single elimination brackets.
                  </p>
                </div>

                {/* Tournament Logo */}
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 mb-1.5">
                    Tournament Logo
                  </label>
                  {newTourney.logoUrl ? (
                    <div className="relative flex flex-col items-center justify-center rounded-xl border border-orange-500/40 bg-[#0d111a] p-3 text-center">
                      <img
                        src={newTourney.logoUrl}
                        alt="Logo Preview"
                        className="h-16 w-16 object-contain rounded-lg mb-2 border border-neutral-700 bg-black/40"
                      />
                      <button
                        type="button"
                        onClick={() => setNewTourney((prev) => ({ ...prev, logoUrl: "" }))}
                        className="text-[10px] font-bold text-red-400 hover:text-red-300 uppercase tracking-wider"
                      >
                        Remove Image
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-800 bg-[#0d111a] p-4 text-center cursor-pointer hover:border-orange-500/50 transition">
                      <Upload className="h-5 w-5 text-neutral-500 mb-1" />
                      <span className="text-xs font-bold text-neutral-300">Upload Logo Image</span>
                      <span className="text-[9px] text-neutral-500 mt-0.5">PNG, JPG or WebP</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUploadForNew}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="w-full rounded-xl bg-orange-500 py-3 text-xs font-black uppercase text-black hover:bg-orange-400 shadow-lg shadow-orange-500/20 transition cursor-pointer disabled:opacity-50"
                >
                  Create Tournament
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Manage Selected Tournament */}
          <div className="lg:col-span-8 space-y-6">
            {selectedTournament ? (
              <>
                {/* Currently Managing Header Card */}
                <div className="rounded-2xl border border-neutral-800 bg-[#07090e] p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {/* Tournament Logo Thumbnail & Update Trigger */}
                    <div className="relative group shrink-0">
                      <div className="h-16 w-16 rounded-xl border-2 border-orange-500/40 bg-[#0d111a] p-1 shadow-md flex items-center justify-center overflow-hidden">
                        <img
                          src={selectedTournament.logoUrl || "/fall_frenzy_logo.png"}
                          alt={selectedTournament.name}
                          className="h-full w-full object-contain rounded-lg"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/fall_frenzy_logo.png";
                          }}
                        />
                      </div>
                      <label className="absolute inset-0 bg-black/70 rounded-xl opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity text-center p-1">
                        <Upload className="h-4 w-4 text-orange-400" />
                        <span className="text-[8px] font-black uppercase text-white tracking-tighter mt-0.5">Change</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUploadForSelected}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <div>
                      <span className="text-[10px] font-extrabold tracking-widest text-neutral-500 uppercase block mb-1">
                        Currently Managing:
                      </span>
                      <h2 className="text-2xl font-black uppercase text-white tracking-wide">
                        {selectedTournament.name}
                      </h2>

                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className="rounded-md border border-orange-500/40 bg-orange-500/10 px-2 py-0.5 text-[10px] font-extrabold uppercase text-orange-400">
                          {selectedTournament.mode}
                        </span>
                        <span className="rounded-md border border-neutral-700 bg-neutral-800 px-2 py-0.5 text-[10px] font-extrabold uppercase text-neutral-300">
                          {selectedTournament.status === "KNOCKOUTS_ACTIVE"
                            ? "Knockouts Live"
                            : selectedTournament.status === "FIXTURES_ACTIVE"
                            ? "League Stage Live"
                            : selectedTournament.status}
                        </span>
                        <label className="inline-flex items-center gap-1 rounded-md border border-orange-500/30 bg-orange-950/40 px-2.5 py-0.5 text-[10px] font-extrabold uppercase text-orange-400 cursor-pointer hover:bg-orange-500/20 transition">
                          <Upload className="h-3 w-3" />
                          Update Logo
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUploadForSelected}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleResetTournament}
                      title="Reset Tournament Stage"
                      className="inline-flex items-center gap-1 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs font-bold text-amber-400 hover:bg-amber-500/20 transition"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Reset
                    </button>

                    <Link
                      to={`/tournament/${selectedTournament.id}`}
                      target="_blank"
                      className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-2 text-xs font-extrabold uppercase tracking-wider text-white hover:border-orange-500 transition"
                    >
                      Public Page
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>

                {/* Tabs Header Navigation */}
                <div className="border-b border-neutral-800 flex items-center gap-6 px-1">
                  <button
                    onClick={() => setActiveTab("roster")}
                    className={`pb-3 text-xs font-extrabold uppercase tracking-wider transition ${
                      activeTab === "roster"
                        ? "text-orange-500 border-b-2 border-orange-500"
                        : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    1. Roster ({participants.length})
                  </button>
                  <button
                    onClick={() => setActiveTab("brackets")}
                    className={`pb-3 text-xs font-extrabold uppercase tracking-wider transition ${
                      activeTab === "brackets"
                        ? "text-orange-500 border-b-2 border-orange-500"
                        : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    2. Brackets & Pools
                  </button>
                  <button
                    onClick={() => setActiveTab("scores")}
                    className={`pb-3 text-xs font-extrabold uppercase tracking-wider transition ${
                      activeTab === "scores"
                        ? "text-orange-500 border-b-2 border-orange-500"
                        : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    3. Match Scores ({matches.length})
                  </button>
                </div>

                {/* TAB 1: ROSTER */}
                {activeTab === "roster" && (
                  <div className="space-y-6">
                    {/* Locked Banner if tournament started */}
                    {isRosterLocked ? (
                      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs font-extrabold text-amber-500 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
                        <span>Roster is locked because the tournament has started. Additions and removals are disabled.</span>
                      </div>
                    ) : (
                      /* Player Registration Form */
                      <div className="rounded-2xl border border-neutral-800 bg-[#07090e] p-6 space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-extrabold text-sm uppercase text-white tracking-wide">
                            Add Players to Roster
                          </h3>
                          <span
                            className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md border ${
                              participants.length >= selectedTournament.totalPlayers
                                ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-400"
                                : "bg-orange-950/40 border-orange-500/30 text-orange-400"
                            }`}
                          >
                            {participants.length >= selectedTournament.totalPlayers
                              ? "Roster Full ✓"
                              : `${selectedTournament.totalPlayers - participants.length} Slot(s) Left`}
                          </span>
                        </div>

                        {participants.length >= selectedTournament.totalPlayers ? (
                          <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/15 p-3.5 text-center text-xs text-emerald-300 font-medium">
                            All {selectedTournament.totalPlayers} player slots filled! Go to{" "}
                            <span
                              onClick={() => setActiveTab("brackets")}
                              className="font-bold underline text-orange-400 hover:text-orange-300 cursor-pointer"
                            >
                              2. Brackets & Pools
                            </span>{" "}
                            to draw the groups.
                          </div>
                        ) : (
                          <>
                            <form onSubmit={handleAddParticipant} className="flex gap-2">
                              <input
                                type="text"
                                value={newPlayerName}
                                onChange={(e) => setNewPlayerName(e.target.value)}
                                placeholder="Player Display Name"
                                disabled={actionLoading}
                                className="flex-1 rounded-xl border border-neutral-800 bg-[#0d111a] px-3.5 py-2 text-xs text-white focus:border-orange-500 focus:outline-none"
                              />
                              <button
                                type="submit"
                                disabled={actionLoading}
                                className="rounded-xl bg-orange-500 px-4 py-2 text-xs font-black uppercase text-black hover:bg-orange-400 transition cursor-pointer disabled:opacity-50"
                              >
                                Add Player
                              </button>
                            </form>

                            <div className="pt-2 border-t border-neutral-900">
                              <textarea
                                rows={2}
                                value={bulkPlayerNames}
                                onChange={(e) => setBulkPlayerNames(e.target.value)}
                                placeholder={`Paste up to ${
                                  selectedTournament.totalPlayers - participants.length
                                } player names (one per line)`}
                                disabled={actionLoading}
                                className="w-full rounded-xl border border-neutral-800 bg-[#0d111a] px-3.5 py-2 text-xs text-white placeholder-neutral-600 focus:border-orange-500 focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={handleBulkAdd}
                                disabled={actionLoading}
                                className="mt-2 rounded-xl border border-neutral-800 bg-[#0d111a] px-4 py-2 text-xs font-bold text-neutral-300 hover:text-white transition cursor-pointer disabled:opacity-50"
                              >
                                Bulk Import
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    )}

                    {/* Registered Roster Grid */}
                    <div className="rounded-2xl border border-neutral-800 bg-[#07090e] p-6">
                      <div className="flex items-center justify-between border-b border-neutral-800 pb-4 mb-4">
                        <h3 className="font-extrabold text-xs uppercase tracking-wider text-white">
                          Registered Roster
                        </h3>
                        <span className="text-xs font-extrabold text-neutral-400">
                          {participants.length} / {selectedTournament.totalPlayers} Players registered
                        </span>
                      </div>

                      {participants.length === 0 ? (
                        <p className="text-center text-xs text-neutral-500 py-8 font-medium">
                          No players registered yet. Add players above.
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                          {participants.map((p) => (
                            <div
                              key={p.id}
                              className="flex items-center justify-between rounded-xl border border-neutral-800/80 bg-[#0d111a] px-4 py-3 text-xs font-bold text-white shadow-sm"
                            >
                              <span className="truncate">{p.displayName}</span>
                              {!isRosterLocked && (
                                <button
                                  onClick={() => handleRemoveParticipant(p.id)}
                                  className="ml-2 text-neutral-500 hover:text-red-400 font-bold transition"
                                  title="Remove player"
                                >
                                  ×
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 2: BRACKETS & POOLS */}
                {activeTab === "brackets" && (
                  <div className="space-y-6">
                    {/* Action controls card */}
                    <div className="rounded-2xl border-2 border-orange-500/30 bg-[#0d111a] p-6 shadow-xl">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                          <Zap className="h-4 w-4 text-orange-500" />
                          Tournament Stage Action Controls
                        </h3>
                        <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest bg-orange-950/50 border border-orange-500/30 px-2.5 py-1 rounded-md">
                          Stage: {selectedTournament.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* 1. Generate Groups */}
                        {selectedTournament.status !== "DRAFT" ? (
                          <div className="flex flex-col items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4 text-center text-emerald-400 font-bold opacity-90 select-none">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 mb-2">
                              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                            </div>
                            <span className="text-xs uppercase tracking-wide">1. Groups Generated</span>
                            <span className="text-[10px] text-emerald-500/80 mt-1 font-medium">Pools Drawn ✓</span>
                          </div>
                        ) : participants.length < selectedTournament.totalPlayers ? (
                          <div className="flex flex-col items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900/40 p-4 text-center text-neutral-500 font-bold opacity-60 select-none">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-800/40 mb-2">
                              <Users className="h-5 w-5 text-neutral-500" />
                            </div>
                            <span className="text-xs uppercase tracking-wide">1. Generate Groups</span>
                            <span className="text-[10px] text-neutral-500 mt-1 font-medium">
                              Need {selectedTournament.totalPlayers - participants.length} more player(s)
                            </span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={handleGenerateGroups}
                            disabled={actionLoading}
                            className="group relative flex flex-col items-center justify-center rounded-xl border-2 border-orange-500 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 p-4 text-center text-black font-black shadow-lg shadow-orange-500/20 hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
                          >
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-black/20 mb-2">
                              <Users className="h-5 w-5 text-black" />
                            </div>
                            <span className="text-xs uppercase tracking-wide">1. Generate Groups</span>
                            <span className="text-[10px] text-neutral-900/80 mt-1 font-bold">Draw {selectedTournament.totalGroups} Pool Groups</span>
                          </button>
                        )}

                        {/* 2. Generate Fixtures */}
                        {selectedTournament.status === "FIXTURES_ACTIVE" || selectedTournament.status === "KNOCKOUTS_ACTIVE" || selectedTournament.status === "COMPLETED" ? (
                          <div className="flex flex-col items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4 text-center text-emerald-400 font-bold opacity-90 select-none">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 mb-2">
                              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                            </div>
                            <span className="text-xs uppercase tracking-wide">2. Fixtures Active</span>
                            <span className="text-[10px] text-emerald-500/80 mt-1 font-medium">Matches Scheduled ✓</span>
                          </div>
                        ) : selectedTournament.status !== "GROUPS_GENERATED" ? (
                          <div className="flex flex-col items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900/40 p-4 text-center text-neutral-500 font-bold opacity-60 select-none">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-800/40 mb-2">
                              <Zap className="h-5 w-5 text-neutral-500" />
                            </div>
                            <span className="text-xs uppercase tracking-wide">2. Generate Fixtures</span>
                            <span className="text-[10px] text-neutral-500 mt-1 font-medium">Draw groups first</span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={handleGenerateFixtures}
                            disabled={actionLoading}
                            className="group relative flex flex-col items-center justify-center rounded-xl border-2 border-orange-500 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 p-4 text-center text-black font-black shadow-lg shadow-orange-500/20 hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
                          >
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-black/20 mb-2">
                              <Zap className="h-5 w-5 text-black" />
                            </div>
                            <span className="text-xs uppercase tracking-wide">2. Generate Fixtures</span>
                            <span className="text-[10px] text-neutral-900/80 mt-1 font-bold">Create Round Robin</span>
                          </button>
                        )}

                        {/* 3. Initialize Knockouts */}
                        {selectedTournament.status === "KNOCKOUTS_ACTIVE" || selectedTournament.status === "COMPLETED" ? (
                          <div className="flex flex-col items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4 text-center text-emerald-400 font-bold opacity-90 select-none">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 mb-2">
                              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                            </div>
                            <span className="text-xs uppercase tracking-wide">3. Knockouts Active</span>
                            <span className="text-[10px] text-emerald-500/80 mt-1 font-medium">Brackets Live ✓</span>
                          </div>
                        ) : selectedTournament.status !== "FIXTURES_ACTIVE" ? (
                          <div className="flex flex-col items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900/40 p-4 text-center text-neutral-500 font-bold opacity-60 select-none">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-800/40 mb-2">
                              <Trophy className="h-5 w-5 text-neutral-500" />
                            </div>
                            <span className="text-xs uppercase tracking-wide">3. Initialize Knockouts</span>
                            <span className="text-[10px] text-neutral-500 mt-1 font-medium">Activate in fixtures stage</span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={handleGenerateKnockouts}
                            disabled={actionLoading}
                            className="group relative flex flex-col items-center justify-center rounded-xl border-2 border-orange-500 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 p-4 text-center text-black font-black shadow-lg shadow-orange-500/20 hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
                          >
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-black/20 mb-2">
                              <Trophy className="h-5 w-5 text-black" />
                            </div>
                            <span className="text-xs uppercase tracking-wide">3. Initialize Knockouts</span>
                            <span className="text-[10px] text-neutral-900/80 mt-1 font-bold">Seed from Standings</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Group Standings Display */}
                    <div className="rounded-2xl border border-neutral-800 bg-[#07090e] p-6">
                      <h3 className="font-extrabold text-sm uppercase text-white mb-4">
                        Groups & Standings
                      </h3>
                      {standings.length === 0 ? (
                        <p className="text-xs text-neutral-500 text-center py-6 font-medium">
                          No groups generated yet. Click "1. Generate Groups" above.
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {standings.map((sg) => (
                            <div key={sg.groupId} className="rounded-xl border border-neutral-800 bg-[#0d111a] p-4">
                              <h4 className="font-black text-xs uppercase text-orange-500 mb-3">
                                {sg.groupName || "Group"}
                              </h4>
                              <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs text-neutral-300">
                                  <thead>
                                    <tr className="border-b border-neutral-800 text-[10px] font-extrabold uppercase text-neutral-500">
                                      <th className="py-2">Player</th>
                                      <th className="py-2 text-center">P</th>
                                      <th className="py-2 text-center">W</th>
                                      <th className="py-2 text-center">D</th>
                                      <th className="py-2 text-center">L</th>
                                      <th className="py-2 text-center">Pts</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-neutral-800/50">
                                    {sg.standings?.map((st, idx) => (
                                      <tr
                                        key={st.participantId}
                                        className={idx < (selectedTournament?.qualificationCount || 2) ? "text-orange-400 font-bold" : ""}
                                      >
                                        <td className="py-2">{st.displayName}</td>
                                        <td className="py-2 text-center">{st.played}</td>
                                        <td className="py-2 text-center">{st.wins ?? 0}</td>
                                        <td className="py-2 text-center">{st.draws ?? 0}</td>
                                        <td className="py-2 text-center">{st.losses ?? 0}</td>
                                        <td className="py-2 text-center font-bold text-white">{st.points}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 3: MATCH SCORES */}
                {activeTab === "scores" && (
                  <div className="space-y-6">
                    {/* Control Panel: Phase Selector & Search */}
                    <div className="rounded-2xl border border-neutral-800 bg-[#07090e] p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 mb-2">
                          SELECT PHASE OR ROUND TO EDIT
                        </label>
                        <CustomDropdown
                          options={phaseOptions}
                          value={selectedPhase}
                          onChange={(val) => setSelectedPhase(val)}
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 mb-2">
                          SEARCH COMPETITOR
                        </label>
                        <input
                          type="text"
                          value={searchCompetitor}
                          onChange={(e) => setSearchCompetitor(e.target.value)}
                          placeholder="Type player name..."
                          className="w-full rounded-xl border border-neutral-800 bg-[#0d111a] px-4 py-3 text-xs sm:text-sm font-extrabold text-white placeholder-neutral-600 focus:border-orange-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Section Header */}
                    <h3 className="text-sm font-black uppercase tracking-wider text-orange-500">
                      {getPhaseTitle(selectedPhase)}
                    </h3>

                    {/* Match Cards Grid */}
                    {filteredMatches.length === 0 ? (
                      <div className="rounded-2xl border border-neutral-800 bg-[#07090e] p-8 text-center text-xs text-neutral-500 font-medium">
                        No matches match the selected criteria.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredMatches.map((m) => (
                          <MatchScoreCard
                            key={m.id}
                            match={m}
                            onUpdateScore={async (score1, score2) => {
                              await matchService.updateScore(m.id, score1, score2);
                              if (selectedTournament) await refreshTournamentData(selectedTournament.id);
                            }}
                            onResetScore={async () => {
                              await matchService.updateScore(m.id, null, null, true);
                              if (selectedTournament) await refreshTournamentData(selectedTournament.id);
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="rounded-2xl border border-neutral-800 bg-[#07090e] p-12 text-center text-neutral-500">
                No tournament selected. Create a new tournament on the left to begin.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
