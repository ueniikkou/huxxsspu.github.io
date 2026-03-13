/**
 * Cloudflare Worker API + D1 (SQLite)
 *
 * Endpoints:
 * - GET  /api/messages?limit=100
 * - POST /api/messages
 */

function json(data, init = {}) {
  const headers = new Headers(init.headers || {});
  headers.set("Content-Type", "application/json; charset=utf-8");
  return new Response(JSON.stringify(data), { ...init, headers });
}

function withCors(req, res) {
  const origin = req.headers.get("Origin") || "*";
  const h = new Headers(res.headers);
  h.set("Access-Control-Allow-Origin", origin);
  h.set("Vary", "Origin");
  h.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  h.set("Access-Control-Allow-Headers", "Content-Type");
  h.set("Access-Control-Max-Age", "86400");
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers: h });
}

function isDataUrlImage(s) {
  if (!s) return true;
  return /^data:image\/[a-zA-Z0-9.+-]+;base64,[a-zA-Z0-9+/=\s]+$/.test(s);
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return withCors(request, new Response(null, { status: 204 }));
    }

    const url = new URL(request.url);
    if (!url.pathname.startsWith("/api/")) {
      return withCors(request, json({ ok: false, error: "not_found" }, { status: 404 }));
    }

    try {
      if (url.pathname === "/api/messages" && request.method === "GET") {
        const limitRaw = url.searchParams.get("limit") || "100";
        const limit = Math.min(200, Math.max(1, Number(limitRaw) || 100));

        const rs = await env.DB.prepare(
          `SELECT id, major, student_id, content, avatar_data_url, created_at
           FROM messages
           ORDER BY created_at DESC
           LIMIT ?1`
        )
          .bind(limit)
          .all();

        const messages = (rs.results || []).map((r) => ({
          id: String(r.id),
          major: r.major,
          studentId: r.student_id,
          content: r.content,
          avatarUrl: r.avatar_data_url,
          createdAt: r.created_at,
        }));

        return withCors(request, json({ ok: true, messages }));
      }

      if (url.pathname === "/api/messages" && request.method === "POST") {
        const ct = request.headers.get("Content-Type") || "";
        if (!ct.includes("application/json")) {
          return withCors(request, json({ ok: false, error: "content_type_must_be_json" }, { status: 415 }));
        }

        const body = await request.json().catch(() => null);
        const major = String(body?.major || "").trim();
        const studentId = String(body?.studentId || "").trim();
        const content = String(body?.content || "").trim();
        const avatarDataUrl = String(body?.avatarDataUrl || "").trim();

        if (!major) return withCors(request, json({ ok: false, error: "major_required" }, { status: 400 }));
        if (!studentId) return withCors(request, json({ ok: false, error: "studentId_required" }, { status: 400 }));
        if (!content) return withCors(request, json({ ok: false, error: "content_required" }, { status: 400 }));

        if (major.length > 60) return withCors(request, json({ ok: false, error: "major_too_long" }, { status: 400 }));
        if (studentId.length > 30)
          return withCors(request, json({ ok: false, error: "studentId_too_long" }, { status: 400 }));
        if (content.length > 2000)
          return withCors(request, json({ ok: false, error: "content_too_long" }, { status: 400 }));

        if (!isDataUrlImage(avatarDataUrl)) {
          return withCors(request, json({ ok: false, error: "avatar_invalid" }, { status: 400 }));
        }
        // 限制头像大小（base64 文本长度），避免 D1 存爆：大约 600KB 左右
        if (avatarDataUrl.length > 900_000) {
          return withCors(request, json({ ok: false, error: "avatar_too_large" }, { status: 400 }));
        }

        const createdAt = new Date().toISOString();
        const stmt = await env.DB.prepare(
          `INSERT INTO messages(major, student_id, content, avatar_data_url, created_at)
           VALUES(?1, ?2, ?3, ?4, ?5)`
        )
          .bind(major, studentId, content, avatarDataUrl, createdAt)
          .run();

        return withCors(
          request,
          json({
            ok: true,
            id: String(stmt.meta?.last_row_id || ""),
            createdAt,
          })
        );
      }

      return withCors(request, json({ ok: false, error: "not_found" }, { status: 404 }));
    } catch (e) {
      console.error(e);
      return withCors(request, json({ ok: false, error: "server_error" }, { status: 500 }));
    }
  },
};

