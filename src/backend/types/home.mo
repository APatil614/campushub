/// Types for the Home Dashboard domain.
import Common "../types/common";
import Notices "../types/notices";
import Events "../types/events";

module {
  /// Which domain a merged feed item came from.
  public type FeedKind = {
    #notice;
    #event;
    #competition;
  };

  /// A single entry in the unified "Latest Updates" feed.
  public type FeedItem = {
    kind : FeedKind;
    id : Common.ItemId;
    title : Text;
    /// Short preview text for the feed card.
    preview : Text;
    /// When the item was posted (notice) or starts (event).
    at : Common.Timestamp;
    /// True for pinned/urgent notices, which sort to the top.
    pinned : Bool;
    /// Notice category, when the item is a notice.
    noticeCategory : ?Notices.NoticeCategory;
    /// Event type, when the item is an event or competition.
    eventType : ?Events.EventType;
  };

  /// Quick-glance counts shown on the home dashboard.
  public type SummaryCounts = {
    /// Events and competitions starting in the future.
    upcomingEvents : Nat;
    /// Notices posted within the recent window.
    newNotices : Nat;
    /// Class slots scheduled for today.
    todaysClasses : Nat;
  };
};
