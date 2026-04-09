import React, { useContext, useEffect } from "react";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  Outlet,
  RouterProvider,
} from "react-router-dom";
import { Worker } from "@react-pdf-viewer/core";

import Sidebar from "./components/Sidebar";
import Mainwindow from "./components/Mainwindow";
import Window from "./components/Window";
import FinePlate from "./components/shearConnection/FinePlate";
import EndPlate from "./components/shearConnection/EndPlate";
import CleatAngle from "./components/shearConnection/CleatAngle";
import SeatedAngle from "./components/shearConnection/SeatedAngle";
import UserAccount from "./components/userAccount/UserAccount";
import LoginPage from "./components/userAuth/LoginPage";

import { GlobalProvider } from "./context/GlobalState";
import { ModuleProvider } from "./context/ModuleState";
import { UserContext, UserProvider } from "./context/UserState";

import jwt_decode from "jwt-decode";
import GroupDesignPage from "./GroupDesign/pages/GroupDesignPage";

let renderedOnce = false;

function AppInner() {
  const { isLoggedIn } = useContext(UserContext);

  useEffect(() => {
    console.log("isLoggedIn:", isLoggedIn);
  }, [isLoggedIn]);

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<Root />}>
        <Route index element={<LoginPage />} />
        <Route path="home" element={<Mainwindow />} />

        {/* Keep specific route before dynamic route */}
        <Route path="design-type/group-design" element={<GroupDesignPage />} />
        <Route path="design-type/:designType" element={<Window />} />

        <Route path="design/:designType/fin_plate" element={<FinePlate />} />
        <Route path="design/:designType/end_plate" element={<EndPlate />} />
        <Route path="design/:designType/cleat_angle" element={<CleatAngle />} />
        <Route path="design/:designType/seated_angle" element={<SeatedAngle />} />

        <Route path="user" element={<UserAccount />} />
      </Route>
    )
  );

  return <RouterProvider router={router} />;
}

const Root = () => {
  const { userLogin } = useContext(UserContext);

  useEffect(() => {
    if (renderedOnce) return;

    if (localStorage.getItem("access")) {
      const decodedAccessToken = jwt_decode(localStorage.getItem("access"));
      if (
        decodedAccessToken?.exp > Date.now() / 1000 &&
        decodedAccessToken?.username &&
        decodedAccessToken?.password &&
        decodedAccessToken?.email
      ) {
        userLogin(decodedAccessToken.username, decodedAccessToken.password, false, true);
      }
    }

    renderedOnce = true;
  }, [userLogin]);

  const isDesignPage = window.location.pathname.startsWith("/design/");
  const isUserProfilePage = window.location.pathname.startsWith("/useraccount/");
  const isLoginPage = window.location.pathname === "/";

  return (
    <>
      {!isLoginPage && !isDesignPage && !isUserProfilePage && (
        <div>
          <Sidebar />
        </div>
      )}
      <div>
        <Outlet />
      </div>
    </>
  );
};

export default function App() {
  return (
    <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
      <UserProvider>
        <GlobalProvider>
          <ModuleProvider>
            <div className="app">
              <AppInner />
            </div>
          </ModuleProvider>
        </GlobalProvider>
      </UserProvider>
    </Worker>
  );
}