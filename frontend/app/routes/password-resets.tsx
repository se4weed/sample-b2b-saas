import { useNavigate } from "react-router";
import PasswordResets from "~/core/password-resets";
import { useCurrentUserState } from "~/globalStates/user";

const PasswordResetsPage = () => {
  const user = useCurrentUserState();
  const navigate = useNavigate();
  if (user) {
    navigate("/");
    return null;
  }
  return <PasswordResets />;
};

export default PasswordResetsPage;
