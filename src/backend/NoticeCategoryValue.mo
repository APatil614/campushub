/// OQL value conversion for the notice category variant.
import OQL "mo:caffeineai-oql";
import Types "types/notices";

module {
  public func _toRow(self : Types.NoticeCategory) : OQL.Value =
    #text(
      switch self {
        case (#academic) { "academic" };
        case (#exam) { "exam" };
        case (#fee) { "fee" };
        case (#general) { "general" };
        case (#urgent) { "urgent" };
      }
    );
};
