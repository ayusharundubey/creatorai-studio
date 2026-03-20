import Map "mo:core/Map";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Array "mo:core/Array";
import List "mo:core/List";
import MixinStorage "blob-storage/Mixin";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  // Persistent state types
  module Script {
    type Tag = Text;
    public type ScriptId = Text;

    public type Script = {
      id : ScriptId;
      user : Principal;
      title : Text;
      hook : Text;
      body : Text;
      callToAction : Text;
      tags : [Tag];
      createdAt : Time.Time;
    };

    public func compareById(a : Script, b : Script) : Order.Order {
      Text.compare(a.id, b.id);
    };
  };

  type PromptId = Text;
  module SavedPrompt {
    type Tag = Text;
    public type PromptType = {
      #image;
      #voice;
    };

    public type SavedPrompt = {
      id : PromptId;
      user : Principal;
      promptType : PromptType;
      title : Text;
      promptText : Text;
      tags : [Tag];
      createdAt : Time.Time;
    };
  };

  module ProblemReport {
    public type ReportId = Text;
    public type Category = {
      #video;
      #audio;
      #export;
      #lighting;
      #other;
    };
    public type Status = {
      #open;
      #resolved;
    };
    public type ProblemReport = {
      id : ReportId;
      user : Principal;
      category : Category;
      description : Text;
      status : Status;
      createdAt : Time.Time;
      resolutionNote : ?Text;
    };
  };

  module VideoProject {
    public type ProjectId = Text;
    public type Stage = {
      #planning;
      #filming;
      #editing;
      #exporting;
      #published;
    };
    public type VideoProject = {
      id : ProjectId;
      user : Principal;
      title : Text;
      stage : Stage;
      notes : Text;
      createdAt : Time.Time;
      updatedAt : ?Time.Time;
    };
  };

  public type UserProfile = {
    name : Text;
  };

  // Storage
  let scripts = Map.empty<Script.ScriptId, Script.Script>();
  let savedPrompts = Map.empty<PromptId, SavedPrompt.SavedPrompt>();
  let problemReports = Map.empty<ProblemReport.ReportId, ProblemReport.ProblemReport>();
  let videoProjects = Map.empty<VideoProject.ProjectId, VideoProject.VideoProject>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  include MixinStorage();
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Script management
  public shared ({ caller }) func createScript(id : Script.ScriptId, title : Text, hook : Text, body : Text, callToAction : Text, tags : [Text]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create scripts");
    };

    let script : Script.Script = {
      id;
      user = caller;
      title;
      hook;
      body;
      callToAction;
      tags;
      createdAt = Time.now();
    };
    scripts.add(id, script);
  };

  public query ({ caller }) func getScriptById(id : Script.ScriptId) : async Script.Script {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view scripts");
    };

    switch (scripts.get(id)) {
      case (null) { Runtime.trap("Script not found") };
      case (?script) {
        if (script.user != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own scripts");
        };
        script;
      };
    };
  };

  public query ({ caller }) func getAllScripts() : async [Script.Script] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view scripts");
    };

    let filteredScripts = if (AccessControl.isAdmin(accessControlState, caller)) {
      scripts.values().toArray();
    } else {
      scripts.values().toArray().filter(func(script) { script.user == caller });
    };
    filteredScripts.sort(Script.compareById);
  };

  public shared ({ caller }) func updateScript(id : Script.ScriptId, title : Text, hook : Text, body : Text, callToAction : Text, tags : [Text]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update scripts");
    };

    switch (scripts.get(id)) {
      case (null) { Runtime.trap("Script not found") };
      case (?existingScript) {
        if (existingScript.user != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only update your own scripts");
        };

        let updatedScript : Script.Script = {
          id;
          user = existingScript.user;
          title;
          hook;
          body;
          callToAction;
          tags;
          createdAt = existingScript.createdAt;
        };
        scripts.add(id, updatedScript);
      };
    };
  };

  public shared ({ caller }) func deleteScript(id : Script.ScriptId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete scripts");
    };

    switch (scripts.get(id)) {
      case (null) { Runtime.trap("Script not found") };
      case (?script) {
        if (script.user != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only delete your own scripts");
        };
        scripts.remove(id);
      };
    };
  };

  // Saved Prompt Management
  public shared ({ caller }) func savePrompt(id : PromptId, promptType : SavedPrompt.PromptType, title : Text, promptText : Text, tags : [Text]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save prompts");
    };

    let prompt : SavedPrompt.SavedPrompt = {
      id;
      user = caller;
      promptType;
      title;
      promptText;
      tags;
      createdAt = Time.now();
    };
    savedPrompts.add(id, prompt);
  };

  public query ({ caller }) func getPromptById(id : PromptId) : async SavedPrompt.SavedPrompt {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view prompts");
    };

    switch (savedPrompts.get(id)) {
      case (null) { Runtime.trap("Prompt not found") };
      case (?prompt) {
        if (prompt.user != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own prompts");
        };
        prompt;
      };
    };
  };

  public query ({ caller }) func getAllSavedPrompts() : async [SavedPrompt.SavedPrompt] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view prompts");
    };

    let filteredPrompts = if (AccessControl.isAdmin(accessControlState, caller)) {
      savedPrompts.values().toArray();
    } else {
      savedPrompts.values().toArray().filter(func(prompt) { prompt.user == caller });
    };
    filteredPrompts;
  };

  // Problem Report Management
  public shared ({ caller }) func submitProblemReport(id : ProblemReport.ReportId, category : ProblemReport.Category, description : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit problem reports");
    };

    let problemReport : ProblemReport.ProblemReport = {
      id;
      user = caller;
      category;
      description;
      status = #open;
      createdAt = Time.now();
      resolutionNote = null;
    };
    problemReports.add(id, problemReport);
  };

  public query ({ caller }) func getProblemReportById(id : ProblemReport.ReportId) : async ProblemReport.ProblemReport {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view problem reports");
    };

    switch (problemReports.get(id)) {
      case (null) { Runtime.trap("Problem report not found") };
      case (?report) {
        if (report.user != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own problem reports");
        };
        report;
      };
    };
  };

  public query ({ caller }) func getAllProblemReports() : async [ProblemReport.ProblemReport] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view problem reports");
    };

    let filteredReports = if (AccessControl.isAdmin(accessControlState, caller)) {
      problemReports.values().toArray();
    } else {
      problemReports.values().toArray().filter(func(report) { report.user == caller });
    };
    filteredReports;
  };

  public shared ({ caller }) func resolveProblemReport(id : ProblemReport.ReportId, resolutionNote : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can resolve problem reports");
    };

    switch (problemReports.get(id)) {
      case (null) { Runtime.trap("Problem report not found") };
      case (?report) {
        let updatedReport : ProblemReport.ProblemReport = {
          id = report.id;
          user = report.user;
          category = report.category;
          description = report.description;
          status = #resolved;
          createdAt = report.createdAt;
          resolutionNote = ?resolutionNote;
        };
        problemReports.add(id, updatedReport);
      };
    };
  };

  // Video Project Management
  public shared ({ caller }) func createVideoProject(id : VideoProject.ProjectId, title : Text, stage : VideoProject.Stage, notes : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create video projects");
    };

    let videoProject : VideoProject.VideoProject = {
      id;
      user = caller;
      title;
      stage;
      notes;
      createdAt = Time.now();
      updatedAt = null;
    };
    videoProjects.add(id, videoProject);
  };

  public shared ({ caller }) func updateVideoProject(id : VideoProject.ProjectId, title : Text, stage : VideoProject.Stage, notes : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update video projects");
    };

    switch (videoProjects.get(id)) {
      case (null) { Runtime.trap("Video project not found") };
      case (?project) {
        if (project.user != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only update your own video projects");
        };

        let updatedProject : VideoProject.VideoProject = {
          id;
          user = project.user;
          title;
          stage;
          notes;
          createdAt = project.createdAt;
          updatedAt = ?Time.now();
        };
        videoProjects.add(id, updatedProject);
      };
    };
  };

  public query ({ caller }) func getVideoProjectById(id : VideoProject.ProjectId) : async VideoProject.VideoProject {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view video projects");
    };

    switch (videoProjects.get(id)) {
      case (null) { Runtime.trap("Video project not found") };
      case (?project) {
        if (project.user != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own video projects");
        };
        project;
      };
    };
  };

  public query ({ caller }) func getUserVideoProjects(user : Principal) : async [VideoProject.VideoProject] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view video projects");
    };

    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own video projects");
    };

    let filteredProjects = videoProjects.values().toArray().filter(
      func(project) { project.user == user }
    );
    filteredProjects;
  };
};
