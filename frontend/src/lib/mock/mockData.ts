import {
  Project,
  ApiEndpoint,
  ApiResource,
  ApiWorkflow,
  AttackCategorySummary,
  VulnerabilityFinding,
  SecurityScore,
  AttackGraph,
  AttackChain,
  ScanHistoryItem,
  ExecutiveReport,
  AttackExecution,
} from "@/types";

export const MOCK_PROJECT: Project = {
  id: "proj-triagemate-v2",
  name: "TriageMate Clinical API",
  description: "Core healthcare triage, electronic health records, and clinical scheduling API",
  target_base_url: "http://localhost:8000/demo",
  target_authorized: true,
  created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  updated_at: new Date().toISOString(),
};

export const MOCK_ENDPOINTS: ApiEndpoint[] = [
  { id: "ep-1", path: "/patients/{patient_id}", method: "GET", summary: "Fetch medical record", operation_id: "getPatient", tags: ["Patients"], is_authenticated: true },
  { id: "ep-2", path: "/patients", method: "POST", summary: "Register new patient", operation_id: "createPatient", tags: ["Patients"], is_authenticated: true },
  { id: "ep-3", path: "/users/{user_id}", method: "GET", summary: "Retrieve profile", operation_id: "getUser", tags: ["Users"], is_authenticated: true },
  { id: "ep-4", path: "/users/{user_id}", method: "PUT", summary: "Update account profile", operation_id: "updateUser", tags: ["Users"], is_authenticated: true },
  { id: "ep-5", path: "/admin/users", method: "GET", summary: "List all platform users", operation_id: "listAdminUsers", tags: ["Admin"], is_authenticated: true },
  { id: "ep-6", path: "/orders", method: "POST", summary: "Create prescription order", operation_id: "createOrder", tags: ["Orders"], is_authenticated: true },
  { id: "ep-7", path: "/orders/{order_id}/pay", method: "POST", summary: "Charge order payment", operation_id: "payOrder", tags: ["Payments"], is_authenticated: true },
  { id: "ep-8", path: "/orders/{order_id}/refund", method: "POST", summary: "Process refund", operation_id: "refundOrder", tags: ["Payments"], is_authenticated: true },
  { id: "ep-9", path: "/rate-limit-test", method: "GET", summary: "Check system load", operation_id: "checkLoad", tags: ["Health"], is_authenticated: false },
];

export const MOCK_RESOURCES: ApiResource[] = [
  { name: "Users", endpoints_count: 3, related_resources: ["Patients", "Orders"], description: "User accounts, authentication identities, and clinical roles." },
  { name: "Patients", endpoints_count: 4, related_resources: ["Appointments", "MedicalRecords"], description: "Electronic medical records and confidential patient charts." },
  { name: "Appointments", endpoints_count: 3, related_resources: ["Patients", "Triage"], description: "Doctor consultation schedules and triage priority queue." },
  { name: "Triage", endpoints_count: 2, related_resources: ["Reports"], description: "Clinical acuity scoring and automated nursing triage." },
  { name: "Orders", endpoints_count: 3, related_resources: ["Payments"], description: "Prescription billing and lab test orders." },
];

export const MOCK_WORKFLOWS: ApiWorkflow[] = [
  {
    id: "wf-1",
    name: "Patient Clinical Ingestion Flow",
    steps: [
      { step_number: 1, operation: "Register Patient", endpoint: "/patients", method: "POST" },
      { step_number: 2, operation: "Schedule Consultation", endpoint: "/appointments", method: "POST" },
      { step_number: 3, operation: "Execute Triage Acuity Assessment", endpoint: "/triage", method: "POST" },
    ],
  },
  {
    id: "wf-2",
    name: "Prescription Fulfillment & Payment Lifecycle",
    steps: [
      { step_number: 1, operation: "Create Prescription Order", endpoint: "/orders", method: "POST" },
      { step_number: 2, operation: "Authorize Transaction Payment", endpoint: "/orders/{id}/pay", method: "POST" },
      { step_number: 3, operation: "Discharge & Medication Release", endpoint: "/orders/{id}/refund", method: "POST" },
    ],
  },
];

