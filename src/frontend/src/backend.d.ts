import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type TherapyTask = {
    __kind__: "cognitiveTask";
    cognitiveTask: string;
} | {
    __kind__: "speechTask";
    speechTask: string;
} | {
    __kind__: "motorTask";
    motorTask: string;
};
export interface UserApprovalInfo {
    status: ApprovalStatus;
    principal: Principal;
}
export interface TherapistFeedback {
    feedbackText: string;
    timestamp: Time;
    therapist: Principal;
}
export type Time = bigint;
export interface PatientTreatmentPlanView {
    patientId: Principal;
    feedback: Array<TherapistFeedback>;
    sessions: Array<TherapySession>;
    recoveryTrend: string;
}
export interface TherapySession {
    task: TherapyTask;
    score: bigint;
    timestamp: Time;
    sessionId: string;
}
export interface UserProfile {
    name: string;
    role: string;
    therapyType?: TherapyType;
    enrolledModules: Array<string>;
}
export enum ApprovalStatus {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export enum TherapyType {
    motorSkills = "motorSkills",
    cognitivePhysical = "cognitivePhysical",
    speech = "speech"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    /**
     * / Therapists add written feedback to a patient's plan.
     */
    addTherapistFeedback(patientId: Principal, feedbackText: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    /**
     * / Assign a role to a user. Only admins may call this (enforced inside assignRole).
     */
    assignUserRole(user: Principal, role: UserRole): Promise<void>;
    /**
     * / An approved patient fetches their own treatment plan.
     */
    fetchCallerPlan(): Promise<PatientTreatmentPlanView>;
    /**
     * / An approved patient fetches their own session scores.
     */
    fetchCallerSessions(): Promise<Array<bigint>>;
    /**
     * / Therapists fetch a specific patient's session scores.
     */
    fetchSessionScores(patientId: Principal): Promise<Array<bigint>>;
    /**
     * / Only authenticated users can fetch exercises; guests cannot.
     */
    fetchSpeechExercises(): Promise<Array<string>>;
    /**
     * / Therapists fetch a specific patient's full treatment plan.
     */
    fetchTreatmentPlan(patientId: Principal): Promise<PatientTreatmentPlanView>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    /**
     * / Any caller (including guests) can check approval status — used by the ApprovalGate UI.
     */
    isCallerApproved(): Promise<boolean>;
    /**
     * / Only admins (therapists) can list all approval requests.
     */
    listApprovals(): Promise<Array<UserApprovalInfo>>;
    /**
     * / Therapists can list all patients who have a treatment plan.
     */
    listPatients(): Promise<Array<Principal>>;
    /**
     * / Only authenticated users (#user) can request approval.
     * / Guests / anonymous principals cannot request access.
     */
    requestApproval(): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    /**
     * / Only admins (therapists) can approve or reject patients.
     */
    setApproval(user: Principal, status: ApprovalStatus): Promise<void>;
    /**
     * / Approved patients submit their own therapy sessions.
     * / Admins (therapists) are explicitly blocked from submitting patient sessions
     * / via this endpoint; they use addTherapistFeedback instead.
     */
    submitSession(task: TherapyTask, score: bigint): Promise<void>;
    /**
     * / Therapists update the computed recovery trend for a patient.
     */
    updateRecoveryTrend(patientId: Principal, trend: string): Promise<void>;
}
