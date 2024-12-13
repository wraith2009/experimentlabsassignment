import { createBrowserRouter, RouterProvider } from "react-router-dom";
import SignInPageComponent from "./components/(auth)/signin";
import SignUpPageComponent from "./components/(auth)/signup";
import { GoogleOAuthProvider } from "@react-oauth/google";

const appRouting = createBrowserRouter([
  {
    path: "Sign-in",
    element: <SignInPageComponent />,
  },
  {
    path: "Sign-up",
    element: <SignUpPageComponent />,
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
