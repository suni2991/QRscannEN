import { useLocation, Navigate, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const RequireAuth = () => {

    const { auth } = useAuth();
    const location = useLocation();

    return (
        auth.fullName || auth.role
            ? <Outlet />
            :  <Navigate to="/" state={{ from: location }} replace />
    )
}

export default RequireAuth;
