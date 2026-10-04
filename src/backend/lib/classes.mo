/// Domain logic for the weekly timetable and syllabus references.
import Map "mo:core/Map";
import Types "../types/classes";

module {
  /// Mutable state owned by the classes domain.
  public type State = {
    var nextClassId : Nat;
    var nextSyllabusId : Nat;
    classes : Map.Map<Nat, Types.ClassSlot>;
    syllabus : Map.Map<Nat, Types.SyllabusEntry>;
  };

  /// Create empty domain state.
  public func initState() : State {
    {
      var nextClassId = 0;
      var nextSyllabusId = 0;
      classes = Map.empty();
      syllabus = Map.empty();
    };
  };

  /// Numeric rank used to order days Monday..Sunday.
  func dayRank(day : Types.DayOfWeek) : Nat {    switch (day) {
      case (#monday) { 0 };
      case (#tuesday) { 1 };
      case (#wednesday) { 2 };
      case (#thursday) { 3 };
      case (#friday) { 4 };
      case (#saturday) { 5 };
      case (#sunday) { 6 };
    };
  };

  /// Day of the week for a nanosecond timestamp (UTC).
  /// 1970-01-01 was a Thursday, so day 0 maps to Thursday.
  public func dayOfWeekAt(timestamp : Int) : Types.DayOfWeek {
    let nanosPerDay : Int = 24 * 60 * 60 * 1_000_000_000;
    let days = timestamp / nanosPerDay;
    let offset = days % 7;
    let normalized = if (offset < 0) { offset + 7 } else { offset };
    switch (normalized) {
      case (0) { #thursday };
      case (1) { #friday };
      case (2) { #saturday };
      case (3) { #sunday };
      case (4) { #monday };
      case (5) { #tuesday };
      case _ { #wednesday };
    };
  };

  /// List class slots, optionally restricted to one day.
  public func listClasses(state : State, day : ?Types.DayOfWeek) : [Types.ClassSlot] {
    let matched = state.classes.values().filter(
      func(slot) {
        switch (day) {
          case (?wanted) { slot.dayOfWeek == wanted };
          case null { true };
        };
      }
    ).toArray();

    matched.sort(
      func(a, b) {
        let dayA = dayRank(a.dayOfWeek);
        let dayB = dayRank(b.dayOfWeek);
        if (dayA != dayB) {
          if (dayA < dayB) { #less } else { #greater };
        } else if (a.startTime == b.startTime) {
          #equal;
        } else if (a.startTime < b.startTime) {
          #less;
        } else {
          #greater;
        };
      }
    );
  };

  /// Fetch a single class slot by id.
  public func getClass(state : State, id : Nat) : ?Types.ClassSlot {
    state.classes.get(id);
  };

  /// Create a class slot; returns the new id.
  public func createClass(state : State, input : Types.ClassInput) : Nat {
    let id = state.nextClassId;
    state.nextClassId := id + 1;
    state.classes.add(id, {
      id;
      subject = input.subject;
      dayOfWeek = input.dayOfWeek;
      startTime = input.startTime;
      endTime = input.endTime;
      room = input.room;
      instructor = input.instructor;
    });
    id;
  };

  /// Update an existing class slot; returns false when the id is unknown.
  public func updateClass(state : State, id : Nat, input : Types.ClassInput) : Bool {
    switch (state.classes.get(id)) {
      case (?existing) {
        state.classes.add(id, {
          existing with
          subject = input.subject;
          dayOfWeek = input.dayOfWeek;
          startTime = input.startTime;
          endTime = input.endTime;
          room = input.room;
          instructor = input.instructor;
        });
        true;
      };
      case null { false };
    };
  };

  /// Delete a class slot; returns false when the id is unknown.
  public func deleteClass(state : State, id : Nat) : Bool {
    switch (state.classes.get(id)) {
      case (?_) { state.classes.remove(id); true };
      case null { false };
    };
  };

  /// List all syllabus entries.
  public func listSyllabus(state : State) : [Types.SyllabusEntry] {
    state.syllabus.values().toArray();
  };

  /// Fetch a syllabus entry by id.
  public func getSyllabus(state : State, id : Nat) : ?Types.SyllabusEntry {
    state.syllabus.get(id);
  };

  /// Create a syllabus entry; returns the new id.
  public func createSyllabus(state : State, input : Types.SyllabusInput) : Nat {
    let id = state.nextSyllabusId;
    state.nextSyllabusId := id + 1;
    state.syllabus.add(id, {
      id;
      subject = input.subject;
      topics = input.topics;
      materialLink = input.materialLink;
      attachments = input.attachments;
    });
    id;
  };

  /// Update an existing syllabus entry; returns false when the id is unknown.
  public func updateSyllabus(state : State, id : Nat, input : Types.SyllabusInput) : Bool {
    switch (state.syllabus.get(id)) {
      case (?existing) {
        state.syllabus.add(id, {
          existing with
          subject = input.subject;
          topics = input.topics;
          materialLink = input.materialLink;
          attachments = input.attachments;
        });
        true;
      };
      case null { false };
    };
  };

  /// Delete a syllabus entry; returns false when the id is unknown.
  public func deleteSyllabus(state : State, id : Nat) : Bool {
    switch (state.syllabus.get(id)) {
      case (?_) { state.syllabus.remove(id); true };
      case null { false };
    };
  };

  /// Subject detail: syllabus outline plus associated class schedule.
  public func getSubjectDetail(state : State, subject : Text) : ?Types.SubjectDetail {
    let classes = state.classes.values().filter(
      func(slot) { slot.subject == subject }
    ).toArray();

    let syllabus = state.syllabus.values().find(
      func(entry) { entry.subject == subject }
    );

    if (classes.size() == 0 and syllabus == null) {
      null;
    } else {
      ?{ subject; syllabus; classes };
    };
  };

  /// Count class slots scheduled on `day`.
  public func countOnDay(state : State, day : Types.DayOfWeek) : Nat {
    state.classes.values().foldLeft(0, func(acc, slot) {
      if (slot.dayOfWeek == day) { acc + 1 } else { acc };
    });
  };
};
