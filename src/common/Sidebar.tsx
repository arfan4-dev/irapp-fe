// src/components/custom/Sidebar.jsx
import { LayoutDashboard, Users, Folder, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Sidebar() {
  return (
    <div className="w-full md:w-64 bg-white border-r p-4 space-y-4 hidden md:block">
      <h2 className="text-xl font-bold mb-4">Admin Menu</h2>
      <nav className="space-y-2">
        <Button variant="ghost" className="w-full justify-start">
          <LayoutDashboard className="w-4 h-4 mr-2" /> Dashboard
        </Button>
        <Button variant="ghost" className="w-full justify-start">
          <Folder className="w-4 h-4 mr-2" /> All Requests
        </Button>
        <Button variant="ghost" className="w-full justify-start">
          <Users className="w-4 h-4 mr-2" /> Users
        </Button>
        <Button variant="ghost" className="w-full justify-start">
          <Settings className="w-4 h-4 mr-2" /> Settings
        </Button>
      </nav>
    </div>
  );
}
