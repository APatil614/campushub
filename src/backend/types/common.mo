/// Cross-cutting types shared across CampusHub domains.
module {
  /// Unique identifier for a notice, event, class slot, or syllabus entry.
  public type ItemId = Nat;

  /// Wall-clock instant, in nanoseconds since the Unix epoch (IC `Time.now()`).
  public type Timestamp = Int;

  /// A reference to a file stored off-chain via the object-storage extension.
  /// The frontend uploads the bytes and passes the resulting blob reference.
  public type Attachment = {
    /// Off-chain blob reference (never a plain URL).
    blob : Blob;
    /// Original file name, used for display and file-type detection.
    filename : Text;
    /// MIME type reported by the browser at upload time.
    mimeType : Text;
  };
};
