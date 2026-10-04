/// Static behavioral documentation for the CampusHub backend public API.
mixin () {
  /// Returns the backend API documentation as Markdown.
  public query func getApiDoc() : async Text {
    "# CampusHub Backend API\n\n" #
    "CampusHub is a single-canister college information hub. It stores notices,\n" #
    "events/competitions, the weekly class timetable, and syllabus references, and\n" #
    "serves them to the frontend and to the Caffeine Data Intelligence agent.\n\n" #
    "## Authentication and identity\n\n" #
    "- Read endpoints (listNotices, getNotice, listEvents, getEvent, listClasses,\n" #
    "  getClass, listSyllabus, getSyllabus, getSubjectDetail, getLatestFeed,\n" #
    "  getSummaryCounts, getApiDoc) are open to everyone, including anonymous\n" #
    "  callers. No sign-in is required to browse campus content.\n" #
    "- Write endpoints (createNotice, updateNotice, deleteNotice, createEvent,\n" #
    "  updateEvent, deleteEvent, createClass, updateClass, deleteClass,\n" #
    "  createSyllabus, updateSyllabus, deleteSyllabus) require a signed-in caller\n" #
    "  whose principal holds the admin role. A non-admin caller traps with\n" #
    "  'Unauthorized: only admins can ...'.\n" #
    "- The first caller to initialize access control becomes the admin; subsequent\n" #
    "  callers receive the default (non-admin) role. Registration happens only when\n" #
    "  a caller signs in through the app's own frontend, so a principal that never\n" #
    "  did so is unregistered even if it belongs to the app owner.\n" #
    "- The frontend pins an Internet Identity derivation origin, published at\n" #
    "  /.well-known/ii-derivation-origin when available. An agent already holding\n" #
    "  the user's Internet Identity authorization derives the correct per-app\n" #
    "  principal against that origin (for example\n" #
    "  'icp identity link web <name> --app <host>'). Such a delegation acts with\n" #
    "  the user's full authority in this app until it expires.\n\n" #
    "## Units and encodings\n\n" #
    "- Timestamp values are Int nanoseconds since the Unix epoch (UTC).\n" #
    "- ItemId values are Nat identifiers, unique within their collection.\n" #
    "- Attachment is { blob : Blob; filename : Text; mimeType : Text }; blobs are\n" #
    "  stored in canister state, not off-chain.\n" #
    "- DayOfWeek is a variant #monday .. #sunday.\n" #
    "- NoticeCategory is a variant #academic | #exam | #fee | #general | #urgent.\n" #
    "- EventType is a variant #event | #competition | #workshop | #activity.\n" #
    "- startTime / endTime on class slots are local HH:MM 24-hour strings.\n" #
    "- Optional fields (materialLink, filter fields) are Candid opt; null means\n" #
    "  not set.\n\n" #
    "## Lifecycle and polling\n\n" #
    "- All read methods are query calls: fast, unreplicated, and safe to poll.\n" #
    "- getLatestFeed(limit) returns a merged feed of pinned notices first, then\n" #
    "  recent notices, events, and competitions newest first, capped at limit.\n" #
    "- getSummaryCounts() returns upcoming-event, recent-notice, and today's-class\n" #
    "  counts computed against the canister clock at call time.\n" #
    "- listEvents defaults to upcoming events when time is null; pass #past or\n" #
    "  #all to widen the window. listNotices defaults to newest first.\n\n" #
    "## Mutation retry safety\n\n" #
    "- create* methods are NOT idempotent: each successful call allocates a new id\n" #
    "  and appends a new record. Retrying a create after a timeout may duplicate\n" #
    "  content.\n" #
    "- update* and delete* methods are idempotent in effect: updating or deleting\n" #
    "  an already-updated/already-deleted id returns false rather than trapping.\n" #
    "- Deletes are destructive and permanent; there is no soft-delete or undo.\n\n" #
    "## Errors and limits\n\n" #
    "- Admin-guarded writes trap with an 'Unauthorized: ...' message for non-admins.\n" #
    "- update* / delete* return false when the id is unknown; they do not trap.\n" #
    "- get* methods return null when the id is unknown.\n" #
    "- getSubjectDetail returns null when neither a class slot nor a syllabus entry\n" #
    "  exists for the subject.\n" #
    "- getLatestFeed caps its result at the requested limit; a limit of 0 returns\n" #
    "  an empty feed.\n\n" #
    "## Non-obvious gotchas\n\n" #
    "- Seeded content uses a placeholder author principal; the first admin to sign\n" #
    "  in becomes the real admin, but seeded notices keep the placeholder author.\n" #
    "- listNotices search is case-insensitive across title and body only.\n" #
    "- listEvents search is case-insensitive across title and description only.\n" #
    "- Class slots are recurring weekly entries, not dated occurrences; use\n" #
    "  getSubjectDetail to join a subject's schedule with its syllabus.\n";
  };
};
