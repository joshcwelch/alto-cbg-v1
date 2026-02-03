import { apiRequest } from "../client";
import type { Inventory } from "../types";

export async function getInventory(): Promise<Inventory> {
  return apiRequest<Inventory>("/inventory");
}
