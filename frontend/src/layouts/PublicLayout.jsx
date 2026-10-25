import React from "react";
import { Outlet } from "react-router-dom";
import { PublicNavbar } from "../components/common/PublicNavbar";
import { PublicFooter } from "../components/common/PublicFooter";

export function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 font-sans antialiased selection:bg-indigo-500 selection:text-white">
      <PublicNavbar />
      <main className="w-full flex-1 bg-white">
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  );
}
