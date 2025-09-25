# 导航网站项目

## 项目介绍

这是一个基于飞书多维表格数据的现代化导航网站，通过调用飞书API获取表格数据，生成一个美观且功能丰富的导航页面。网站采用霓虹主题风格设计，具有现代化的UI和流畅的交互体验，支持多种设备访问，并提供个性化的用户设置。

## 功能特点

### 核心功能

- **数据源管理**：从飞书多维表格获取导航数据，支持API失败时的模拟数据降级
- **分类展示**：按分类展示导航链接，支持动态分类菜单生成
- **智能图标**：自动获取网站favicon，失败时生成文字图标作为备用
- **数据缓存**：5分钟数据缓存机制，减少API调用频率
- **霓虹主题**：现代化的霓虹主题设计，提供视觉吸引力

### 用户体验

- **响应式设计**：完美适配桌面端和移动端，移动端专门优化
- **实时时间**：显示当前时间、日期和农历信息
- **暗黑模式**：支持自动跟随系统偏好或手动切换，本地存储用户偏好
- **移动端搜索**：全功能搜索界面，支持关键词搜索和热门建议
- **触摸手势**：移动端支持左右滑动切换分类，触摸反馈

### 移动端特性

- **汉堡菜单**：移动端侧边栏菜单，支持手势操作
- **搜索功能**：专门的移动端搜索界面，支持实时搜索和结果高亮
- **触摸优化**：涟漪效果、震动反馈（如设备支持）
- **手势导航**：左右滑动切换分类

### PWA 特性

- **离线访问**：支持离线访问，断网状态下仍可使用基本功能
- **桌面安装**：可安装到桌面、手机主屏幕，提供原生应用体验
- **智能缓存**：自动缓存静态资源和API数据，提升加载速度
- **后台更新**：自动检测新版本并提示用户更新
- **推送通知**：支持推送通知功能（预留接口）
- **跨平台支持**：支持 Android、iOS、Windows、macOS 等平台


## 技术栈

### 后端技术

- **Node.js + Express**：服务器框架
- **axios**：HTTP客户端，用于调用飞书API
- **dotenv**：环境变量管理

### 前端技术

- **原生JavaScript**：无框架依赖，轻量高效
- **CSS3**：现代CSS特性，支持CSS变量和动画
- **Bootstrap Icons**：图标库
- **响应式设计**：移动端优先的设计理念

### API集成

- **飞书开放平台API**：多维表格数据获取
- **Google Favicon API**：自动获取网站图标

### 部署支持

- **Vercel**：已配置vercel.json，支持一键部署
- **PWA 支持**：满足 Progressive Web App 标准，支持离线访问和桌面安装

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/wubh2012/navsite)

## 项目结构

```
├── public/                          # 静态资源目录
│   ├── css/
│   │   └── style.css               # 主样式文件，包含响应式设计和暗黑模式
│   ├── js/
│   │   └── app.js                  # 前端主逻辑，包含搜索、主题切换、手势支持、PWA功能
│   ├── img/
│   │   ├── avatar.svg              # 用户头像图标
│   │   ├── favicon.ico             # 网站图标
│   │   ├── icons/                  # PWA 图标资源目录
│   │   │   ├── icon-72x72.png      # 多尺寸 PWA 图标
│   │   │   ├── icon-192x192.png
│   │   │   └── ...
│   │   └── screenshots/            # PWA 截图目录
│   ├── manifest.json               # PWA Manifest 文件
│   ├── sw.js                       # Service Worker 脚本
│   ├── browserconfig.xml           # Microsoft 平台配置
│   └── index.html                  # 主页面，响应式布局，包含PWA支持
├── doc/                            # 文档目录
├── specs/                          # 规格说明
├── .env                            # 环境变量配置（不应提交到版本控制）
├── .env.example                    # 环境变量示例
├── .gitignore                      # Git忽略文件配置
├── package.json                    # 项目依赖配置
├── server.js                       # 服务器入口文件，包含飞书API集成
├── vercel.json                     # Vercel部署配置
└── README.md                       # 项目说明文档
```

## PWA 功能详细说明

本项目已完整集成 Progressive Web App (PWA) 功能，提供类似原生应用的体验。

### 主要特性

#### 📱 桌面安装
- 支持在 Windows、macOS、Android、iOS 等平台安装
- 安装后以独立窗口运行，无浏览器地址栏
- 可固定到任务栏、Dock 或手机主屏幕

#### 📶 离线访问
- 首次访问后自动缓存所有关键资源
- 断网状态下仍可正常使用基本功能
- API 请求失败时自动使用缓存数据

#### ⚡ 智能缓存
- **静态资源**：缓存优先策略，后台更新
- **API 数据**：网络优先，缓存降级
- **版本管理**：自动清理旧版本缓存

#### 🔄 自动更新
- 新版本发布时自动检测
- 友好的更新提示 UI
- 用户可选择立即更新或稍后更新

### 安装指南

#### Chrome/Edge 浏览器
1. 访问网站
2. 点击地址栏右侧的安装图标 📥
3. 点击“安装”按钮
4. 应用将自动添加到桌面或应用列表

