import { LayoutDashboard, Users, MapPinned } from "lucide-react";

function Sidebar() {

  return (

    <div className="
      w-64
      min-h-screen
      bg-green-800
      text-white
      p-6
      hidden md:block
    ">

      <h1 className="
        text-3xl
        font-bold
        mb-10
      ">
        KrishiMitra
      </h1>

      <div className="space-y-6">

        <div className="flex items-center gap-3 cursor-pointer">
          <LayoutDashboard />
          <span>Dashboard</span>
        </div>

        <div className="flex items-center gap-3 cursor-pointer">
          <Users />
          <span>PFO Management</span>
        </div>

        <div className="flex items-center gap-3 cursor-pointer">
          <MapPinned />
          <span>District Allocation</span>
        </div>

      </div>

    </div>
  );
}

export default Sidebar;