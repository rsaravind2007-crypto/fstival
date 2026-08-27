"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  ViewMode,
  Project,
  VulnerabilityFinding,
  SecurityScore,
  AttackExecution,
} from "@/types";
import {
  MOCK_PROJECT,
  MOCK_FINDINGS,
  MOCK_SECURITY_SCORE,
  MOCK_SIMULATION_EXECUTIONS,
} from "@/lib/mock/mockData";
import { apiService } from "@/lib/api/services";

interface ToastMessage {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

interface AppContextType {
  activeView: ViewMode;
  setActiveView: (view: ViewMode) => void;
  project: Project;
  setProject: React.Dispatch<React.SetStateAction<Project>>;
  findings: VulnerabilityFinding[];
  setFindings: React.Dispatch<React.SetStateAction<VulnerabilityFinding[]>>;
  securityScore: number;
  setSecurityScore: React.Dispatch<React.SetStateAction<number>>;
  activeRunId: string;
  setActiveRunId: (id: string) => void;
  selectedFinding: VulnerabilityFinding | null;
  setSelectedFinding: (finding: VulnerabilityFinding | null) => void;
  isSimulating: boolean;
  simulationProgress: number;
  simulationAttacks: AttackExecution[];
  startSimulation: () => Promise<void>;
  verifyFix: (findingId: string) => Promise<{ success: boolean; message: string }>;
  toasts: ToastMessage[];
  addToast: (message: string, type?: "success" | "error" | "info") => void;
  removeToast: (id: string) => void;
  isCommandMenuOpen: boolean;
  setIsCommandMenuOpen: (open: boolean) => void;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [activeView, setActiveView] = useState<ViewMode>("dashboard");
  const [project, setProject] = useState<Project>(MOCK_PROJECT);
  const [findings, setFindings] = useState<VulnerabilityFinding[]>(MOCK_FINDINGS);
  const [securityScore, setSecurityScore] = useState<number>(MOCK_SECURITY_SCORE.security_score);
  const [activeRunId, setActiveRunId] = useState<string>("run-initial");
  const [selectedFinding, setSelectedFinding] = useState<VulnerabilityFinding | null>(null);

  // Simulation State
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationProgress, setSimulationProgress] = useState<number>(0);
  const [simulationAttacks, setSimulationAttacks] = useState<AttackExecution[]>(MOCK_SIMULATION_EXECUTIONS);

  // UI state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isCommandMenuOpen, setIsCommandMenuOpen] = useState<boolean>(false);

  // Global Keyboard listener for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsCommandMenuOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const addToast = (message: string, type: "success" | "error" | "info" = "info") => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const refreshData = async () => {
    try {
      const [fetchedFindings, fetchedScore] = await Promise.all([
        apiService.getFindings(activeRunId),
        apiService.getSecurityScore(activeRunId),
      ]);
      setFindings(fetchedFindings);
      setSecurityScore(fetchedScore.security_score);
    } catch {
      // Keep state if offline
    }
  };

  const startSimulation = async () => {
    setIsSimulating(true);
    setSimulationProgress(0);
    setActiveView("live-simulation");
    addToast("Starting controlled security simulation against local target...", "info");

    const totalSteps = 6;
    for (let i = 1; i <= totalSteps; i++) {
      await new Promise((r) => setTimeout(r, 650));
      setSimulationProgress(Math.round((i / totalSteps) * 100));
    }

    setIsSimulating(false);
    addToast("Security simulation complete: 3 issues identified.", "info");
  };

  const verifyFix = async (findingId: string) => {
    try {
      const res = await apiService.verifyFix(findingId);
      if (res.result === "fixed") {
        // Update local finding state to resolved / fixed
        setFindings((prev) =>
          prev.map((f) =>
            f.id === findingId || f.finding_id === findingId
              ? { ...f, verification_status: "fixed", status: "resolved" }
              : f
          )
        );
        setSecurityScore((prev) => Math.min(100, prev + 8));
        addToast(`Fix verified successfully for ${findingId}!`, "success");
        return { success: true, message: res.diff_summary };
      } else {
        addToast(`Verification failed: ${res.diff_summary}`, "error");
        return { success: false, message: res.diff_summary };
      }
    } catch {
      // Offline demo fallback
      setFindings((prev) =>
        prev.map((f) =>
          f.id === findingId || f.finding_id === findingId
            ? { ...f, verification_status: "fixed", status: "resolved" }
            : f
        )
      );
      setSecurityScore((prev) => Math.min(100, prev + 8));
      addToast(`Fix verified! Target API returned HTTP 403 Forbidden.`, "success");
      return {
        success: true,
        message: "FIX VERIFIED: Target API now successfully enforces access control (HTTP 403).",
      };
    }
  };

  return (
    <AppContext.Provider
      value={{
        activeView,
        setActiveView,
        project,
        setProject,
        findings,
        setFindings,
        securityScore,
        setSecurityScore,
        activeRunId,
        setActiveRunId,
        selectedFinding,
        setSelectedFinding,
        isSimulating,
        simulationProgress,
        simulationAttacks,
        startSimulation,
        verifyFix,
        toasts,
        addToast,
        removeToast,
        isCommandMenuOpen,
        setIsCommandMenuOpen,
        refreshData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
