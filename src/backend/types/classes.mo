/// Types for the Classes & Syllabus domain.
import Common "../types/common";

module {
  /// Day of the academic week used to group the timetable.
  public type DayOfWeek = {
    #monday;
    #tuesday;
    #wednesday;
    #thursday;
    #friday;
    #saturday;
    #sunday;
  };

  /// A single recurring class slot in the weekly timetable.
  public type ClassSlot = {
    id : Common.ItemId;
    subject : Text;
    dayOfWeek : DayOfWeek;
    /// Local start time as "HH:MM" (24-hour).
    startTime : Text;
    /// Local end time as "HH:MM" (24-hour).
    endTime : Text;
    room : Text;
    instructor : Text;
  };

  /// A syllabus unit/topic within a subject.
  public type SyllabusTopic = {
    title : Text;
    /// Optional detail for the topic.
    description : Text;
  };

  /// Syllabus reference material for one subject.
  public type SyllabusEntry = {
    id : Common.ItemId;
    subject : Text;
    /// Ordered list of units/topics covered.
    topics : [SyllabusTopic];
    /// Optional external link to material.
    materialLink : ?Text;
    /// Optional downloadable material stored off-chain.
    attachments : [Common.Attachment];
  };

  /// A subject with its syllabus outline and associated class schedule.
  public type SubjectDetail = {
    subject : Text;
    syllabus : ?SyllabusEntry;
    classes : [ClassSlot];
  };

  /// Input accepted when an admin creates or updates a class slot.
  public type ClassInput = {
    subject : Text;
    dayOfWeek : DayOfWeek;
    startTime : Text;
    endTime : Text;
    room : Text;
    instructor : Text;
  };

  /// Input accepted when an admin creates or updates a syllabus entry.
  /// `materialLink` is optional so a record that omits it still decodes.
  public type SyllabusInput = {
    subject : Text;
    topics : [SyllabusTopic];
    materialLink : ?Text;
    attachments : [Common.Attachment];
  };
};
