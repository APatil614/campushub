/// Domain logic for events and competitions: storage, filtering, search, and CRUD.
import Map "mo:core/Map";
import Time "mo:core/Time";
import Types "../types/events";

module {
  /// Mutable state owned by the events domain.
  public type State = {
    var nextId : Nat;
    events : Map.Map<Nat, Types.Event>;
  };

  /// Create empty domain state.
  public func initState() : State {
    { var nextId = 0; events = Map.empty() };
  };

  /// Case-insensitive keyword match across title and description.
  func matches(event : Types.Event, term : Text) : Bool {
    let needle = term.toLower();
    event.title.toLower().contains(#text needle) or event.description.toLower().contains(#text needle);
  };

  /// List events matching the filter.
  public func listEvents(state : State, filter : Types.EventFilter) : [Types.Event] {
    let now = Time.now();
    let matched = state.events.values().filter(
      func(event) {
        let typeOk = switch (filter.eventType) {
          case (?eventType) { event.eventType == eventType };
          case null { true };
        };
        let timeOk = switch (filter.time) {
          case (?#past) { event.endAt < now };
          case (?#all) { true };
          case _ { event.endAt >= now };
        };
        let searchOk = switch (filter.search) {
          case (?term) { term.size() == 0 or matches(event, term) };
          case null { true };
        };
        typeOk and timeOk and searchOk;
      }
    ).toArray();

    matched.sort(
      func(a, b) {
        if (a.startAt == b.startAt) { #equal } else if (a.startAt < b.startAt) {
          #less;
        } else {
          #greater;
        };
      }
    );
  };

  /// Fetch a single event by id.
  public func getEvent(state : State, id : Nat) : ?Types.Event {
    state.events.get(id);
  };

  /// Create an event; returns the new id.
  public func createEvent(state : State, input : Types.EventInput) : Nat {
    let id = state.nextId;
    state.nextId := id + 1;
    state.events.add(id, {
      id;
      title = input.title;
      description = input.description;
      eventType = input.eventType;
      startAt = input.startAt;
      endAt = input.endAt;
      venue = input.venue;
      organiser = input.organiser;
      registrationInfo = input.registrationInfo;
      attachments = input.attachments;
    });
    id;
  };

  /// Update an existing event; returns false when the id is unknown.
  public func updateEvent(state : State, id : Nat, input : Types.EventInput) : Bool {
    switch (state.events.get(id)) {
      case (?existing) {
        state.events.add(id, {
          existing with
          title = input.title;
          description = input.description;
          eventType = input.eventType;
          startAt = input.startAt;
          endAt = input.endAt;
          venue = input.venue;
          organiser = input.organiser;
          registrationInfo = input.registrationInfo;
          attachments = input.attachments;
        });
        true;
      };
      case null { false };
    };
  };

  /// Delete an event; returns false when the id is unknown.
  public func deleteEvent(state : State, id : Nat) : Bool {
    switch (state.events.get(id)) {
      case (?_) { state.events.remove(id); true };
      case null { false };
    };
  };

  /// Count events starting at or after `now`.
  public func countUpcoming(state : State, now : Int) : Nat {
    state.events.values().foldLeft(0, func(acc, event) {
      if (event.startAt >= now) { acc + 1 } else { acc };
    });
  };

  /// All events, used to build the merged home feed.
  public func allEvents(state : State) : [Types.Event] {
    state.events.values().toArray();
  };
};
