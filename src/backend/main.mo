import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Int "mo:core/Int";
import List "mo:core/List";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import UserApproval "user-approval/approval";

actor {
  include MixinStorage();

  // ── User profile (required by frontend) ──────────────────────────────────

  public type TherapyType = {
    #speech;
    #motorSkills;
    #cognitivePhysical;
  };

  public type UserProfile = {
    name : Text;
    role : Text; // "patient" or "therapist"
    therapyType : ?TherapyType;
    enrolledModules : [Text];
  };

  // ── Domain types ──────────────────────────────────────────────────────────

  public type TherapyTask = {
    #speechTask : Text;
    #motorTask : Text;
    #cognitiveTask : Text;
  };

  public type TherapySession = {
    sessionId : Text;
    task : TherapyTask;
    score : Nat;
    timestamp : Time.Time;
  };

  public type TherapistFeedback = {
    therapist : Principal;
    feedbackText : Text;
    timestamp : Time.Time;
  };

  public type PatientTreatmentPlan = {
    patientId : Principal;
    sessions : List.List<TherapySession>;
    feedback : List.List<TherapistFeedback>;
    recoveryTrend : Text;
  };

  public type PatientTreatmentPlanView = {
    patientId : Principal;
    sessions : [TherapySession];
    feedback : [TherapistFeedback];
    recoveryTrend : Text;
  };

  // ── State ─────────────────────────────────────────────────────────────────

  let accessControlState = AccessControl.initState();
  let approvalState = UserApproval.initState(accessControlState);
  include MixinAuthorization(accessControlState);

  let userProfiles = Map.empty<Principal, UserProfile>();
  let treatmentPlans = Map.empty<Principal, PatientTreatmentPlan>();

  let speechExercises : [Text] = [
    "Repeat the phrase: 'She sells seashells by the seashore'",
    "Say the word: 'Rehabilitation'",
    "Repeat the sentence: 'The quick brown fox jumps over the lazy dog'",
    "Say clearly: 'Peter Piper picked a peck of pickled peppers'",
    "Repeat slowly: 'How much wood would a woodchuck chuck'",
  ];

  // ── Approval system ───────────────────────────────────────────────────────

  /// Any caller (including guests) can check approval status — used by the ApprovalGate UI.
  public query ({ caller }) func isCallerApproved() : async Bool {
    AccessControl.hasPermission(accessControlState, caller, #admin) or UserApproval.isApproved(approvalState, caller);
  };

  /// Only authenticated users (#user) can request approval.
  /// Guests / anonymous principals cannot request access.
  public shared ({ caller }) func requestApproval() : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can request approval");
    };
    UserApproval.requestApproval(approvalState, caller);
  };

  /// Only admins (therapists) can approve or reject patients.
  public shared ({ caller }) func setApproval(user : Principal, status : UserApproval.ApprovalStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    UserApproval.setApproval(approvalState, user, status);
  };

  /// Only admins (therapists) can list all approval requests.
  public query ({ caller }) func listApprovals() : async [UserApproval.UserApprovalInfo] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    UserApproval.listApprovals(approvalState);
  };

  // ── Required profile functions ────────────────────────────────────────────

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can get profiles");
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
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // ── Speech exercises ──────────────────────────────────────────────────────

  /// Only authenticated users can fetch exercises; guests cannot.
  public query ({ caller }) func fetchSpeechExercises() : async [Text] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can fetch exercises");
    };
    speechExercises;
  };

  // ── Session submission (approved patients only) ───────────────────────────

  /// Approved patients submit their own therapy sessions.
  /// Admins (therapists) are explicitly blocked from submitting patient sessions
  /// via this endpoint; they use addTherapistFeedback instead.
  public shared ({ caller }) func submitSession(task : TherapyTask, score : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can submit sessions");
    };
    if (AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Therapists cannot submit patient sessions via this endpoint");
    };
    if (not (UserApproval.isApproved(approvalState, caller))) {
      Runtime.trap("Unauthorized: Only approved users can submit sessions");
    };

    let session : TherapySession = {
      sessionId = "S" # Time.now().toText();
      task;
      score;
      timestamp = Time.now();
    };

    switch (treatmentPlans.get(caller)) {
      case (null) {
        let newSessions = List.empty<TherapySession>();
        newSessions.add(session);
        let plan : PatientTreatmentPlan = {
          patientId = caller;
          sessions = newSessions;
          feedback = List.empty<TherapistFeedback>();
          recoveryTrend = "";
        };
        treatmentPlans.add(caller, plan);
      };
      case (?currentPlan) {
        currentPlan.sessions.add(session);
        let updated : PatientTreatmentPlan = {
          patientId = currentPlan.patientId;
          sessions = currentPlan.sessions;
          feedback = currentPlan.feedback;
          recoveryTrend = currentPlan.recoveryTrend;
        };
        treatmentPlans.add(caller, updated);
      };
    };
  };

  // ── Patient's own plan / scores ───────────────────────────────────────────

  /// An approved patient fetches their own treatment plan.
  public query ({ caller }) func fetchCallerPlan() : async PatientTreatmentPlanView {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can fetch their plan");
    };
    if (AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Therapists should use fetchTreatmentPlan instead");
    };
    if (not (UserApproval.isApproved(approvalState, caller))) {
      Runtime.trap("Unauthorized: Only approved users can access their plan");
    };
    switch (treatmentPlans.get(caller)) {
      case (null) { Runtime.trap("No treatment plan found") };
      case (?plan) { flattenPatientTreatmentPlan(plan) };
    };
  };

  func flattenPatientTreatmentPlan(plan : PatientTreatmentPlan) : PatientTreatmentPlanView {
    {
      patientId = plan.patientId;
      sessions = plan.sessions.toArray();
      feedback = plan.feedback.toArray();
      recoveryTrend = plan.recoveryTrend;
    };
  };

  /// An approved patient fetches their own session scores.
  public query ({ caller }) func fetchCallerSessions() : async [Nat] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can fetch their sessions");
    };
    if (AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Therapists should use fetchSessionScores instead");
    };
    if (not (UserApproval.isApproved(approvalState, caller))) {
      Runtime.trap("Unauthorized: Only approved users can access session scores");
    };
    switch (treatmentPlans.get(caller)) {
      case (null) { Runtime.trap("No sessions found") };
      case (?plan) {
        plan.sessions.toArray().map(func(s : TherapySession) : Nat { s.score });
      };
    };
  };

  // ── Therapist (admin) endpoints ───────────────────────────────────────────

  /// Therapists fetch a specific patient's full treatment plan.
  public query ({ caller }) func fetchTreatmentPlan(patientId : Principal) : async PatientTreatmentPlanView {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only therapists can view patient plans");
    };
    switch (treatmentPlans.get(patientId)) {
      case (null) { Runtime.trap("No treatment plan found") };
      case (?plan) { flattenPatientTreatmentPlan(plan) };
    };
  };

  /// Therapists fetch a specific patient's session scores.
  public query ({ caller }) func fetchSessionScores(patientId : Principal) : async [Nat] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only therapists can view patient scores");
    };
    switch (treatmentPlans.get(patientId)) {
      case (null) { Runtime.trap("No sessions found") };
      case (?plan) {
        plan.sessions.toArray().map(func(s : TherapySession) : Nat { s.score });
      };
    };
  };

  /// Therapists add written feedback to a patient's plan.
  public shared ({ caller }) func addTherapistFeedback(patientId : Principal, feedbackText : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only therapists can add feedback");
    };
    let feedback : TherapistFeedback = {
      therapist = caller;
      feedbackText;
      timestamp = Time.now();
    };
    switch (treatmentPlans.get(patientId)) {
      case (null) {
        // Create a plan shell so feedback can be stored even before sessions exist.
        let plan : PatientTreatmentPlan = {
          patientId;
          sessions = List.empty<TherapySession>();
          feedback = List.singleton(feedback);
          recoveryTrend = "";
        };
        treatmentPlans.add(patientId, plan);
      };
      case (?currentPlan) {
        currentPlan.feedback.add(feedback);
        let updated : PatientTreatmentPlan = {
          patientId = currentPlan.patientId;
          sessions = currentPlan.sessions;
          feedback = currentPlan.feedback;
          recoveryTrend = currentPlan.recoveryTrend;
        };
        treatmentPlans.add(patientId, updated);
      };
    };
  };

  /// Therapists update the computed recovery trend for a patient.
  public shared ({ caller }) func updateRecoveryTrend(patientId : Principal, trend : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only therapists can update recovery trends");
    };
    switch (treatmentPlans.get(patientId)) {
      case (null) { Runtime.trap("No treatment plan found") };
      case (?currentPlan) {
        let updatedPlan : PatientTreatmentPlan = {
          currentPlan with recoveryTrend = trend;
        };
        treatmentPlans.add(patientId, updatedPlan);
      };
    };
  };

  /// Therapists can list all patients who have a treatment plan.
  public query ({ caller }) func listPatients() : async [Principal] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only therapists can list patients");
    };
    treatmentPlans.keys().toArray();
  };

  // ── Admin: role assignment (delegated to access-control module) ───────────

  /// Assign a role to a user. Only admins may call this (enforced inside assignRole).
  public shared ({ caller }) func assignUserRole(user : Principal, role : AccessControl.UserRole) : async () {
    AccessControl.assignRole(accessControlState, caller, user, role);
  };
};