export const MOCK_ATTACK_CATEGORIES: AttackCategorySummary[] = [
  { category: "bola", name: "BOLA / IDOR", icon: "ShieldAlert", description: "Tests object-level authorization across patient IDs and invoices.", attack_count: 6, potential_issues: 1, severity: "critical" },
  { category: "auth", name: "Authentication", icon: "KeyRound", description: "Audits unauthenticated administrative endpoints and token verification.", attack_count: 5, potential_issues: 1, severity: "critical" },
  { category: "role", name: "Role Escalation", icon: "UserCheck", description: "Verifies mass assignment prevention on user roles and permissions.", attack_count: 4, potential_issues: 1, severity: "high" },
  { category: "input", name: "Input Validation", icon: "FileCode2", description: "Injects negative pricing, boundary overflow, and malformed types.", attack_count: 4, potential_issues: 1, severity: "high" },
  { category: "logic", name: "Business Logic", icon: "Workflow", description: "Tests out-of-order workflow execution and unverified refund replay.", attack_count: 3, potential_issues: 1, severity: "medium" },
  { category: "rate", name: "Rate Limiting", icon: "Zap", description: "Evaluates token bucket thresholds under high-concurrency bursts.", attack_count: 2, potential_issues: 0, severity: "low" },
];

export const MOCK_FINDINGS: VulnerabilityFinding[] = [
  {
    id: "f-bola-01",
    finding_id: "VULN-001",
    attack_id: "ATK-003",
    title: "Broken Object Level Authorization (BOLA) on Patient Records",
    type: "BOLA / IDOR",
    endpoint: "/patients/{patient_id}",
    method: "GET",
    severity: "critical",
    confidence: 0.95,
    status: "confirmed",
    verification_status: "unverified",
    risk_score: 87,
    data_sensitivity: "high",
    confirmed_impact: "Unauthorized authenticated user read confidential patient chart (Patient #102) belonging to another tenant.",
    potential_impact: "Mass exfiltration of 10,000+ patient records via predictable sequential integer ID enumeration.",
    blast_radius_reach: "All Tenant Resources (~10,000+ Objects)",
    blast_radius_confidence: 0.85,
    blast_radius_reasoning: "Endpoint uses predictable sequential IDs in path without tenant/user ownership verification.",
    technical_explanation: "Broken Object Level Authorization (OWASP API1:2023). The endpoint accepts a client-provided patient_id without verifying that the requesting session identity has access to that record.",
    simple_explanation: "A logged-in user can view any patient's confidential medical records simply by changing the ID number in the web request.",
    evidence_explanation: "Requested GET /patients/102 as User 1. Expected HTTP 403 Forbidden, but server returned HTTP 200 with sensitive medical diagnosis.",
    why_it_matters: "BOLA is the most critical risk in modern APIs, directly violating HIPAA and leading to massive customer privacy leaks.",
    remediation: {
      what_to_change: "Verify that patient.user_id matches current_user.id before returning the record.",
      why: "Enforces strict tenant and ownership boundaries at the database access layer.",
      secure_design_principle: "Complete Mediation & Principle of Least Privilege",
      example_pseudocode: `@router.get("/patients/{patient_id}")\nasync def get_patient(patient_id: str, current_user: User = Depends(get_current_user)):\n    patient = await db.get(Patient, patient_id)\n    if not patient:\n        raise HTTPException(status_code=404)\n    if patient.user_id != current_user.id and current_user.role != "admin":\n        raise HTTPException(status_code=403, detail="Forbidden")\n    return patient`,
      target_framework: "FastAPI / Python",
    },
    evidence: {
      request_headers: { Authorization: "Bearer [REDACTED_USER_TOKEN]" },
      response_headers: { "content-type": "application/json" },
      response_body: JSON.stringify({ id: "102", name: "Patient Two", diagnosis: "Confidential Cardiac Record", user_id: "2" }, null, 2),
      actual_status: 200,
      expected_status: 403,
      duration_ms: 24.5,
    },
    steps: [
      { step: 1, name: "Login as User Alice", method: "POST", url: "/auth/token", status_code: 200, duration_ms: 12.0 },
      { step: 2, name: "Request Own Record #101", method: "GET", url: "/patients/101", status_code: 200, duration_ms: 18.0 },
      { step: 3, name: "Request Foreign Record #102", method: "GET", url: "/patients/102", status_code: 200, duration_ms: 24.5 },
    ],
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "f-role-02",
    finding_id: "VULN-002",
    attack_id: "ATK-004",
    title: "Privilege Escalation via Mass Assignment on Profile Update",
    type: "Role Escalation",
    endpoint: "/users/{user_id}",
    method: "PUT",
    severity: "high",
    confidence: 0.92,
    status: "confirmed",
    verification_status: "unverified",
    risk_score: 82,
    data_sensitivity: "high",
    confirmed_impact: "Standard user account successfully modified internal role property to 'admin'.",
    potential_impact: "Total platform administration takeover and access to all administrative APIs.",
    blast_radius_reach: "Full System Administration Scope",
    blast_radius_confidence: 0.90,
    blast_radius_reasoning: "Unfiltered request body deserialization updates database columns directly.",
    technical_explanation: "Mass Assignment (OWASP API3:2023). Request payload model binding fails to exclude privileged columns.",
    simple_explanation: "A standard user can make themselves an administrator by adding role: 'admin' to their profile update.",
    evidence_explanation: "Sent PUT /users/1 with { 'role': 'admin' }. Server accepted with HTTP 200 and upgraded user permissions.",
    why_it_matters: "Enables unprivileged users to seize full system control and bypass all security tiers.",
    remediation: {
      what_to_change: "Use strict Pydantic DTO models that exclude the 'role' field for public profile updates.",
      why: "Ensures privileged attributes can only be modified through dedicated administrative endpoints.",
      secure_design_principle: "Positive Security Model (Allowlists)",
      example_pseudocode: `class UserProfileUpdate(BaseModel):\n    name: Optional[str] = None\n    email: Optional[EmailStr] = None\n    # Do NOT include 'role' here!`,
      target_framework: "FastAPI / Python",
    },
    evidence: {
      request_headers: { "Content-Type": "application/json" },
      response_body: JSON.stringify({ id: "1", name: "Alice User", role: "admin" }, null, 2),
      actual_status: 200,
      expected_status: 403,
      duration_ms: 31.0,
    },
    steps: [
      { step: 1, name: "Send Profile Update with Role: Admin", method: "PUT", url: "/users/1", status_code: 200, duration_ms: 31.0 },
    ],
    created_at: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: "f-tamper-03",
    finding_id: "VULN-003",
    attack_id: "ATK-007",
    title: "Negative Amount Parameter Tampering on Payment Endpoint",
    type: "Input Validation Weakness",
    endpoint: "/orders/{order_id}/pay",
    method: "POST",
    severity: "medium",
    confidence: 0.88,
    status: "confirmed",
    verification_status: "unverified",
    risk_score: 64,
    data_sensitivity: "medium",
    confirmed_impact: "Payment processor processed negative value, reducing total invoice balance.",
    potential_impact: "Financial ledger distortion and balance credit generation.",
    blast_radius_reach: "Financial Transactions Scope",
    blast_radius_confidence: 0.80,
    technical_explanation: "Missing boundary and sign validation on currency amount parameter.",
    simple_explanation: "Users can pay negative dollar amounts to add credit to their account.",
    evidence_explanation: "Submitted POST /orders/101/pay with amount: -50.0. Server accepted with HTTP 200.",
    why_it_matters: "Direct financial loss from malicious balance manipulation.",
    remediation: {
      what_to_change: "Enforce Field(gt=0.0) in Pydantic payment request schemas.",
      why: "Rejects negative and zero values automatically before business logic executes.",
      secure_design_principle: "Input Validation & Fail-Safe Defaults",
      example_pseudocode: `class PaymentRequest(BaseModel):\n    amount: float = Field(..., gt=0.0)`,
      target_framework: "FastAPI / Python",
    },
    evidence: {
      request_headers: { "Content-Type": "application/json" },
      response_body: JSON.stringify({ status: "PAID", order_id: "101", amount_charged: -50.0 }, null, 2),
      actual_status: 200,
      expected_status: 400,
      duration_ms: 19.8,
    },
    steps: [
      { step: 1, name: "Submit Negative Payment Amount", method: "POST", url: "/orders/101/pay", status_code: 200, duration_ms: 19.8 },
    ],
    created_at: new Date(Date.now() - 10800000).toISOString(),
  },
];

