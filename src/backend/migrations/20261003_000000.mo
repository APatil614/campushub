import AccessControl "mo:caffeineai-authorization/access-control";
import Map "mo:core/Map";
import Principal "mo:core/Principal";

module {
  // First entry in the chain: the canister starts empty.
  public type OldActor = {};

  // New stable shape: authorization plus the CampusHub domain state.
  public type NewActor = {
    accessControlState : AccessControl.AccessControlState;
    noticesState : {
      var nextId : Nat;
      notices : Map.Map<Nat, Notice>;
    };
    eventsState : {
      var nextId : Nat;
      events : Map.Map<Nat, Event>;
    };
    classesState : {
      var nextClassId : Nat;
      var nextSyllabusId : Nat;
      classes : Map.Map<Nat, ClassSlot>;
      syllabus : Map.Map<Nat, SyllabusEntry>;
    };
  };

  type Attachment = { blob : Blob; filename : Text; mimeType : Text };

  type NoticeCategory = { #academic; #exam; #fee; #general; #urgent };

  type Notice = {
    id : Nat;
    title : Text;
    body : Text;
    category : NoticeCategory;
    author : Principal;
    postedAt : Int;
    pinned : Bool;
    attachments : [Attachment];
  };

  type EventType = { #event; #competition; #workshop; #activity };

  type Event = {
    id : Nat;
    title : Text;
    description : Text;
    eventType : EventType;
    startAt : Int;
    endAt : Int;
    venue : Text;
    organiser : Text;
    registrationInfo : Text;
    attachments : [Attachment];
  };

  type DayOfWeek = {
    #monday;
    #tuesday;
    #wednesday;
    #thursday;
    #friday;
    #saturday;
    #sunday;
  };

  type ClassSlot = {
    id : Nat;
    subject : Text;
    dayOfWeek : DayOfWeek;
    startTime : Text;
    endTime : Text;
    room : Text;
    instructor : Text;
  };

  type SyllabusTopic = { title : Text; description : Text };

  type SyllabusEntry = {
    id : Nat;
    subject : Text;
    topics : [SyllabusTopic];
    materialLink : ?Text;
    attachments : [Attachment];
  };

  // Fixed reference instants (nanoseconds since epoch) so the seed is stable.
  // 2026-10-01T09:00:00Z and nearby days.
  let day : Int = 86_400_000_000_000;
  let base : Int = 1_790_000_000_000_000_000;

  public func migration(_ : OldActor) : NewActor {
    let notices = Map.empty<Nat, Notice>();
    notices.add(0, {
      id = 0;
      title = "Mid-semester examination timetable released";
      body = "The mid-semester examination timetable for all departments is now available. Exams begin on 20 October and run through 31 October. Please check your department notice board for room allocations and report any clashes to the examination cell within three days.";
      category = #exam;
      author = seedAuthor();
      postedAt = base;
      pinned = true;
      attachments = [];
    });
    notices.add(1, {
      id = 1;
      title = "Library extended hours during exam week";
      body = "The central library will remain open until 11:00 PM from 18 October to 31 October. Reading halls 2 and 3 are reserved for silent study. Bring your student ID for after-hours entry.";
      category = #academic;
      author = seedAuthor();
      postedAt = base - day;
      pinned = false;
      attachments = [];
    });
    notices.add(2, {
      id = 2;
      title = "Semester fee payment deadline";
      body = "The last date to pay semester fees without a late fine is 15 November. Payments can be made online through the student portal or at the accounts office between 10:00 AM and 3:00 PM on working days.";
      category = #fee;
      author = seedAuthor();
      postedAt = base - 2 * day;
      pinned = false;
      attachments = [];
    });
    notices.add(3, {
      id = 3;
      title = "Annual cultural fest registrations open";
      body = "Registrations for the annual cultural fest are now open. Students can sign up for music, dance, drama, and literary events at the student activity centre. Last date to register is 25 October.";
      category = #general;
      author = seedAuthor();
      postedAt = base - 3 * day;
      pinned = false;
      attachments = [];
    });
    notices.add(4, {
      id = 4;
      title = "Campus water supply interruption on Saturday";
      body = "Due to scheduled maintenance, water supply to the hostels and academic blocks will be interrupted on Saturday from 9:00 AM to 1:00 PM. Please store water in advance.";
      category = #urgent;
      author = seedAuthor();
      postedAt = base - 4 * day;
      pinned = false;
      attachments = [];
    });

    let events = Map.empty<Nat, Event>();
    events.add(0, {
      id = 0;
      title = "Inter-College Coding Hackathon";
      description = "A 24-hour coding marathon where teams of up to four build a working prototype around this year's theme, Smart Campus. Mentors from industry will guide teams through the night. Prizes for the top three teams.";
      eventType = #competition;
      startAt = base + 5 * day;
      endAt = base + 6 * day;
      venue = "Innovation Lab, Block C";
      organiser = "Department of Computer Science";
      registrationInfo = "Register at the CS department office or online by 18 October. Teams of 2-4. Free entry.";
      attachments = [];
    });
    events.add(1, {
      id = 1;
      title = "Robotics Workshop for Beginners";
      description = "A hands-on weekend workshop covering microcontrollers, sensors, and basic robot assembly. All components are provided. No prior experience required.";
      eventType = #workshop;
      startAt = base + 8 * day;
      endAt = base + 8 * day + day / 2;
      venue = "Electronics Lab, Block B";
      organiser = "Robotics Club";
      registrationInfo = "Limited to 30 seats. Register at the robotics club desk in the student centre.";
      attachments = [];
    });
    events.add(2, {
      id = 2;
      title = "Annual Sports Meet";
      description = "Three days of track and field, cricket, football, basketball, and indoor games. Students from all departments compete for the overall championship trophy.";
      eventType = #event;
      startAt = base + 12 * day;
      endAt = base + 14 * day;
      venue = "Main Sports Ground";
      organiser = "Department of Physical Education";
      registrationInfo = "Team captains must submit participant lists to the sports office by 30 October.";
      attachments = [];
    });
    events.add(3, {
      id = 3;
      title = "Blood Donation Camp";
      description = "A campus-wide blood donation drive in association with the city blood bank. Donors receive a certificate and refreshments. Open to all students and staff.";
      eventType = #activity;
      startAt = base + 3 * day;
      endAt = base + 3 * day + day / 4;
      venue = "Health Centre";
      organiser = "NSS Unit";
      registrationInfo = "Walk-in registration. Bring a valid ID and eat a light meal before donating.";
      attachments = [];
    });
    events.add(4, {
      id = 4;
      title = "Guest Lecture: Careers in Data Science";
      description = "An industry expert discusses career paths, required skills, and interview preparation for data science and analytics roles.";
      eventType = #event;
      startAt = base - 2 * day;
      endAt = base - 2 * day + day / 8;
      venue = "Seminar Hall 1";
      organiser = "Placement Cell";
      registrationInfo = "Open to all. No registration required.";
      attachments = [];
    });

    let classes = Map.empty<Nat, ClassSlot>();
    classes.add(0, { id = 0; subject = "Data Structures"; dayOfWeek = #monday; startTime = "09:00"; endTime = "10:00"; room = "CS-101"; instructor = "Dr. Meera Nair" });
    classes.add(1, { id = 1; subject = "Discrete Mathematics"; dayOfWeek = #monday; startTime = "10:15"; endTime = "11:15"; room = "M-204"; instructor = "Prof. Arjun Rao" });
    classes.add(2, { id = 2; subject = "Digital Electronics"; dayOfWeek = #monday; startTime = "11:30"; endTime = "12:30"; room = "EC-110"; instructor = "Dr. Kavita Sharma" });
    classes.add(3, { id = 3; subject = "Data Structures"; dayOfWeek = #tuesday; startTime = "09:00"; endTime = "10:00"; room = "CS-101"; instructor = "Dr. Meera Nair" });
    classes.add(4, { id = 4; subject = "Operating Systems"; dayOfWeek = #tuesday; startTime = "10:15"; endTime = "11:15"; room = "CS-102"; instructor = "Prof. Sanjay Iyer" });
    classes.add(5, { id = 5; subject = "Technical Communication"; dayOfWeek = #tuesday; startTime = "14:00"; endTime = "15:00"; room = "H-301"; instructor = "Ms. Ritu Verma" });
    classes.add(6, { id = 6; subject = "Discrete Mathematics"; dayOfWeek = #wednesday; startTime = "09:00"; endTime = "10:00"; room = "M-204"; instructor = "Prof. Arjun Rao" });
    classes.add(7, { id = 7; subject = "Operating Systems"; dayOfWeek = #wednesday; startTime = "10:15"; endTime = "11:15"; room = "CS-102"; instructor = "Prof. Sanjay Iyer" });
    classes.add(8, { id = 8; subject = "Digital Electronics Lab"; dayOfWeek = #wednesday; startTime = "14:00"; endTime = "16:00"; room = "EC-Lab-2"; instructor = "Dr. Kavita Sharma" });
    classes.add(9, { id = 9; subject = "Data Structures"; dayOfWeek = #thursday; startTime = "09:00"; endTime = "10:00"; room = "CS-101"; instructor = "Dr. Meera Nair" });
    classes.add(10, { id = 10; subject = "Operating Systems Lab"; dayOfWeek = #thursday; startTime = "10:15"; endTime = "12:15"; room = "CS-Lab-1"; instructor = "Prof. Sanjay Iyer" });
    classes.add(11, { id = 11; subject = "Discrete Mathematics"; dayOfWeek = #friday; startTime = "09:00"; endTime = "10:00"; room = "M-204"; instructor = "Prof. Arjun Rao" });
    classes.add(12, { id = 12; subject = "Technical Communication"; dayOfWeek = #friday; startTime = "10:15"; endTime = "11:15"; room = "H-301"; instructor = "Ms. Ritu Verma" });
    classes.add(13, { id = 13; subject = "Digital Electronics"; dayOfWeek = #friday; startTime = "11:30"; endTime = "12:30"; room = "EC-110"; instructor = "Dr. Kavita Sharma" });

    let syllabus = Map.empty<Nat, SyllabusEntry>();
    syllabus.add(0, {
      id = 0;
      subject = "Data Structures";
      topics = [
        { title = "Unit 1: Arrays and Linked Lists"; description = "Static and dynamic arrays, singly and doubly linked lists, complexity analysis." },
        { title = "Unit 2: Stacks and Queues"; description = "LIFO and FIFO structures, circular queues, applications in expression evaluation." },
        { title = "Unit 3: Trees"; description = "Binary trees, traversals, binary search trees, balanced trees and heaps." },
        { title = "Unit 4: Graphs"; description = "Representations, BFS, DFS, shortest paths, and minimum spanning trees." },
        { title = "Unit 5: Hashing and Sorting"; description = "Hash tables, collision handling, and comparison-based sorting algorithms." },
      ];
      materialLink = ?"https://example.edu/courses/data-structures";
      attachments = [];
    });
    syllabus.add(1, {
      id = 1;
      subject = "Operating Systems";
      topics = [
        { title = "Unit 1: Introduction"; description = "OS structure, system calls, processes, and threads." },
        { title = "Unit 2: CPU Scheduling"; description = "Scheduling algorithms, context switching, and performance metrics." },
        { title = "Unit 3: Synchronization"; description = "Critical sections, semaphores, monitors, and deadlock handling." },
        { title = "Unit 4: Memory Management"; description = "Paging, segmentation, virtual memory, and page replacement." },
        { title = "Unit 5: File Systems"; description = "File organisation, directories, disk scheduling, and I/O." },
      ];
      materialLink = ?"https://example.edu/courses/operating-systems";
      attachments = [];
    });
    syllabus.add(2, {
      id = 2;
      subject = "Discrete Mathematics";
      topics = [
        { title = "Unit 1: Set Theory and Logic"; description = "Sets, relations, functions, propositional and predicate logic." },
        { title = "Unit 2: Combinatorics"; description = "Permutations, combinations, pigeonhole principle, and recurrence relations." },
        { title = "Unit 3: Graph Theory"; description = "Graphs, trees, connectivity, Euler and Hamiltonian paths." },
        { title = "Unit 4: Number Theory"; description = "Divisibility, modular arithmetic, and cryptography basics." },
      ];
      materialLink = null;
      attachments = [];
    });
    syllabus.add(3, {
      id = 3;
      subject = "Digital Electronics";
      topics = [
        { title = "Unit 1: Number Systems"; description = "Binary, octal, hexadecimal, and arithmetic operations." },
        { title = "Unit 2: Boolean Algebra"; description = "Logic gates, simplification, and Karnaugh maps." },
        { title = "Unit 3: Combinational Circuits"; description = "Adders, multiplexers, encoders, and decoders." },
        { title = "Unit 4: Sequential Circuits"; description = "Flip-flops, registers, counters, and state machines." },
      ];
      materialLink = ?"https://example.edu/courses/digital-electronics";
      attachments = [];
    });

    {
      accessControlState = AccessControl.initState();
      noticesState = { var nextId = 5; notices };
      eventsState = { var nextId = 5; events };
      classesState = {
        var nextClassId = 14;
        var nextSyllabusId = 4;
        classes;
        syllabus;
      };
    };
  };

  // Placeholder author principal for seeded content. The first admin to sign in
  // becomes the real admin; seeded notices keep this stable placeholder.
  func seedAuthor() : Principal {
    Principal.fromText("2vxsx-fae");
  };
};
