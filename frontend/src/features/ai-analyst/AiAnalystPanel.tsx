"use client";

import React from "react";
import {
  Sparkles,
  ShieldAlert,
  Wrench,
  ArrowRight,
  HelpCircle,
  Lightbulb,
  CheckCircle2,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export const AiAnalystPanel: React.FC = () => {
  const { setActiveView, setSelectedFinding, findings } = useApp();

  const topFinding = findings.find((f) => f.severity === "critical") || findings[0];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0071E3]/10 text-[#0071E3] text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Integrated AI Intelligence</span>
        </div>
        <h1 className="text-2xl font-bold text-[#1D1D1F] tracking-tight">
          Security Analyst
        </h1>
        <p className="text-xs text-[#6E6E73] mt-1">
          Evidence-grounded root-cause analysis and actionable developer guidance.
        </p>
      </div>

      {/* Primary AI Advisory Hero Card */}
      <div className="bg-white rounded-apple-2xl p-8 border border-black/[0.06] shadow-apple-card space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-apple bg-[#0071E3]/10 text-[#0071E3] flex items-center justify-center">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#86868B]">
              Key Advisory Insight
            </span>
            <h2 className="text-base font-bold text-[#1D1D1F]">
              API Guardian found something important in your clinical API.
            </h2>
          </div>
        </div>

        {/* Highlighted BOLA finding */}
        <div className="p-5 rounded-apple-xl bg-[#F5F5F7] border border-black/[0.04] space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Badge variant="critical">CRITICAL RISK</Badge>
              <span className="font-mono text-xs font-bold text-[#1D1D1F]">
                GET /patients/&#123;id&#125;
              </span>
            </div>
            <span className="text-xs text-[#86868B]">OWASP API1:2023</span>
          </div>

          <div className="space-y-1">
            <h4 className="text-xs font-bold text-[#1D1D1F] uppercase tracking-wider">
              Why did this fail?
            </h4>
            <p className="text-xs text-[#6E6E73] leading-relaxed">
              The endpoint accepts a user-controlled patient ID in the path but does not verify that the requesting session identity owns the record before returning sensitive protected health data.
            </p>
          </div>

          <div className="space-y-1">
            <h4 className="text-xs font-bold text-[#1D1D1F] uppercase tracking-wider">
              Recommended Action:
            </h4>
            <p className="text-xs text-emerald-800 bg-emerald-50/80 p-3 rounded-apple border border-emerald-200/80 leading-relaxed font-medium">
              Check that the authenticated user is authorized to access the requested patient before returning the resource:
              <br />
              <code className="font-mono text-[11px] text-emerald-900 mt-1 block">
                if patient.user_id != current_user.id: raise HTTPException(status_code=403)
              </code>
            </p>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (topFinding) setSelectedFinding(topFinding);
                setActiveView("vulnerabilities");
              }}
              icon={<ShieldAlert className="w-3.5 h-3.5" />}
            >
              Show Attack
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setActiveView("fix-center")}
              icon={<Wrench className="w-3.5 h-3.5" />}
            >
              Verify Fix
            </Button>
          </div>
        </div>
      </div>

      {/* Secondary AI Observations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-apple-xl p-6 border border-black/[0.06] shadow-apple-card space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[#1D1D1F]">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            Authentication Posture
          </div>
          <p className="text-xs text-[#6E6E73] leading-relaxed">
            All administrative routes verify JWT tokens, and token expiration is enforced. No unauthenticated data leakage detected on auth endpoints.
          </p>
        </div>

        <div className="bg-white rounded-apple-xl p-6 border border-black/[0.06] shadow-apple-card space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[#1D1D1F]">
            <HelpCircle className="w-4 h-4 text-amber-500" />
            Input Validation Note
          </div>
          <p className="text-xs text-[#6E6E73] leading-relaxed">
            Payment endpoint accepts unconstrained negative values for amount parameters. Adding schema validation will block balance manipulation exploits.
          </p>
        </div>
      </div>
    </div>
  );
};
