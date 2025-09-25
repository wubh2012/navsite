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

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/wubh2012/navsite)

## 项目结构

```
├── public/                          # 静态资源目录
│   ├── css/
│   │   └── style.css               # 主样式文件，包含响应式设计和暗黑模式
│   ├── js/
│   │   └── app.js                  # 前端主逻辑，包含搜索、主题切换、手势支持
│   ├── img/
│   │   └── avatar.svg              # 用户头像图标
│   └── index.html                  # 主页面，响应式布局
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

### v1.0.0 (当前版本)

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

### 计划功能

- 🔄 随机切换背景图片
- 🔄 更多主题选项（霓虹主题变体）
- 🔄 拖拽排序功能

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
