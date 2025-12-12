import { Container } from "~/components/shared/container";
import Profile from "./profile";
import type { User } from "~/gen/api-client/models";
import AccountAuthentication from "./authentication";

type Props = {
  user: User;
};

const Account = ({ user }: Props) => {
  return (
    <Container className="space-y-8">
      <Profile user={user} />
      <AccountAuthentication />
    </Container>
  );
};

export default Account;
