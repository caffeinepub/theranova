import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import Layout from "./components/Layout";
import { DemoProvider } from "./contexts/DemoContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import Dashboard from "./pages/Dashboard";
import EyeControlModule from "./pages/EyeControlModule";
import LoginPage from "./pages/LoginPage";
import MotorModule from "./pages/MotorModule";
import MotorProgress from "./pages/MotorProgress";
import PathTracingGame from "./pages/PathTracingGame";
import PatientDetailPage from "./pages/PatientDetailPage";
import ReactionGame from "./pages/ReactionGame";
import RecoveryTipsPage from "./pages/RecoveryTipsPage";
import SpeechExercise from "./pages/SpeechExercise";
import SpeechModule from "./pages/SpeechModule";
import SpeechProgress from "./pages/SpeechProgress";
import TappingGame from "./pages/TappingGame";
import TherapistDashboard from "./pages/TherapistDashboard";

// Root route with layout
const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

// Login route (public)
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: LoginPage,
});

// Authenticated layout route
const authRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "auth",
  component: () => (
    <Layout>
      <Outlet />
    </Layout>
  ),
});

const dashboardRoute = createRoute({
  getParentRoute: () => authRoute,
  path: "/dashboard",
  component: Dashboard,
});

const speechRoute = createRoute({
  getParentRoute: () => authRoute,
  path: "/speech",
  component: SpeechModule,
});

const speechExerciseRoute = createRoute({
  getParentRoute: () => authRoute,
  path: "/speech/exercise/$exerciseIndex",
  component: SpeechExercise,
});

const speechProgressRoute = createRoute({
  getParentRoute: () => authRoute,
  path: "/speech/progress",
  component: SpeechProgress,
});

const motorRoute = createRoute({
  getParentRoute: () => authRoute,
  path: "/motor",
  component: MotorModule,
});

const pathTracingRoute = createRoute({
  getParentRoute: () => authRoute,
  path: "/motor/path",
  component: PathTracingGame,
});

const tappingRoute = createRoute({
  getParentRoute: () => authRoute,
  path: "/motor/tapping",
  component: TappingGame,
});

const reactionRoute = createRoute({
  getParentRoute: () => authRoute,
  path: "/motor/reaction",
  component: ReactionGame,
});

const motorProgressRoute = createRoute({
  getParentRoute: () => authRoute,
  path: "/motor/progress",
  component: MotorProgress,
});

const eyeControlRoute = createRoute({
  getParentRoute: () => authRoute,
  path: "/eye-control",
  component: EyeControlModule,
});

const therapistRoute = createRoute({
  getParentRoute: () => authRoute,
  path: "/therapist",
  component: TherapistDashboard,
});

const patientDetailRoute = createRoute({
  getParentRoute: () => authRoute,
  path: "/therapist/patient/$patientId",
  component: PatientDetailPage,
});

const tipsRoute = createRoute({
  getParentRoute: () => authRoute,
  path: "/tips",
  component: RecoveryTipsPage,
});

const routeTree = rootRoute.addChildren([
  loginRoute,
  authRoute.addChildren([
    dashboardRoute,
    tipsRoute,
    speechRoute,
    speechExerciseRoute,
    speechProgressRoute,
    motorRoute,
    pathTracingRoute,
    tappingRoute,
    reactionRoute,
    motorProgressRoute,
    eyeControlRoute,
    therapistRoute,
    patientDetailRoute,
  ]),
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <div className="dark">
      <LanguageProvider>
        <DemoProvider>
          <RouterProvider router={router} />
        </DemoProvider>
      </LanguageProvider>
    </div>
  );
}
