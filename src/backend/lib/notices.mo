/// Domain logic for notices: storage, filtering, search, and CRUD.
import Map "mo:core/Map";
import Time "mo:core/Time";
import Types "../types/notices";

module {
  /// Mutable state owned by the notices domain.
  public type State = {
    var nextId : Nat;
    notices : Map.Map<Nat, Types.Notice>;
  };

  /// Create empty domain state.
  public func initState() : State {
    { var nextId = 0; notices = Map.empty() };
  };

  /// Case-insensitive keyword match across title and body.
  func matches(notice : Types.Notice, term : Text) : Bool {
    let needle = term.toLower();
    notice.title.toLower().contains(#text needle) or notice.body.toLower().contains(#text needle);
  };

  /// List notices matching the filter, sorted as requested.
  public func listNotices(state : State, filter : Types.NoticeFilter) : [Types.Notice] {
    let matched = state.notices.values().filter(
      func(notice) {
        let categoryOk = switch (filter.category) {
          case (?category) { notice.category == category };
          case null { true };
        };
        let searchOk = switch (filter.search) {
          case (?term) { term.size() == 0 or matches(notice, term) };
          case null { true };
        };
        categoryOk and searchOk;
      }
    ).toArray();

    let newestFirst = switch (filter.sort) {
      case (?#oldest) { false };
      case _ { true };
    };

    matched.sort(
      func(a, b) {
        if (a.postedAt == b.postedAt) { #equal } else if (newestFirst) {
          if (a.postedAt > b.postedAt) { #less } else { #greater };
        } else {
          if (a.postedAt < b.postedAt) { #less } else { #greater };
        };
      }
    );
  };

  /// Fetch a single notice by id.
  public func getNotice(state : State, id : Nat) : ?Types.Notice {
    state.notices.get(id);
  };

  /// Create a notice authored by `author`; returns the new id.
  public func createNotice(state : State, author : Principal, input : Types.NoticeInput) : Nat {
    let id = state.nextId;
    state.nextId := id + 1;
    state.notices.add(id, {
      id;
      title = input.title;
      body = input.body;
      category = input.category;
      author;
      postedAt = Time.now();
      pinned = input.pinned;
      attachments = input.attachments;
    });
    id;
  };

  /// Update an existing notice; returns false when the id is unknown.
  public func updateNotice(state : State, id : Nat, input : Types.NoticeInput) : Bool {
    switch (state.notices.get(id)) {
      case (?existing) {
        state.notices.add(id, {
          existing with
          title = input.title;
          body = input.body;
          category = input.category;
          pinned = input.pinned;
          attachments = input.attachments;
        });
        true;
      };
      case null { false };
    };
  };

  /// Delete a notice; returns false when the id is unknown.
  public func deleteNotice(state : State, id : Nat) : Bool {
    switch (state.notices.get(id)) {
      case (?_) { state.notices.remove(id); true };
      case null { false };
    };
  };

  /// Count notices posted at or after `since`.
  public func countSince(state : State, since : Int) : Nat {
    state.notices.values().foldLeft(0, func(acc, notice) {
      if (notice.postedAt >= since) { acc + 1 } else { acc };
    });
  };

  /// All notices, used to build the merged home feed.
  public func allNotices(state : State) : [Types.Notice] {
    state.notices.values().toArray();
  };
};
