"use client";

import React, { useState } from "react";
import {
  Layers,
  ArrowRight,
  Database,
  Lock,
  GitMerge,
  ShieldCheck,
  Server,
  FileCode,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { MetricCard } from "@/components/ui/MetricCard";
import { Badge } from "@/components/ui/Badge";
import { MOCK_ENDPOINTS, MOCK_RESOURCES, MOCK_WORKFLOWS } from "@/lib/mock/mockData";

export const ApiOverviewView: React.FC = () => {
  const { project, securityScore } = useApp();
  const [selectedResource, setSelectedResource] = useState<string>("Patients");

  const filteredEndpoints = MOCK_ENDPOINTS.filter(
    (ep) =>
      ep.tags.includes(selectedResource) ||
      ep.path.toLowerCase().includes(selectedResource.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Header */}
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[#86868B]">
          Architecture & Discovery
        </h2>
        <h1 className="text-2xl font-bold text-[#1D1D1F] tracking-tight mt-0.5">
          API Overview
        </h1>
        <p className="text-xs text-[#6E6E73] mt-1">
          Automatically discovered endpoints, data models, inferred roles, and multi-step workflows.
        </p>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <MetricCard
          label="Endpoints"
          value={MOCK_ENDPOINTS.length}
          subtext="Discovered across 4 tags"
          icon={<Server className="w-4 h-4" />}
        />
        <MetricCard
          label="Resources"
          value={MOCK_RESOURCES.length}
          subtext="Entity data models"
          icon={<Database className="w-4 h-4" />}
        />
        <MetricCard
          label="Workflows"
          value={MOCK_WORKFLOWS.length}
          subtext="Multi-step sequences"
          icon={<GitMerge className="w-4 h-4" />}
        />
        <MetricCard
          label="Security Score"
          value={securityScore}
          subtext="Posture rating"
          icon={<ShieldCheck className="w-4 h-4 text-emerald-500" />}
        />
      </div>

      {/* Visual Relationship Map: Users -> Patients -> Appointments -> Triage -> Reports */}
      <div className="bg-white rounded-apple-xl p-6 border border-black/[0.06] shadow-apple-card space-y-4">
        <div className="flex items-center justify-between border-b border-black/[0.04] pb-3">
          <div>
            <h3 className="text-sm font-semibold text-[#1D1D1F] tracking-tight">
              Resource Dependency Map
            </h3>
            <p className="text-xs text-[#86868B] mt-0.5">
              Click a resource node to filter related endpoints.
            </p>
          </div>
          <span className="text-xs font-mono text-[#86868B] bg-[#F5F5F7] px-2.5 py-1 rounded-full border border-black/[0.04]">
            5 Connected Domains
          </span>
        </div>

        {/* Horizontal Node Flow */}
        <div className="flex flex-wrap items-center justify-between gap-3 py-4 overflow-x-auto">
          {MOCK_RESOURCES.map((res, index) => {
            const isSelected = selectedResource === res.name;
            return (
              <React.Fragment key={res.name}>
                <button
                  onClick={() => setSelectedResource(res.name)}
                  className={`flex flex-col items-center p-4 rounded-apple-lg border transition-all duration-150 min-w-[130px] ${
                    isSelected
                      ? "bg-[#0071E3]/5 border-[#0071E3] shadow-sm ring-2 ring-[#0071E3]/20"
                      : "bg-[#F5F5F7] border-black/[0.05] hover:bg-[#EAEAEA] text-[#1D1D1F]"
                  }`}
                >
                  <Database
                    className={`w-5 h-5 mb-2 ${
                      isSelected ? "text-[#0071E3]" : "text-[#6E6E73]"
                    }`}
                  />
                  <span
                    className={`text-xs font-bold ${
                      isSelected ? "text-[#0071E3]" : "text-[#1D1D1F]"
                    }`}
                  >
                    {res.name}
                  </span>
                  <span className="text-[10px] text-[#86868B] mt-0.5">
                    {res.endpoints_count} Endpoints
                  </span>
                </button>

                {index < MOCK_RESOURCES.length - 1 && (
                  <div className="text-[#86868B] flex-shrink-0">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Filtered Endpoints Catalog */}
      <div className="bg-white rounded-apple-xl p-6 border border-black/[0.06] shadow-apple-card space-y-4">
        <div className="flex items-center justify-between border-b border-black/[0.04] pb-3">
          <h3 className="text-sm font-semibold text-[#1D1D1F] tracking-tight">
            Endpoints for &quot;{selectedResource}&quot;
          </h3>
          <span className="text-xs text-[#86868B]">
            {filteredEndpoints.length} total operations
          </span>
        </div>

        <div className="divide-y divide-black/[0.04]">
          {filteredEndpoints.map((ep) => (
            <div
              key={ep.id}
              className="py-3 flex items-center justify-between gap-4 hover:bg-[#F5F5F7]/60 px-3 rounded-apple transition-colors"
            >
              <div className="flex items-center gap-3">
                <Badge method={ep.method}>{ep.method}</Badge>
                <div>
                  <span className="font-mono text-xs font-semibold text-[#1D1D1F]">
                    {ep.path}
                  </span>
                  <p className="text-[11px] text-[#86868B] mt-0.5">
                    {ep.summary || "No description provided"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {ep.is_authenticated ? (
                  <span className="flex items-center gap-1 text-[11px] text-[#6E6E73] bg-[#F5F5F7] px-2 py-0.5 rounded-full">
                    <Lock className="w-3 h-3 text-amber-500" />
                    Bearer Token
                  </span>
                ) : (
                  <span className="text-[11px] text-[#86868B] bg-black/[0.03] px-2 py-0.5 rounded-full">
                    Public
                  </span>
                )}
                <span className="text-[11px] font-mono text-[#86868B]">
                  {ep.operation_id}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