export const MOCK_SECURITY_SCORE: SecurityScore = {
  security_score: 94,
  risk_level: "low",
  total_findings: 3,
  critical_count: 1,
  high_count: 1,
  medium_count: 1,
  low_count: 0,
};

export const MOCK_ATTACK_GRAPH: AttackGraph = {
  run_id: "run-sim-latest",
  nodes: [
    { id: "role:user", label: "Authenticated User", type: "role" },
    { id: "ep:patients", label: "GET /patients/{id}", type: "endpoint" },
    { id: "vuln:bola", label: "BOLA Vulnerability (CRITICAL)", type: "vulnerability", metadata: { severity: "critical", risk: 87 } },
    { id: "res:patient_data", label: "Protected Health Records (PHI)", type: "resource" },
    { id: "impact:data_leak", label: "Mass Patient Data Exfiltration", type: "impact" },
    { id: "ep:user_profile", label: "PUT /users/{id}", type: "endpoint" },
    { id: "vuln:role_esc", label: "Privilege Escalation (HIGH)", type: "vulnerability", metadata: { severity: "high", risk: 82 } },
    { id: "role:admin", label: "Elevated Admin Privileges", type: "role" },
  ],
  edges: [
    { source: "role:user", target: "ep:patients", relation: "accesses", label: "Requests Foreign ID" },
    { source: "ep:patients", target: "vuln:bola", relation: "exploits", label: "Lacks Ownership Check" },
    { source: "vuln:bola", target: "res:patient_data", relation: "exposes", label: "Reads Sensitive Chart" },
    { source: "res:patient_data", target: "impact:data_leak", relation: "results_in", label: "Data Compromise" },
    { source: "role:user", target: "ep:user_profile", relation: "accesses", label: "Sends Role Parameter" },
    { source: "ep:user_profile", target: "vuln:role_esc", relation: "exploits", label: "Mass Assignment" },
    { source: "vuln:role_esc", target: "role:admin", relation: "escalates_to", label: "Account Upgrade" },
  ],
};

