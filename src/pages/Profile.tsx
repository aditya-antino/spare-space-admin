import { UpdateProfile, UpdatePWD } from "@/components";
import DashboardLayout from "@/components/layout/DashboardLayout";

const Profile = () => {
  return (
    <DashboardLayout title="Profile">
      <section className="w-auto flex items-center justify-center overflow-hidden">
        <div className="w-screen grid grid-cols-1 md:grid-cols-2 gap-6 justify-items-center">
          <UpdateProfile />
          <UpdatePWD />
        </div>
      </section>
    </DashboardLayout>
  );
};

export default Profile;
