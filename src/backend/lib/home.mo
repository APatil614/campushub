/// Domain logic for the merged home feed and summary counts.
import Text "mo:core/Text";
import Types "../types/home";
import Notices "../types/notices";
import Events "../types/events";

module {
  /// Build a short preview from a longer body.
  func preview(body : Text, max : Nat) : Text {
    if (body.size() <= max) { body } else {
      Text.fromArray(body.toArray().sliceToArray(0, max)) # "…";
    };
  };

  /// Build the unified "Latest Updates" feed: pinned notices first, then all
  /// notices, events, and competitions newest first, capped at `limit`.
  public func latestFeed(
    notices : [Notices.Notice],
    events : [Events.Event],
    limit : Nat,
  ) : [Types.FeedItem] {
    let noticeItems = notices.map(
      func(notice) {
        {
          kind = #notice;
          id = notice.id;
          title = notice.title;
          preview = preview(notice.body, 140);
          at = notice.postedAt;
          pinned = notice.pinned;
          noticeCategory = ?notice.category;
          eventType = null;
        };
      }
    );

    let eventItems = events.map(
      func(event) {
        let kind = switch (event.eventType) {
          case (#competition) { #competition };
          case _ { #event };
        };
        {
          kind;
          id = event.id;
          title = event.title;
          preview = preview(event.description, 140);
          at = event.startAt;
          pinned = false;
          noticeCategory = null;
          eventType = ?event.eventType;
        };
      }
    );

    let merged = noticeItems.concat(eventItems);

    let sorted = merged.sort(
      func(a, b) {
        if (a.pinned != b.pinned) {
          if (a.pinned) { #less } else { #greater };
        } else if (a.at == b.at) {
          #equal;
        } else if (a.at > b.at) {
          #less;
        } else {
          #greater;
        };
      }
    );

    if (sorted.size() <= limit) { sorted } else {
      sorted.sliceToArray(0, limit);
    };
  };

  /// Compute the quick-glance dashboard counts.
  public func summaryCounts(
    notices : [Notices.Notice],
    events : [Events.Event],
    todaysClasses : Nat,
    now : Int,
    recentWindow : Int,
  ) : Types.SummaryCounts {
    let upcomingEvents = events.foldLeft(0, func(acc, event) {
      if (event.startAt >= now) { acc + 1 } else { acc };
    });

    let newNotices = notices.foldLeft(0, func(acc, notice) {
      if (notice.postedAt >= now - recentWindow) { acc + 1 } else { acc };
    });

    { upcomingEvents; newNotices; todaysClasses };
  };
};
