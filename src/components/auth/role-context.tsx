"use client";
import { createContext, useContext } from "react";
type Role = "admin" | "member";
const RoleContext = createContext<Role>("member");
export function RoleProvider({ role, children }: { role: Role; children: React.ReactNode }) {
  return <RoleContext.Provider value={role}>{children}</RoleContext.Provider>;
}
export function useUserRole() { return useContext(RoleContext); }
