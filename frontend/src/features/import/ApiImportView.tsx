"use client";

import React, { useState } from "react";
import {
  UploadCloud,
  FileCode,
  FolderDown,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Loader2,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";

export const ApiImportView: React.FC = () => {
  const { setActiveView, addToast, startSimulation } = useApp();
  const [activeTab, setActiveTab] = useState<string>("upload");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [jsonText, setJsonText] = useState<string>("");

  const steps = [
    "Reading API specification",
    "Understanding endpoints & data models",
    "Mapping resource dependencies",
    "Discovering multi-step workflows",
    "Preparing automated security tests",
  ];

  const handleStartImport = async () => {
    setIsProcessing(true);
    setIsComplete(false);
    setCurrentStep(0);

    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(i);
      await new Promise((r) => setTimeout(r, 600));
    }

    setIsProcessing(false);
    setIsComplete(true);
    addToast("API specification successfully imported and analyzed!", "success");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in py-4">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-apple-xl bg-[#0071E3]/10 text-[#0071E3] flex items-center justify-center mx-auto shadow-sm">
          <UploadCloud className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-[#1D1D1F] tracking-tight">
          Connect your API
        </h1>
        <p className="text-xs text-[#6E6E73] max-w-md mx-auto">
          Import an OpenAPI specification, Swagger 2.0/3.x document, or Bruno collection to automatically generate intelligent attack plans.
        </p>
      </div>

      {!isProcessing && !isComplete && (
        <div className="bg-white rounded-apple-2xl p-8 border border-black/[0.06] shadow-apple-card space-y-6">
          <div className="flex justify-center">
            <Tabs
              tabs={[
                { id: "upload", label: "Upload OpenAPI" },
                { id: "bruno", label: "Bruno Collection" },
                { id: "paste", label: "Paste YAML / JSON" },
              ]}
              activeTab={activeTab}
              onChange={setActiveTab}
            />
          </div>

          {activeTab === "upload" && (
            <div
              onClick={handleStartImport}
              className="border-2 border-dashed border-[#E5E5EA] hover:border-[#0071E3] bg-[#FBFBFD] hover:bg-[#F5F5F7] rounded-apple-xl p-12 text-center transition-all cursor-pointer group"
            >
              <FileCode className="w-10 h-10 text-[#86868B] group-hover:text-[#0071E3] mx-auto mb-3 transition-colors" />
              <p className="text-sm font-semibold text-[#1D1D1F]">
                Drag and drop your OpenAPI / Swagger file here
              </p>
              <p className="text-xs text-[#86868B] mt-1">
                Supports .yaml, .yml, and .json up to 25MB
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 pointer-events-none"
              >
                Browse File
              </Button>
            </div>
          )}

          {activeTab === "bruno" && (
            <div
              onClick={handleStartImport}
              className="border-2 border-dashed border-[#E5E5EA] hover:border-[#0071E3] bg-[#FBFBFD] hover:bg-[#F5F5F7] rounded-apple-xl p-12 text-center transition-all cursor-pointer group"
            >
              <FolderDown className="w-10 h-10 text-[#86868B] group-hover:text-[#0071E3] mx-auto mb-3 transition-colors" />
              <p className="text-sm font-semibold text-[#1D1D1F]">
                Select Bruno Collection Directory
              </p>
              <p className="text-xs text-[#86868B] mt-1">
                Imports bruno.json and all .bru request files
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 pointer-events-none"
              >
                Select Folder
              </Button>
            </div>
          )}

          {activeTab === "paste" && (
            <div className="space-y-4">
              <textarea
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                placeholder="openapi: 3.0.0&#10;info:&#10;  title: TriageMate API&#10;  version: 1.0.0..."
                rows={8}
                className="w-full text-xs font-mono p-4 rounded-apple border border-[#E5E5EA] bg-[#FBFBFD] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/30"
              />
              <Button
                variant="primary"
                className="w-full"
                onClick={handleStartImport}
              >
                Parse &amp; Ingest Specification
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Processing Animation */}
      {isProcessing && (
        <div className="bg-white rounded-apple-2xl p-8 border border-black/[0.06] shadow-apple-card space-y-6 text-center animate-fade-in">
          <div className="space-y-2">
            <h3 className="text-base font-semibold text-[#1D1D1F]">
              Analyzing your API...
            </h3>
            <p className="text-xs text-[#6E6E73]">
              API Guardian is extracting operations, data constraints, and business logic.
            </p>
          </div>

          {/* Stepper Flow */}
          <div className="space-y-3 max-w-md mx-auto text-left py-4">
            {steps.map((stepText, idx) => {
              const isPast = idx < currentStep;
              const isCurrent = idx === currentStep;
              return (
                <div
                  key={stepText}
                  className={`flex items-center gap-3 p-3 rounded-apple transition-all ${
                    isCurrent
                      ? "bg-[#0071E3]/5 border border-[#0071E3]/30 text-[#0071E3]"
                      : isPast
                      ? "text-emerald-700 font-medium"
                      : "text-[#86868B] opacity-50"
                  }`}
                >
                  {isPast ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  ) : isCurrent ? (
                    <Loader2 className="w-4 h-4 text-[#0071E3] animate-spin flex-shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-current flex-shrink-0" />
                  )}
                  <span className="text-xs font-medium">{stepText}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Completion Screen */}
      {isComplete && (
        <div className="bg-white rounded-apple-2xl p-8 border border-black/[0.06] shadow-apple-card space-y-6 text-center animate-scale-up">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-bold text-[#1D1D1F]">
              Your API is ready.
            </h3>
            <p className="text-xs text-[#6E6E73] max-w-sm mx-auto">
              Discovered 9 endpoints, 5 resources, 2 business workflows, and generated 24 automated attack scenarios.
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => setActiveView("api-overview")}
            >
              Explore API
            </Button>
            <Button
              variant="primary"
              onClick={startSimulation}
              icon={<Sparkles className="w-3.5 h-3.5" />}
            >
              Start Security Simulation
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
