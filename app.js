(() => {
  // ===== Bmob 配置（已为你填好） =====
  const BMOB = {
    appId: "c9b5db9622cd76fa66d1aa41da9214f9",
    apiKey: "7296a015d22fdb5acb6dc805d370a0b6",
  };

  const BMOB_BASE = "https://api.bmob.cn/1";

  function bmobHeaders() {
    return {
      "X-Bmob-Application-Id": BMOB.appId,
      "X-Bmob-REST-API-Key": BMOB.apiKey,
      "Content-Type": "application/json",
    };
  }

  function safeTrim(v) {
    return String(v ?? "").trim();
  }

  function nowIso() {
    return new Date().toISOString();
  }

  function formatDate(iso) {
    try {
      const d = new Date(iso);
      if (Number.isNaN(d.getTime())) return safeTrim(iso);
      return d.toLocaleString("zh-CN", { hour12: false });
    } catch {
      return safeTrim(iso);
    }
  }

  async function loadMessagesOnline({ limit = 100 } = {}) {
    const url = `${BMOB_BASE}/classes/Message?order=-createdAt&limit=${encodeURIComponent(
      Math.min(200, Math.max(1, Number(limit) || 100))
    )}`;
    const res = await fetch(url, {
      method: "GET",
      headers: bmobHeaders(),
    });
    if (!res.ok) throw new Error("bmob_load_failed");
    const data = await res.json();
    const results = Array.isArray(data.results) ? data.results : [];
    return results.map((r) => ({
      id: r.objectId || "",
      major: safeTrim(r.major),
      studentId: safeTrim(r.studentId),
      avatarUrl: safeTrim(r.avatarUrl),
      content: safeTrim(r.content),
      createdAt: r.createdAt ? r.createdAt : nowIso(),
    }));
  }

  async function addMessageOnline({ major, studentId, content, avatarDataUrl }) {
    const body = {
      major: safeTrim(major),
      studentId: safeTrim(studentId),
      content: safeTrim(content),
      avatarUrl: safeTrim(avatarDataUrl),
    };
    const res = await fetch(`${BMOB_BASE}/classes/Message`, {
      method: "POST",
      headers: bmobHeaders(),
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error("bmob_save_failed");
  }

  function defaultAvatarSvgDataUrl() {
    const svg =
      `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">` +
      `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">` +
      `<stop offset="0" stop-color="#93c5fd"/><stop offset="1" stop-color="#22c55e"/>` +
      `</linearGradient></defs>` +
      `<rect width="96" height="96" rx="48" fill="url(#g)"/>` +
      `<circle cx="48" cy="40" r="16" fill="rgba(255,255,255,0.85)"/>` +
      `<path d="M20 82c6-16 20-24 28-24s22 8 28 24" fill="rgba(255,255,255,0.85)"/>` +
      `</svg>`;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  }

  function createCard(msg) {
    const card = document.createElement("div");
    card.className = "card";

    const head = document.createElement("div");
    head.className = "card-head";

    const avatar = document.createElement("img");
    avatar.className = "avatar";
    avatar.alt = "头像";
    avatar.src = msg.avatarUrl || defaultAvatarSvgDataUrl();
    head.appendChild(avatar);

    const meta = document.createElement("div");
    meta.className = "meta";

    const line1 = document.createElement("div");
    line1.className = "line1";

    const badge = document.createElement("span");
    badge.className = "badge";
    badge.textContent = msg.major || "未填写专业";

    const sid = document.createElement("span");
    sid.style.fontWeight = "800";
    sid.style.color = "#0f172a";
    sid.textContent = msg.studentId ? `学号 ${msg.studentId}` : "未填写学号";

    line1.appendChild(badge);
    line1.appendChild(sid);

    const line2 = document.createElement("div");
    line2.className = "line2";
    line2.textContent = `投稿时间：${formatDate(msg.createdAt)}`;

    meta.appendChild(line1);
    meta.appendChild(line2);

    head.appendChild(meta);

    const content = document.createElement("div");
    content.className = "content";
    content.textContent = msg.content || "";

    card.appendChild(head);
    card.appendChild(content);

    return card;
  }

  async function renderMessages({ mountId }) {
    const mount = document.getElementById(mountId);
    if (!mount) return;
    mount.innerHTML = `<div class="empty-state"><div class="empty-title">正在加载...</div><div class="empty-sub">正在从云端获取留言。</div></div>`;

    try {
      const list = await loadMessagesOnline({ limit: 100 });
      mount.innerHTML = "";

      if (!list.length) {
        const empty = document.createElement("div");
        empty.className = "empty-state";
        empty.innerHTML = `<div class="empty-title">还没有留言</div><div class="empty-sub">去“如何投稿”写下你的第一条毕业寄语吧。</div>`;
        mount.appendChild(empty);
        return;
      }

      for (const msg of list) mount.appendChild(createCard(msg));
    } catch (e) {
      console.error(e);
      mount.innerHTML = `<div class="empty-state"><div class="empty-title">加载失败</div><div class="empty-sub">请检查 LeanCloud 配置或稍后刷新重试。</div></div>`;
    }
  }

  async function renderLatest({ mountId, limit = 5 }) {
    const mount = document.getElementById(mountId);
    if (!mount) return;
    mount.innerHTML = `<div class="empty-state"><div class="empty-title">正在加载...</div><div class="empty-sub">正在从云端获取留言。</div></div>`;

    try {
      const list = await loadMessagesOnline({ limit: Math.max(1, Number(limit) || 5) });
      mount.innerHTML = "";

      if (!list.length) {
        const empty = document.createElement("div");
        empty.className = "empty-state";
        empty.innerHTML = `<div class="empty-title">还没有留言</div><div class="empty-sub">去“如何投稿”写下你的第一条毕业寄语吧。</div>`;
        mount.appendChild(empty);
        return;
      }

      for (const msg of list) mount.appendChild(createCard(msg));
    } catch (e) {
      console.error(e);
      mount.innerHTML = `<div class="empty-state"><div class="empty-title">加载失败</div><div class="empty-sub">请检查 LeanCloud 配置或稍后刷新重试。</div></div>`;
    }
  }

  function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("read_failed"));
      reader.readAsDataURL(file);
    });
  }

  async function initSubmitPage() {
    const form1 = document.getElementById("step1");
    const form2 = document.getElementById("step2");
    if (!form1 || !form2) return;

    const step1Tag = document.getElementById("stepTag1");
    const step2Tag = document.getElementById("stepTag2");

    const majorEl = document.getElementById("major");
    const studentIdEl = document.getElementById("studentId");
    const avatarEl = document.getElementById("avatar");
    const avatarPreview = document.getElementById("avatarPreview");
    const nextBtn = document.getElementById("nextBtn");

    const contentEl = document.getElementById("content");
    const backBtn = document.getElementById("backBtn");
    const submitBtn = document.getElementById("submitBtn");

    let avatarDataUrl = "";

    function setStep(step) {
      const s1 = step === 1;
      form1.style.display = s1 ? "" : "none";
      form2.style.display = s1 ? "none" : "";
      if (step1Tag) step1Tag.classList.toggle("active", s1);
      if (step2Tag) step2Tag.classList.toggle("active", !s1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    setStep(1);
    if (avatarPreview) avatarPreview.src = defaultAvatarSvgDataUrl();

    avatarEl?.addEventListener("change", async () => {
      const file = avatarEl.files && avatarEl.files[0];
      if (!file) return;
      if (!file.type.startsWith("image/")) {
        alert("请选择图片文件作为头像。");
        avatarEl.value = "";
        return;
      }
      if (file.size > 800 * 1024) {
        alert("头像图片建议小于 800KB（否则上传会比较慢）。");
      }
      try {
        avatarDataUrl = await readFileAsDataUrl(file);
        if (avatarPreview) avatarPreview.src = avatarDataUrl;
      } catch {
        alert("读取头像失败，请换一张图片重试。");
      }
    });

    nextBtn?.addEventListener("click", () => {
      const major = safeTrim(majorEl?.value);
      const studentId = safeTrim(studentIdEl?.value);
      if (!major) {
        alert("请先填写专业。");
        majorEl?.focus();
        return;
      }
      if (!studentId) {
        alert("请先填写学号。");
        studentIdEl?.focus();
        return;
      }
      setStep(2);
      contentEl?.focus();
    });

    backBtn?.addEventListener("click", () => setStep(1));

    submitBtn?.addEventListener("click", async () => {
      const major = safeTrim(majorEl?.value);
      const studentId = safeTrim(studentIdEl?.value);
      const content = safeTrim(contentEl?.value);

      if (!content) {
        alert("请先填写留言内容。");
        contentEl?.focus();
        return;
      }

      try {
        submitBtn.disabled = true;
        submitBtn.textContent = "正在提交...";
        await addMessageOnline({ major, studentId, content, avatarDataUrl });
      } catch (e) {
        console.error(e);
        alert("提交失败：请检查网络或 LeanCloud 配置（appId/appKey/serverURL），然后重试。");
        return;
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "提交留言";
      }

      window.location.href = "messages.html";
    });
  }

  function initMessagesPage() {
    const mount = document.getElementById("messages");
    if (!mount) return;

    renderMessages({ mountId: "messages" });
  }

  window.App = {
    renderLatest,
    renderMessages,
    initSubmitPage,
    initMessagesPage,
  };
})();

