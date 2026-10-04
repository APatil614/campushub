/// Types for the Events & Competitions domain.
import Common "../types/common";

module {
  /// Kind of happening listed in the events section.
  public type EventType = {
    #event;
    #competition;
    #workshop;
    #activity;
  };

  /// An event, competition, workshop, or activity.
  public type Event = {
    id : Common.ItemId;
    title : Text;
    description : Text;
    eventType : EventType;
    /// Start instant (nanoseconds since epoch).
    startAt : Common.Timestamp;
    /// End instant (nanoseconds since epoch).
    endAt : Common.Timestamp;
    venue : Text;
    organiser : Text;
    /// Free-text registration instructions or link.
    registrationInfo : Text;
    /// Optional attachments (posters, rulebooks, forms).
    attachments : [Common.Attachment];
  };

  /// Whether to list events that have already ended.
  public type EventTimeFilter = {
    #upcoming;
    #past;
    #all;
  };

  /// Filter and search criteria for listing events.
  public type EventFilter = {
    /// Restrict to a single event type when set.
    eventType : ?EventType;
    /// Upcoming, past, or all; defaults to upcoming when null.
    time : ?EventTimeFilter;
    /// Case-insensitive keyword matched against title and description.
    search : ?Text;
  };

  /// Input accepted when an admin creates or updates an event.
  public type EventInput = {
    title : Text;
    description : Text;
    eventType : EventType;
    startAt : Common.Timestamp;
    endAt : Common.Timestamp;
    venue : Text;
    organiser : Text;
    registrationInfo : Text;
    attachments : [Common.Attachment];
  };
};
