/// OQL value conversion for the event type variant.
import OQL "mo:caffeineai-oql";
import Types "types/events";

module {
  public func _toRow(self : Types.EventType) : OQL.Value =
    #text(
      switch self {
        case (#event) { "event" };
        case (#competition) { "competition" };
        case (#workshop) { "workshop" };
        case (#activity) { "activity" };
      }
    );
};