export const MOCK_ATTACK_CHAINS: AttackChain[] = [
  {
    chain_id: "CHAIN-001",
    title: "Unauthenticated Enumeration to Cross-Tenant BOLA Exfiltration",
    overall_risk: 95,
    explanation: "An attacker leverages predictable resource IDs to harvest confidential medical charts across tenant boundaries.",
    nodes: [
      { id: "role:user", label: "Authenticated User", type: "role" },
      { id: "ep:patients", label: "GET /patients/{id}", type: "endpoint" },
      { id: "vuln:bola", label: "BOLA Authorization Bypass", type: "vulnerability" },
      { id: "impact:data_leak", label: "Mass Medical Data Exfiltration", type: "impact" },
    ],
    edges: [
      { source: "role:user", target: "ep:patients", relation: "accesses" },
      { source: "ep:patients", target: "vuln:bola", relation: "exploits" },
      { source: "vuln:bola", target: "impact:data_leak", relation: "results_in" },
    ],
  },
  {
    chain_id: "CHAIN-002",
    title: "Privilege Escalation to Administrative System Compromise",
    overall_risk: 92,
    explanation: "A standard user modifies profile metadata to gain administrative rights and full system access.",
    nodes: [
      { id: "role:user", label: "Standard User", type: "role" },
      { id: "ep:user_profile", label: "PUT /users/{id}", type: "endpoint" },
      { id: "vuln:role_esc", label: "Mass Assignment", type: "vulnerability" },
      { id: "role:admin", label: "System Administrator", type: "role" },
    ],
    edges: [
      { source: "role:user", target: "ep:user_profile", relation: "accesses" },
      { source: "ep:user_profile", target: "vuln:role_esc", relation: "exploits" },
      { source: "vuln:role_esc", target: "role:admin", relation: "escalates_to" },
    ],
  },
];

