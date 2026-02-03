import { http, HttpResponse } from "msw";
import { db } from "./db";

function requireAuth(request: Request): string | HttpResponse {
  const userId = db.getUserIdFromAuthHeader(request);
  if (!userId) {
    return HttpResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return userId;
}

export const handlers = [
  http.post("/auth/login", async ({ request }) => {
    const body = (await request.json()) as { username?: string; password?: string };
    await db.ensureDefaultUsers();
    const user = db.findUserByUsername(body.username ?? "");
    if (!user || !(await db.verifyPassword(user, body.password ?? ""))) {
      return HttpResponse.json({ error: "invalid_credentials" }, { status: 401 });
    }
    db.ensureSeeded(user.id);
    const session = db.setSession(user.id);
    return HttpResponse.json(session);
  }),

  http.post("/auth/logout", () => {
    db.clearSession();
    return HttpResponse.json({ ok: true });
  }),

  http.get("/auth/users", async () => {
    await db.ensureDefaultUsers();
    return HttpResponse.json(db.listSafeUsers());
  }),

  http.get("/player/me", ({ request }) => {
    const userId = requireAuth(request);
    if (userId instanceof HttpResponse) return userId;
    const p = db.getPlayer(userId);
    if (!p) return HttpResponse.json({ error: "no player" }, { status: 404 });
    return HttpResponse.json(p);
  }),

  http.get("/inventory", ({ request }) => {
    const userId = requireAuth(request);
    if (userId instanceof HttpResponse) return userId;
    const inventory = db.getInventory(userId);
    if (!inventory) return HttpResponse.json({ error: "no inventory" }, { status: 404 });
    return HttpResponse.json(inventory);
  }),

  http.get("/quests", ({ request }) => {
    const userId = requireAuth(request);
    if (userId instanceof HttpResponse) return userId;
    return HttpResponse.json(db.getQuests(userId));
  }),

  http.post("/quests/claim", async ({ request }) => {
    const userId = requireAuth(request);
    if (userId instanceof HttpResponse) return userId;
    const body = (await request.json()) as { questId?: string };
    if (!body.questId) {
      return HttpResponse.json({ error: "missing questId" }, { status: 400 });
    }
    const quests = db.claimQuest(userId, body.questId);
    return HttpResponse.json(quests);
  }),

  http.post("/packs/open", ({ request }) => {
    const userId = requireAuth(request);
    if (userId instanceof HttpResponse) return userId;
    const _bodyPromise = request.json().catch(() => null);
    const resp = db.openPack(userId);
    return HttpResponse.json(resp);
  }),
];
