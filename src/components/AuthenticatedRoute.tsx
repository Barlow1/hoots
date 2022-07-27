import { Navigate } from "@tanstack/react-location";
import { routes } from "../routes";
import { useUser } from "./UserContext";

interface IAuthenticatedRouteProps {
  children: React.ReactNode;
}
export default function AuthenticatedRoute(
  props: IAuthenticatedRouteProps
): JSX.Element {
  const [ user ] = useUser();
  if (!user) {
    return <Navigate to={routes.login} />;
  } else {
    console.log("loggin in with user", user);
    return <>{props.children}</>;
  }
}
