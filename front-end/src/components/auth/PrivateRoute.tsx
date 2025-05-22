import { useEffect } from "react";
import { useLocation, Route, RouteProps } from "wouter";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

interface PrivateRouteProps extends RouteProps {
  component: React.ComponentType<any>;
}

const PrivateRoute = ({ component: Component, ...rest }: PrivateRouteProps) => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [location, setLocation] = useLocation();
  
  useEffect(() => {
    if (!isAuthenticated) {
      // Redirect to login page if not authenticated
      setLocation("/login");
    }
  }, [isAuthenticated, setLocation]);
  
  return <Route {...rest} component={Component} />;
};

export default PrivateRoute;