import { apiRequest } from "../client";
import type { Player } from "../types";

export async function getMe(): Promise<Player> {
  return apiRequest<Player>("/player/me");
}
