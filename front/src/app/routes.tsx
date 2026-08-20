import { Suspense, lazy } from "react";
import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import Spinner from "./components/Spinner";

const Home = lazy(() => import("./pages/Home"));
const About = lazy(() => import("./pages/About"));
const Features = lazy(() => import("./pages/Features"));
const AITool = lazy(() => import("./pages/AITool"));
const Blogs = lazy(() => import("./pages/Blogs"));
const BlogDetail = lazy(() => import("./pages/BlogDetail"));
const Profile = lazy(() => import("./pages/Profile"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Clinical Workspace Pages
const Dashboard = lazy(() => import("./pages/Dashboard"));
const PatientsList = lazy(() => import("./pages/PatientsList"));
const PatientWorkspace = lazy(() => import("./pages/PatientWorkspace"));
const OdontogramPage = lazy(() => import("./pages/OdontogramPage"));
const ChatbotPage = lazy(() => import("./pages/ChatbotPage"));
const CalendarPage = lazy(() => import("./pages/CalendarPage"));

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: "/",
        Component: () => (
          <Suspense fallback={<Spinner />}>
            <Home />
          </Suspense>
        ),
      },
      {
        path: "/about",
        Component: () => (
          <Suspense fallback={<Spinner />}>
            <About />
          </Suspense>
        ),
      },
      {
        path: "/features",
        Component: () => (
          <Suspense fallback={<Spinner />}>
            <Features />
          </Suspense>
        ),
      },
      {
        path: "/ai-tool",
        Component: () => (
          <Suspense fallback={<Spinner />}>
            <AITool />
          </Suspense>
        ),
      },
      {
        path: "/dashboard",
        Component: () => (
          <Suspense fallback={<Spinner />}>
            <Dashboard />
          </Suspense>
        ),
      },
      {
        path: "/patients",
        Component: () => (
          <Suspense fallback={<Spinner />}>
            <PatientsList />
          </Suspense>
        ),
      },
      {
        path: "/patients/:id",
        Component: () => (
          <Suspense fallback={<Spinner />}>
            <PatientWorkspace />
          </Suspense>
        ),
      },
      {
        path: "/patients/:id/odontogram",
        Component: () => (
          <Suspense fallback={<Spinner />}>
            <OdontogramPage />
          </Suspense>
        ),
      },
      {
        path: "/chat",
        Component: () => (
          <Suspense fallback={<Spinner />}>
            <ChatbotPage />
          </Suspense>
        ),
      },
      {
        path: "/calendar",
        Component: () => (
          <Suspense fallback={<Spinner />}>
            <CalendarPage />
          </Suspense>
        ),
      },
      {
        path: "/blogs",
        Component: () => (
          <Suspense fallback={<Spinner />}>
            <Blogs />
          </Suspense>
        ),
      },
      {
        path: "/blogs/:id",
        Component: () => (
          <Suspense fallback={<Spinner />}>
            <BlogDetail />
          </Suspense>
        ),
      },
      {
        path: "/profile",
        Component: () => (
          <Suspense fallback={<Spinner />}>
            <Profile />
          </Suspense>
        ),
      },
      {
        path: "*",
        Component: () => (
          <Suspense fallback={<Spinner />}>
            <NotFound />
          </Suspense>
        ),
      },
    ],
  },
]);
