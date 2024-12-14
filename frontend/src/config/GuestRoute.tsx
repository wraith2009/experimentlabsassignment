import { Navigate } from "react-router-dom";

export const GuestRoute = () => {
  const token = localStorage.getItem("token");
  if (token) {
    return <Navigate to="/home" />;
  } else {
    return <Navigate to="/sign-in" />;
  }
};
