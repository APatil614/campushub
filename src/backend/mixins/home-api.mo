/// Public API for the Home Dashboard domain.
import Time "mo:core/Time";
import Types "../types/home";
import NoticesLib "../lib/notices";
import EventsLib "../lib/events";
import ClassesLib "../lib/classes";
import HomeLib "../lib/home";

mixin (
  noticesState : NoticesLib.State,
  eventsState : EventsLib.State,
  classesState : ClassesLib.State,
) {
  /// Unified "Latest Updates" feed: pinned notices first, then recent notices,
  /// events, and competitions newest first, capped at `limit`.
  public query func getLatestFeed(limit : Nat) : async [Types.FeedItem] {
    HomeLib.latestFeed(
      NoticesLib.allNotices(noticesState),
      EventsLib.allEvents(eventsState),
      limit,
    );
  };

  /// Quick-glance dashboard counts: upcoming events, new notices, today's classes.
  public query func getSummaryCounts() : async Types.SummaryCounts {
    let now = Time.now();
    let recentWindow : Int = 7 * 24 * 60 * 60 * 1_000_000_000;
    let today = ClassesLib.dayOfWeekAt(now);
    HomeLib.summaryCounts(
      NoticesLib.allNotices(noticesState),
      EventsLib.allEvents(eventsState),
      ClassesLib.countOnDay(classesState, today),
      now,
      recentWindow,
    );
  };
};
