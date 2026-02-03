import { apiRequest } from "../client";
import type { Quest } from "../types";

export async function getQuests(): Promise<Quest[]> {
  return apiRequest<Quest[]>("/quests");
}

export async function claimQuest(questId: string): Promise<Quest[]> {
  return apiRequest<Quest[]>("/quests/claim", {
    method: "POST",
    body: JSON.stringify({ questId }),
  });
}