#### 手机浏览器
- **Android Chrome**：点击菜单 → “添加到主屏幕”
- **iOS Safari**：点击分享按钮 📤 → “添加到主屏幕”

### 技术实现

- **Manifest 文件**：[manifest.json](./public/manifest.json) - 应用元信息和配置
- **Service Worker**：[sw.js](./public/sw.js) - 缓存策略和离线功能
- **图标资源**：[icons/](./public/img/icons/) - 多尺寸应用图标
- **浏览器配置**：[browserconfig.xml](./public/browserconfig.xml) - Microsoft 平台支持

### 性能优化

- 首次访问后，再次打开速度提升 80%+
- 离线状态下基本功能可用
- 自动前端缓存，减少服务器负载
- 并行缓存更新，不影响用户体验

### 测试工具

可使用以下工具验证 PWA 功能：

1. **Chrome DevTools**
   - Application 面板 → Manifest
   - Application 面板 → Service Workers
   - Lighthouse 审计 → PWA

2. **第三方工具**
   - [PWA Builder](https://www.pwabuilder.com/) - Microsoft PWA 测试工具
   - [PWA Testing Tool](https://www.webpagetest.org/) - 性能测试

### 注意事项

- PWA 功能需要 HTTPS 环境（本地开发使用 localhost 即可）
- 首次访问需联网加载所有资源
- 不同浏览器和平台的 PWA 支持程度有差异
- iOS Safari 对 PWA 支持相对有限，但基本功能可用

## 本地开发指南

### 前置条件

- Node.js 14.0 或更高版本
- 飞书开发者账号和创建应用（需配置多维表格读取权限），参考[创建飞书应用](./doc/创建飞书应用.md)
- 创建飞书多维表格，参考[创建飞书多维表格](./doc/飞书多维表格设置.md)

### 开发步骤

1. 克隆或下载项目代码

   ```bash
   git clone https://github.com/wubh2012/navsite.git
   cd navsite
   ```
2. 安装依赖

   ```bash
   npm install
   ```
3. 配置环境变量

   - 复制`.env.example` 为`.env`
   - 填入你的飞书应用ID(APP_ID)、应用密钥(APP_SECRET)和多维表格相关信息 AppToken 和 TableID
4. 启动项目

   ```
   npm run dev
   ```
5. 打开浏览器，访问 `http://localhost:3000`

### 数据降级机制

当飞书API不可用时，系统会自动使用内置的模拟数据，确保程序正常运行。

## 部署步骤

### Vercel 部署
项目已配置 `vercel.json`

1. 将代码推送到 GitHub
2. 在 Vercel 中导入项目
3. 配置环境变量（APP_ID、APP_SECRET、APP_TOKEN、TABLE_ID）
4. 部署完成

### 环境变量配置

```bash
APP_ID=your_feishu_app_id  # 飞书应用ID
APP_SECRET=your_feishu_app_secret  # 飞书应用Secret
APP_TOKEN=your_bitable_app_token  # 飞书多维表格Token
TABLE_ID=your_table_id  # 飞书多维表格ID
PORT=3000    # 服务器端口，默认3000
```

## 故障排除

### 常见问题

1. **飞书API连接失败**

   - 检查环境变量配置是否正确
   - 确认飞书应用权限设置
   - 查看控制台错误信息
2. **图标显示异常**

   - 网站favicon获取失败时会自动显示文字图标
   - Google Favicon 提供的服务有时无法正确获取
3. **暗黑模式不生效**

   - 清除浏览器缓存和本地存储
   - 检查CSS变量是否正确定义

## 更新日志

### v1.2.0 (当前版本)

- ✅ **PWA 支持**：完整的 Progressive Web App 功能
  - 离线访问支持，断网状态下仍可使用
  - 桌面安装支持，可安装为原生应用
  - 智能缓存策略，提升加载速度
  - 自动更新机制，新版本发布时智能提示
  - 跨平台支持（Android、iOS、Windows、macOS）
- ✅ **Service Worker**：实现后台缓存和离线功能
- ✅ **Web App Manifest**：完整的应用元信息配置
- ✅ **多尺寸图标**：支持不同设备的图标需求

### v1.0.0

- ✅ 基础导航功能
- ✅ 飞书多维表格集成
- ✅ 响应式设计
- ✅ 暗黑模式支持
- ✅ 移动端搜索功能
- ✅ 触摸手势支持
- ✅ 农历日期显示
- ✅ 数据缓存机制
- ✅ Vercel部署支持
- ✅ 霓虹主题风格
- ✅ 更多主题选项（霓虹主题变体）

### 计划功能

- 🔄 随机切换背景图片
- 🔄 拖拽排序功能
- 🔄 推送通知功能
- 🔄 更多 PWA 特性优化

## 贡献指南

欢迎提交Issue和Pull Request来改进这个项目！

### 开发流程

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

### 代码规范

- 使用2空格缩进
- 遵循现有的代码风格
- 添加必要的注释
- 确保移动端兼容性

## 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 联系方式

如有问题或建议，请通过以下方式联系：

- 提交 GitHub Issue
- 发送邮件至项目维护者

---

**感谢使用导航网站项目！** 🚀
