/// Public API for the Events & Competitions domain.
import AccessControl "mo:caffeineai-authorization/access-control";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Types "../types/events";
import EventsLib "../lib/events";

mixin (state : EventsLib.State, accessControlState : AccessControl.AccessControlState) {
  /// True when `caller` is a registered admin. Unregistered and anonymous
  /// callers are simply not admins (never traps).
  func callerIsEventsAdmin(caller : Principal) : Bool {
    switch (accessControlState.userRoles.get(caller)) {
      case (?#admin) { true };
      case (_) { false };
    };
  };

  /// List events with optional type filter, upcoming/past filter, and keyword search.
  public query func listEvents(filter : Types.EventFilter) : async [Types.Event] {
    EventsLib.listEvents(state, filter);
  };

  /// Fetch a single event by id; null when it does not exist.
  public query func getEvent(id : Nat) : async ?Types.Event {
    EventsLib.getEvent(state, id);
  };

  /// Admin-only: create an event or competition. Returns the new event id.
  public shared ({ caller }) func createEvent(input : Types.EventInput) : async Nat {
    if (not callerIsEventsAdmin(caller)) {
      Runtime.trap("Unauthorized: only admins can publish events");
    };
    EventsLib.createEvent(state, input);
  };

  /// Admin-only: update an existing event. Returns false when the id is unknown.
  public shared ({ caller }) func updateEvent(id : Nat, input : Types.EventInput) : async Bool {
    if (not callerIsEventsAdmin(caller)) {
      Runtime.trap("Unauthorized: only admins can update events");
    };
    EventsLib.updateEvent(state, id, input);
  };

  /// Admin-only: delete an event. Returns false when the id is unknown.
  public shared ({ caller }) func deleteEvent(id : Nat) : async Bool {
    if (not callerIsEventsAdmin(caller)) {
      Runtime.trap("Unauthorized: only admins can delete events");
    };
    EventsLib.deleteEvent(state, id);
  };
};
