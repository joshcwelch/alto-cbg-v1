import { apiRequest } from "../client";
import type { PackOpenRequest, PackOpenResponse } from "../types";

export async function openPack(req: PackOpenRequest): Promise<PackOpenResponse> {
  return apiRequest<PackOpenResponse>("/packs/open", {
    method: "POST",
    body: JSON.stringify(req),
  });
}
