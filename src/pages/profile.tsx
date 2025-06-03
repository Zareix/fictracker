import { ChangeEmailForm } from "~/components/profile/change-email-form";
import { Button } from "~/components/ui/button";
import { authClient } from "~/lib/auth-client";

const ProfilePage = () => {
  const session = authClient.useSession();

  const logout = () => {
    authClient.signOut().catch(console.error);
  };

  return (
    <div>
      <header className="flex items-center">
        <h1 className="text-3xl font-bold">Profile</h1>
        <Button variant="destructive" onClick={logout} className="ml-auto">
          Logout
        </Button>
      </header>
      <section className="mt-6">
        {session.data?.user.email && (
          <ChangeEmailForm currentEmail={session.data.user.email} />
        )}
      </section>
    </div>
  );
};

export default ProfilePage;
