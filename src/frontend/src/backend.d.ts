import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Time = bigint;
export interface ProblemReport {
    id: ReportId;
    status: Status;
    resolutionNote?: string;
    createdAt: Time;
    user: Principal;
    description: string;
    category: Category;
}
export type PromptId = string;
export type ScriptId = string;
export type Tag = string;
export interface SavedPrompt {
    id: PromptId;
    title: string;
    createdAt: Time;
    tags: Array<Tag>;
    user: Principal;
    promptText: string;
    promptType: PromptType;
}
export type ReportId = string;
export interface Script {
    id: ScriptId;
    title: string;
    body: string;
    hook: string;
    createdAt: Time;
    tags: Array<Tag>;
    user: Principal;
    callToAction: string;
}
export type ProjectId = string;
export interface VideoProject {
    id: ProjectId;
    title: string;
    createdAt: Time;
    user: Principal;
    updatedAt?: Time;
    stage: Stage;
    notes: string;
}
export interface UserProfile {
    name: string;
}
export enum Category {
    audio = "audio",
    other = "other",
    video = "video",
    lighting = "lighting",
    export_ = "export"
}
export enum PromptType {
    voice = "voice",
    image = "image"
}
export enum Stage {
    filming = "filming",
    editing = "editing",
    published = "published",
    exporting = "exporting",
    planning = "planning"
}
export enum Status {
    resolved = "resolved",
    open = "open"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createScript(id: ScriptId, title: string, hook: string, body: string, callToAction: string, tags: Array<string>): Promise<void>;
    createVideoProject(id: ProjectId, title: string, stage: Stage, notes: string): Promise<void>;
    deleteScript(id: ScriptId): Promise<void>;
    getAllProblemReports(): Promise<Array<ProblemReport>>;
    getAllSavedPrompts(): Promise<Array<SavedPrompt>>;
    getAllScripts(): Promise<Array<Script>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getProblemReportById(id: ReportId): Promise<ProblemReport>;
    getPromptById(id: PromptId): Promise<SavedPrompt>;
    getScriptById(id: ScriptId): Promise<Script>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getUserVideoProjects(user: Principal): Promise<Array<VideoProject>>;
    getVideoProjectById(id: ProjectId): Promise<VideoProject>;
    isCallerAdmin(): Promise<boolean>;
    resolveProblemReport(id: ReportId, resolutionNote: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    savePrompt(id: PromptId, promptType: PromptType, title: string, promptText: string, tags: Array<string>): Promise<void>;
    submitProblemReport(id: ReportId, category: Category, description: string): Promise<void>;
    updateScript(id: ScriptId, title: string, hook: string, body: string, callToAction: string, tags: Array<string>): Promise<void>;
    updateVideoProject(id: ProjectId, title: string, stage: Stage, notes: string): Promise<void>;
}
