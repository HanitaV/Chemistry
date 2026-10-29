import { lazy } from "react";
import { createHashRouter } from "react-router";
import { AppShell } from "@/components/layout/app-shell";
import { RouteError } from "@/pages/route-error";

/**
 * Dùng HashRouter (#/...) để mọi đường dẫn hoạt động trên GitHub Pages mà không cần cấu hình 404.html.
 * Các trang được tách chunk (lazy) để giảm dung lượng tải lần đầu.
 */
const DashboardPage = lazy(() => import("@/pages/dashboard-page"));
const CoursesPage = lazy(() => import("@/pages/courses-page"));
const CoursePage = lazy(() => import("@/pages/course-page"));
const ChapterPage = lazy(() => import("@/pages/chapter-page"));
const LessonPage = lazy(() => import("@/pages/lesson-page"));
const GraphPage = lazy(() => import("@/pages/graph-page"));
const VideosPage = lazy(() => import("@/pages/videos-page"));
const PracticePage = lazy(() => import("@/pages/practice-page"));
const ExercisePage = lazy(() => import("@/pages/exercise-page"));
const LibraryPage = lazy(() => import("@/pages/library-page"));
const ReaderPage = lazy(() => import("@/pages/reader-page"));
const PersonalDocPage = lazy(() => import("@/pages/personal-doc-page"));
const ProgressPage = lazy(() => import("@/pages/progress-page"));
const ExamPrepPage = lazy(() => import("@/pages/exam-prep-page"));
const SettingsPage = lazy(() => import("@/pages/settings-page"));
const NotFoundPage = lazy(() => import("@/pages/not-found-page"));

export const router = createHashRouter([
  {
    path: "/",
    element: <AppShell />,
    errorElement: <RouteError />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "courses", element: <CoursesPage /> },
      { path: "courses/:courseId", element: <CoursePage /> },
      { path: "courses/:courseId/chapters/:chapterId", element: <ChapterPage /> },
      { path: "courses/:courseId/lessons/:lessonId", element: <LessonPage /> },
      { path: "graph", element: <GraphPage /> },
      { path: "videos", element: <VideosPage /> },
      { path: "practice", element: <PracticePage /> },
      { path: "practice/:exerciseId", element: <ExercisePage /> },
      { path: "library", element: <LibraryPage /> },
      { path: "library/personal/:docId", element: <PersonalDocPage /> },
      { path: "library/:documentId", element: <ReaderPage /> },
      { path: "progress", element: <ProgressPage /> },
      { path: "exam-prep", element: <ExamPrepPage /> },
      { path: "settings", element: <SettingsPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
