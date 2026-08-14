import { Navigate } from "react-router-dom";
import { useAuth } from "../context/authContext";

interface Props {
  children: React.ReactElement;
}

export default function GuestRoute({ children }: Props) {
  const { user, loading } = useAuth();

  if (loading) {
    return <h2>Loading...</h2>;
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return children;
}