export const MOCK_HISTORY: ScanHistoryItem[] = [
  { run_id: "run-today", security_score: 94, total_findings: 3, critical_count: 1, high_count: 1, medium_count: 1, low_count: 0, fixed_count: 2, regression_count: 0, ci_gate_status: "passed", scanned_at: "Today, 2:45 PM" },
  { run_id: "run-yesterday", security_score: 87, total_findings: 5, critical_count: 2, high_count: 2, medium_count: 1, low_count: 0, fixed_count: 1, regression_count: 0, ci_gate_status: "failed", scanned_at: "Yesterday, 11:20 AM" },
  { run_id: "run-3days", security_score: 82, total_findings: 6, critical_count: 3, high_count: 2, medium_count: 1, low_count: 0, fixed_count: 0, regression_count: 0, ci_gate_status: "failed", scanned_at: "Aug 24, 4:10 PM" },
  { run_id: "run-week", security_score: 76, total_findings: 8, critical_count: 4, high_count: 3, medium_count: 1, low_count: 0, fixed_count: 0, regression_count: 1, ci_gate_status: "failed", scanned_at: "Aug 20, 10:00 AM" },
];

export const MOCK_SIMULATION_EXECUTIONS: AttackExecution[] = [
  { id: "atk-1", run_id: "sim-1", attack_id: "ATK-001", category: "Authentication", endpoint: "/patients", method: "GET", status: "passed", severity: "critical", priority: "critical", expected_status: 401, actual_status: 401, duration_ms: 14.2, steps: [] },
  { id: "atk-2", run_id: "sim-1", attack_id: "ATK-002", category: "Input Validation", endpoint: "/orders", method: "POST", status: "passed", severity: "high", priority: "high", expected_status: 400, actual_status: 400, duration_ms: 18.5, steps: [] },
  { id: "atk-3", run_id: "sim-1", attack_id: "ATK-003", category: "BOLA", endpoint: "/patients/{id}", method: "GET", status: "failed", severity: "critical", priority: "critical", expected_status: 403, actual_status: 200, duration_ms: 24.5, objective: "Attempt reading patient 102 as user 1", steps: [] },
  { id: "atk-4", run_id: "sim-1", attack_id: "ATK-004", category: "Role Escalation", endpoint: "/users/1", method: "PUT", status: "failed", severity: "high", priority: "high", expected_status: 403, actual_status: 200, duration_ms: 31.0, objective: "Self-assign role: admin", steps: [] },
  { id: "atk-5", run_id: "sim-1", attack_id: "ATK-005", category: "Rate Limiting", endpoint: "/rate-limit-test", method: "GET", status: "passed", severity: "medium", priority: "medium", expected_status: 429, actual_status: 429, duration_ms: 48.0, steps: [] },
  { id: "atk-6", run_id: "sim-1", attack_id: "ATK-006", category: "Business Logic", endpoint: "/orders/101/refund", method: "POST", status: "failed", severity: "medium", priority: "medium", expected_status: 400, actual_status: 200, duration_ms: 22.0, steps: [] },
];
