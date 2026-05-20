import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { getPostAuthRedirectPath } from "../../utils/authNavigation";

import LoginLayout from "../../components/login/LoginLayout";
import LoginForm from "../../components/login/Loginform";

export default function Login() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    navigate(getPostAuthRedirectPath(user), { replace: true });
  }, [navigate, user]);

  return (
    <LoginLayout>
      <LoginForm />
    </LoginLayout>
  );
}