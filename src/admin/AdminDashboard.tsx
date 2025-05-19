import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";

const AdminDashboard: React.FC = () => {
  const location = useLocation();
  console.log("AdminDashboard rendered at:", location.pathname);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <nav className="mb-6 space-x-4">
        <Link to="personas" className="text-blue-600 hover:underline">Personas</Link>
        <Link to="users" className="text-blue-600 hover:underline">Users</Link>
        <Link to="api-calls" className="text-blue-600 hover:underline">API Calls</Link>
      </nav>
      <Outlet />
    </div>
  );
};

export default AdminDashboard; 