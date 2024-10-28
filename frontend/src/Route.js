import React, { lazy } from "react";

const HomePage = lazy(() => import("./Pages/HomePage"));
const TaskPage = lazy(() => import("./Pages/TaskPage"));
const Loader = lazy(() => import("./components/Loader"));
const Users = lazy(() => import("./Pages/Users"));
const ProfilePage = lazy(() => import("./Pages/ProfilePage"));

export const routes = [
  {
    path: "home",
    component: HomePage,
  },
  {
    path: "task",
    component: TaskPage,
  },
  {
    path: "test",
    component: Loader,
  },
   {
    path: "user",
    component: Users,
  },
   {
    path: "profile",
    component: ProfilePage,
  },
];
