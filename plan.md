# 陈律师纽约律师事务所网站计划

## 实现方式

这是一个带管理员后台和持久化咨询记录的一页式中文律师品牌网站。采用 Node HTTP 服务器，前端由 `index.html`、`styles.css` 与 `script.js` 组成，后台由 `admin.html`、`admin.css` 与 `admin.js` 组成，运行在 Webdev 配置的 3000 端口。页面通过锚点导航组织内容，表单写入托管 MySQL；管理员登录后台后可查看咨询记录、修改 WhatsApp / Telegram 跳转链接，并修改律师姓名、事务所名称、地址、电话、邮箱与首屏文案。

## 设计方向

- **Design Movement**：现代编辑式法律品牌（editorial legal identity），将法律行业的秩序感与高端杂志的留白结合。
- **Core Principles**：克制、可信、清晰、以人为本。用大字号标题建立权威感，用细线和编号建立秩序，用温暖的纸张色避免冷硬。
- **Color Philosophy**：深墨蓝表达判断力与可靠性；骨白底色营造长期阅读的舒适感；黄铜色作为签名色，用于编号、细节和行动提示，传递专业但不张扬的质感。
- **Layout Paradigm**：以一条贯穿页面的垂直编号线为骨架，内容采用不对称杂志式分栏；首屏用大面积图片与标题叠合，后续用左右错位的章节叙事代替传统卡片网格。
- **Signature Elements**：章节编号 `01—03`、细黄铜分隔线、右下角浮动预约按钮。
- **Interaction Philosophy**：所有交互都帮助访客更快建立信任或发起咨询；导航平滑滚动，移动端菜单克制展开，表单提交后明确反馈。
- **Animation**：页面首次载入时标题与装饰线从下方轻微上浮；滚动进入章节时淡入，持续时间短、位移小；不使用夸张弹跳，保持法律品牌的稳定感。
- **Typography System**：中文正文使用系统无衬线字体，标题使用 `Noto Serif SC` 与本地衬线回退，英文辅助信息采用 `Inter` / `Arial`；标题大而轻，正文控制在 1.8 倍行高。
- **Brand Essence**：为跨境家庭、企业与个人提供稳健、清晰、值得托付的纽约法律服务。个性：沉着、清晰、坚定。
- **Brand Voice**：标题直接而有分寸，例如“把复杂的事，交给有判断力的人。”；CTA 使用“预约一次初步沟通”而不是泛化的“立即开始”。
- **Wordmark & Logo**：以“陈”字印章方框结合细长的法槌线稿，形成一个可单独识别的金色印记；页面先使用 CSS 绘制印章方框，避免默认文字 Logo。
- **Signature Brand Color**：`#B68B55` 黄铜金。

## 页面结构

- `index.html`：导航、首屏、教育背景、执业经验、服务承诺、联系表单、免责声明和页脚。
- `styles.css`：颜色变量、编辑式布局、响应式断点、进入视口动画与移动端菜单状态。
- `script.js`：移动菜单、平滑锚点、IntersectionObserver 淡入、联系链接读取、表单提交与成功态。
- `server.js`：静态文件服务器，以及管理员登录、站点设置、咨询提交和咨询查询 API；使用托管 MySQL 初始化 `site_settings` 与 `inquiries` 表。
- `admin.html` / `admin.css` / `admin.js`：受保护的后台页面，提供链接配置和咨询记录查看。
- `public/images/james-joseph-benjamin.jpg`：用户提供的 James Joseph Benjamin Jr. 律师照片。
- `public/manus-routes.json`：声明首页路由。
- `app.config.ts`：项目 Logo 元数据。

## 后台与数据

后台账户名为 `admin`，密码通过 `ADMIN_PASSWORD` 安全环境变量读取，不写入源代码。数据库包含 `site_settings` 和 `inquiries` 两张表。公开前台通过 `/api/site-settings` 读取两个联系入口；咨询表单通过 `/api/contact` 写入姓名、邮箱、电话与留言；后台接口要求登录会话后才允许读取咨询记录或更新设置。

## 资产策略

首屏和内容图使用参考站点提供的公开视觉素材 URL，作为风格参考下的临时品牌素材；页面通过深色遮罩、裁切和叠加文字完成独立的视觉编排。后续可替换为律师本人授权肖像和事务所实拍图。
