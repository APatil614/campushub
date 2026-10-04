/// Public API for the Classes & Syllabus domain.
import AccessControl "mo:caffeineai-authorization/access-control";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Types "../types/classes";
import ClassesLib "../lib/classes";

mixin (state : ClassesLib.State, accessControlState : AccessControl.AccessControlState) {
  /// True when `caller` is a registered admin. Unregistered and anonymous
  /// callers are simply not admins (never traps).
  func callerIsClassesAdmin(caller : Principal) : Bool {
    switch (accessControlState.userRoles.get(caller)) {
      case (?#admin) { true };
      case (_) { false };
    };
  };

  /// List class slots, optionally restricted to a single day of the week.
  public query func listClasses(day : ?Types.DayOfWeek) : async [Types.ClassSlot] {
    ClassesLib.listClasses(state, day);
  };

  /// Fetch a single class slot by id; null when it does not exist.
  public query func getClass(id : Nat) : async ?Types.ClassSlot {
    ClassesLib.getClass(state, id);
  };

  /// Admin-only: create a class slot. Returns the new id.
  public shared ({ caller }) func createClass(input : Types.ClassInput) : async Nat {
    if (not callerIsClassesAdmin(caller)) {
      Runtime.trap("Unauthorized: only admins can create classes");
    };
    ClassesLib.createClass(state, input);
  };

  /// Admin-only: update an existing class slot. Returns false when the id is unknown.
  public shared ({ caller }) func updateClass(id : Nat, input : Types.ClassInput) : async Bool {
    if (not callerIsClassesAdmin(caller)) {
      Runtime.trap("Unauthorized: only admins can update classes");
    };
    ClassesLib.updateClass(state, id, input);
  };

  /// Admin-only: delete a class slot. Returns false when the id is unknown.
  public shared ({ caller }) func deleteClass(id : Nat) : async Bool {
    if (not callerIsClassesAdmin(caller)) {
      Runtime.trap("Unauthorized: only admins can delete classes");
    };
    ClassesLib.deleteClass(state, id);
  };

  /// List all syllabus entries.
  public query func listSyllabus() : async [Types.SyllabusEntry] {
    ClassesLib.listSyllabus(state);
  };

  /// Fetch a syllabus entry by id; null when it does not exist.
  public query func getSyllabus(id : Nat) : async ?Types.SyllabusEntry {
    ClassesLib.getSyllabus(state, id);
  };

  /// Admin-only: create a syllabus entry. Returns the new id.
  public shared ({ caller }) func createSyllabus(input : Types.SyllabusInput) : async Nat {
    if (not callerIsClassesAdmin(caller)) {
      Runtime.trap("Unauthorized: only admins can create syllabus entries");
    };
    ClassesLib.createSyllabus(state, input);
  };

  /// Admin-only: update an existing syllabus entry. Returns false when the id is unknown.
  public shared ({ caller }) func updateSyllabus(id : Nat, input : Types.SyllabusInput) : async Bool {
    if (not callerIsClassesAdmin(caller)) {
      Runtime.trap("Unauthorized: only admins can update syllabus entries");
    };
    ClassesLib.updateSyllabus(state, id, input);
  };

  /// Admin-only: delete a syllabus entry. Returns false when the id is unknown.
  public shared ({ caller }) func deleteSyllabus(id : Nat) : async Bool {
    if (not callerIsClassesAdmin(caller)) {
      Runtime.trap("Unauthorized: only admins can delete syllabus entries");
    };
    ClassesLib.deleteSyllabus(state, id);
  };

  /// Subject detail: syllabus outline plus associated class schedule.
  public query func getSubjectDetail(subject : Text) : async ?Types.SubjectDetail {
    ClassesLib.getSubjectDetail(state, subject);
  };
};
