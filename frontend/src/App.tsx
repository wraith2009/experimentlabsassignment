import { createBrowserRouter, RouterProvider } from "react-router-dom";
import SignInPageComponent from "./components/(auth)/signin";
import SignUpPageComponent from "./components/(auth)/signup";
import { GoogleOAuthProvider } from "@react-oauth/google";
import EventManagementCalendar from "./components/dashboard/calander";

const appRouting = createBrowserRouter([
  {
    path: "/",
    element: <SignInPageComponent />,
  },
  {
    path: "sign-in",
    element: <SignInPageComponent />,
  },
  {
    path: "sign-up",
    element: <SignUpPageComponent />,
  },
  {
    path: "/home",
    children: [
      {
        index: true,
        element: <EventManagementCalendar />,
      },
    ],
  },
]);
const App = () => {
  const clientID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  if (!clientID) {
    return <div>Client ID is not set</div>;
  }

  console.log(clientID);
  return (
    <GoogleOAuthProvider clientId={clientID}>
      <RouterProvider router={appRouting} />
    </GoogleOAuthProvider>
  );
};

export default App;
