/// OQL value conversion for the day-of-week variant.
import OQL "mo:caffeineai-oql";
import Types "types/classes";

module {
  public func _toRow(self : Types.DayOfWeek) : OQL.Value =
    #text(
      switch self {
        case (#monday) { "monday" };
        case (#tuesday) { "tuesday" };
        case (#wednesday) { "wednesday" };
        case (#thursday) { "thursday" };
        case (#friday) { "friday" };
        case (#saturday) { "saturday" };
        case (#sunday) { "sunday" };
      }
    );
};
