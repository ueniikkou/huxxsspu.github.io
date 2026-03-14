<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>如何投稿 - 毕业留言分享站</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <div class="container">
    <div class="topbar">
      <a href="index.html">← 返回首页</a>
      <a href="messages.html">查看所有留言 →</a>
    </div>

    <h1>如何投稿</h1>
    <p class="intro" style="margin-bottom: 10px;">
      按下面两步填写即可完成投稿：先完善信息，再写下你的毕业留言。
    </p>

    <div class="stepper" aria-label="投稿步骤">
      <div id="stepTag1" class="step active">第 1 步：信息</div>
      <div id="stepTag2" class="step">第 2 步：留言</div>
    </div>

    <div class="form">
      <section id="step1">
        <div class="row">
          <div class="field">
            <label class="label" for="major">专业</label>
            <input id="major" type="text" placeholder="例如：计算机科学与技术" autocomplete="off" />
            <div class="hint">建议填写完整专业名称，便于学弟学妹检索。</div>
          </div>
          <div class="field">
            <label class="label" for="studentId">学号</label>
            <input id="studentId" type="text" placeholder="例如：2020xxxxxx" autocomplete="off" />
            <div class="hint">仅用于展示你的届别/身份标识，不做校验。</div>
          </div>
        </div>

        <div class="field">
          <label class="label" for="avatar">头像（可上传一张照片）</label>
          <input id="avatar" type="file" accept="image/*" />
          <div class="hint">头像会上传到云端并展示给所有人；建议小于 800KB 以提升上传速度。</div>
        </div>

        <div class="field center">
          <img id="avatarPreview" class="avatar" alt="头像预览" style="width: 72px; height: 72px;" />
          <div class="hint">预览仅用于确认效果；不上传也可以投稿。</div>
        </div>

        <div class="actions">
          <button id="nextBtn" class="btn btn-like" type="button">确定，下一步</button>
        </div>
      </section>

      <section id="step2" style="display:none;">
        <div class="field">
          <label class="label" for="content">留言内容</label>
          <textarea id="content" placeholder="写给学弟学妹的一句话、实习/考研经验、想说但没说出口的话……"></textarea>
          <div class="hint">支持换行；提交后会自动出现在“查看所有留言”页面。</div>
        </div>

        <div class="actions">
          <button id="backBtn" class="btn btn-like btn-secondary" type="button">上一步</button>
          <button id="submitBtn" class="btn btn-like" type="button">提交留言</button>
        </div>
      </section>
    </div>

    <footer class="footer" style="margin-top: 34px;">
      提示：提交后会保存到在线数据库，所有人打开网站都能看到。
    </footer>
  </div>

  <script src="app.js"></script>
  <script>
    window.App?.initSubmitPage?.();
  </script>
</body>
</html>
