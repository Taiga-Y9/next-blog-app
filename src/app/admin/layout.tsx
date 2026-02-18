"use client";
import React from "react";
import { useRouteGuard } from "@/app/_hooks/useRouteGuard";

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useRouteGuard();
  if (!isAuthenticated) return null;
  return <>{children}</>;
};

export default AdminLayout;
