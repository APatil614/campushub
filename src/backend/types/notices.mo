/// Types for the Notices & Updates domain.
import Common "../types/common";

module {
  /// Category used to filter and colour-code a notice.
  public type NoticeCategory = {
    #academic;
    #exam;
    #fee;
    #general;
    #urgent;
  };

  /// A campus notice as stored and returned by the backend.
  public type Notice = {
    id : Common.ItemId;
    title : Text;
    body : Text;
    category : NoticeCategory;
    /// Principal of the admin who published the notice.
    author : Principal;
    /// When the notice was first published.
    postedAt : Common.Timestamp;
    /// Pinned notices surface at the top of the home feed.
    pinned : Bool;
    /// Optional attachments (PDFs, images) stored off-chain.
    attachments : [Common.Attachment];
  };

  /// Sort order for notice listings.
  public type NoticeSort = {
    #newest;
    #oldest;
  };

  /// Filter and search criteria for listing notices.
  /// Every field is optional so an empty filter record decodes and returns all notices.
  public type NoticeFilter = {
    /// Restrict to a single category when set.
    category : ?NoticeCategory;
    /// Case-insensitive keyword matched against title and body.
    search : ?Text;
    /// Sort order; defaults to newest first when null.
    sort : ?NoticeSort;
  };

  /// Input accepted when an admin creates or updates a notice.
  public type NoticeInput = {
    title : Text;
    body : Text;
    category : NoticeCategory;
    pinned : Bool;
    attachments : [Common.Attachment];
  };
};
