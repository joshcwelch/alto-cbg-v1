import { apiRequest } from "../client";
import type { Session } from "../types";

export async function login(username: string, password: string): Promise<Session> {
  return apiRequest<Session>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export async function logout(): Promise<void> {
  await apiRequest<void>("/auth/logout", { method: "POST" });
}

export async function listUsers(): Promise<Array<{ id: string; username: string; displayName: string }>> {
  return apiRequest<Array<{ id: string; username: string; displayName: string }>>("/auth/users");
}
