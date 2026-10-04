/// Public API for the Notices & Updates domain.
import AccessControl "mo:caffeineai-authorization/access-control";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Types "../types/notices";
import NoticesLib "../lib/notices";

mixin (state : NoticesLib.State, accessControlState : AccessControl.AccessControlState) {
  /// True when `caller` is a registered admin. Unregistered and anonymous
  /// callers are simply not admins (never traps).
  func callerIsNoticesAdmin(caller : Principal) : Bool {
    switch (accessControlState.userRoles.get(caller)) {
      case (?#admin) { true };
      case (_) { false };
    };
  };

  /// List notices with optional category filter, keyword search, and sort order.
  public query func listNotices(filter : Types.NoticeFilter) : async [Types.Notice] {
    NoticesLib.listNotices(state, filter);
  };

  /// Fetch a single notice by id; null when it does not exist.
  public query func getNotice(id : Nat) : async ?Types.Notice {
    NoticesLib.getNotice(state, id);
  };

  /// Admin-only: create a notice. Returns the new notice id.
  public shared ({ caller }) func createNotice(input : Types.NoticeInput) : async Nat {
    if (not callerIsNoticesAdmin(caller)) {
      Runtime.trap("Unauthorized: only admins can publish notices");
    };
    NoticesLib.createNotice(state, caller, input);
  };

  /// Admin-only: update an existing notice. Returns false when the id is unknown.
  public shared ({ caller }) func updateNotice(id : Nat, input : Types.NoticeInput) : async Bool {
    if (not callerIsNoticesAdmin(caller)) {
      Runtime.trap("Unauthorized: only admins can update notices");
    };
    NoticesLib.updateNotice(state, id, input);
  };

  /// Admin-only: delete a notice. Returns false when the id is unknown.
  public shared ({ caller }) func deleteNotice(id : Nat) : async Bool {
    if (not callerIsNoticesAdmin(caller)) {
      Runtime.trap("Unauthorized: only admins can delete notices");
    };
    NoticesLib.deleteNotice(state, id);
  };
};
