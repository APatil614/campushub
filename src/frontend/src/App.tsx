import { Layout } from "@/components/Layout";
import AdminPage from "@/pages/AdminPage";
import { ClassesPage } from "@/pages/ClassesPage";
import { EventDetailPage } from "@/pages/EventDetailPage";
import { EventsPage } from "@/pages/EventsPage";
import type { EventsSearch } from "@/pages/EventsPage";
import { HomePage } from "@/pages/HomePage";
import { NoticeDetailPage } from "@/pages/NoticeDetailPage";
import { NoticesPage } from "@/pages/NoticesPage";
import { SubjectDetailPage } from "@/pages/SubjectDetailPage";
import { SyllabusPage } from "@/pages/SyllabusPage";
import {
  EventTimeFilter,
  EventType,
  NoticeCategory,
  NoticeSort,
} from "@/types";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";

/** Search params for the notices list, kept in the URL so views are shareable. */
interface NoticesSearch {
  category?: NoticeCategory;
  search?: string;
  sort?: NoticeSort;
}

/** Validate and normalize notices search params from the URL. */
function validateNoticesSearch(search: Record<string, unknown>): NoticesSearch {
  const result: NoticesSearch = {};
  const category = search.category;
  if (
    typeof category === "string" &&
    (Object.values(NoticeCategory) as string[]).includes(category)
  ) {
    result.category = category as NoticeCategory;
  }
  const sort = search.sort;
  if (
    typeof sort === "string" &&
    (Object.values(NoticeSort) as string[]).includes(sort)
  ) {
    result.sort = sort as NoticeSort;
  }
  if (typeof search.search === "string" && search.search.trim() !== "") {
    result.search = search.search;
  }
  return result;
}

/** Validate and normalize events search params from the URL. */
function validateEventsSearch(search: Record<string, unknown>): EventsSearch {
  const result: EventsSearch = {};
  const type = search.type;
  if (
    typeof type === "string" &&
    (Object.values(EventType) as string[]).includes(type)
  ) {
    result.type = type as EventType;
  }
  const time = search.time;
  if (
    typeof time === "string" &&
    (Object.values(EventTimeFilter) as string[]).includes(time)
  ) {
    result.time = time as EventTimeFilter;
  }
  if (typeof search.q === "string" && search.q.trim() !== "") {
    result.q = search.q;
  }
  return result;
}

const rootRoute = createRootRoute({
  component: () => (
    <Layout>
      <Outlet />
    </Layout>
  ),
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const noticesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/notices",
  validateSearch: validateNoticesSearch,
  component: NoticesPage,
});

const noticeDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/notices/$id",
  component: NoticeDetailPage,
});

const eventsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/events",
  validateSearch: validateEventsSearch,
  component: EventsPage,
});

const eventDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/events/$id",
  component: EventDetailPage,
});

const classesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/classes",
  component: ClassesPage,
});

const syllabusRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/syllabus",
  component: SyllabusPage,
});

const syllabusDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/syllabus/$subject",
  component: SubjectDetailPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminPage,
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  noticesRoute,
  noticeDetailRoute,
  eventsRoute,
  eventDetailRoute,
  classesRoute,
  syllabusRoute,
  syllabusDetailRoute,
  adminRoute,
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
