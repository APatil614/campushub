import AccessControl "mo:caffeineai-authorization/access-control";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import Expose "mo:caffeineai-oql/Expose";
import Entity "mo:caffeineai-oql/Entity";
import MapEntity "mo:caffeineai-oql/MapEntity";
import NatValue "mo:caffeineai-oql/NatValue";
import TextValue "mo:caffeineai-oql/TextValue";
import PrincipalValue "mo:caffeineai-oql/PrincipalValue";
import BoolValue "mo:caffeineai-oql/BoolValue";
import IntValue "mo:caffeineai-oql/IntValue";
import NoticeCategoryValue "NoticeCategoryValue";
import EventTypeValue "EventTypeValue";
import DayOfWeekValue "DayOfWeekValue";

import NoticesLib "lib/notices";
import EventsLib "lib/events";
import ClassesLib "lib/classes";

import NoticesApi "mixins/notices-api";
import EventsApi "mixins/events-api";
import ClassesApi "mixins/classes-api";
import HomeApi "mixins/home-api";
import ApiDocMixin "mixins/api-doc";

actor {
  let accessControlState : AccessControl.AccessControlState;

  let noticesState : NoticesLib.State;
  let eventsState : EventsLib.State;
  let classesState : ClassesLib.State;

  include MixinAuthorization(accessControlState, null);

  include NoticesApi(noticesState, accessControlState);
  include EventsApi(eventsState, accessControlState);
  include ClassesApi(classesState, accessControlState);
  include HomeApi(noticesState, eventsState, classesState);
  include ApiDocMixin();

  include Expose({
    entities = [
      noticesState.notices.toEntityManual("notice", "Notice", "id")
        .sample({
          id = 0;
          title = "";
          body = "";
          category = #general;
          author = Principal.fromText("aaaaa-aa");
          postedAt = 0;
          pinned = false;
          attachments = [];
        })
        .payload("id", func n = n.id)
        .payload("title", func n = n.title)
        .payload("body", func n = n.body)
        .payload("category", func n = n.category)
        .payload("author", func n = n.author)
        .payload("postedAt", func n = n.postedAt)
        .payload("pinned", func n = n.pinned)
        .payload("attachmentCount", func n = n.attachments.size())
        .public_()
        .build(),
      eventsState.events.toEntityManual("event", "Event", "id")
        .sample({
          id = 0;
          title = "";
          description = "";
          eventType = #event;
          startAt = 0;
          endAt = 0;
          venue = "";
          organiser = "";
          registrationInfo = "";
          attachments = [];
        })
        .payload("id", func e = e.id)
        .payload("title", func e = e.title)
        .payload("description", func e = e.description)
        .payload("eventType", func e = e.eventType)
        .payload("startAt", func e = e.startAt)
        .payload("endAt", func e = e.endAt)
        .payload("venue", func e = e.venue)
        .payload("organiser", func e = e.organiser)
        .payload("registrationInfo", func e = e.registrationInfo)
        .payload("attachmentCount", func e = e.attachments.size())
        .public_()
        .build(),
      classesState.classes.toEntityManual("class", "ClassSlot", "id")
        .sample({
          id = 0;
          subject = "";
          dayOfWeek = #monday;
          startTime = "";
          endTime = "";
          room = "";
          instructor = "";
        })
        .payload("id", func c = c.id)
        .payload("subject", func c = c.subject)
        .payload("dayOfWeek", func c = c.dayOfWeek)
        .payload("startTime", func c = c.startTime)
        .payload("endTime", func c = c.endTime)
        .payload("room", func c = c.room)
        .payload("instructor", func c = c.instructor)
        .public_()
        .build(),
      classesState.syllabus.toEntityManual("syllabus", "SyllabusEntry", "id")
        .sample({
          id = 0;
          subject = "";
          topics = [];
          materialLink = null;
          attachments = [];
        })
        .payload("id", func s = s.id)
        .payload("subject", func s = s.subject)
        .payload("topicCount", func s = s.topics.size())
        .payload("materialLink", func s = s.materialLink ?? "")
        .payload("attachmentCount", func s = s.attachments.size())
        .public_()
        .build(),
    ];
  });
};
