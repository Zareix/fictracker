import { Button } from "~/components/ui/button";
import { authClient } from "~/lib/auth-client";

const ProfilePage = () => {
  const logout = () => {
    authClient.signOut().catch(console.error);
  };

  return (
    <div>
      <header>
        <h1 className="text-3xl font-bold">Profile</h1>
      </header>
      <Button variant="destructive" onClick={logout}>
        Logout
      </Button>
    </div>
  );
};

export default ProfilePage;
