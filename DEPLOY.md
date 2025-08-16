# Vercel 部署指南

## 解决 404 问题的方法

本项目已经修复了 Vercel 部署后显示 404 的问题。

### 主要修改

1. **API 文件格式**：将 `api/index.js` 修改为兼容 Vercel 无服务器函数的格式
2. **添加依赖**：添加了 `serverless-http` 依赖
3. **路由配置**：优化了 `vercel.json` 的路由配置

### 部署步骤

1. **安装依赖**（已完成）
   ```bash
   npm install
   ```

2. **配置环境变量**
   在 Vercel 控制台设置以下环境变量：
   - `APP_ID`
   - `APP_SECRET`
   - `APP_TOKEN`
   - `TABLE_ID`

3. **部署到 Vercel**
   ```bash
   vercel --prod
   ```

### 本地测试

在本地运行项目：
```bash
npm start
```

或者使用开发模式：
```bash
npm run dev
```

### 验证部署

部署完成后，访问以下地址验证：
- 根路径 `/` - 应该显示导航网站主页
- API 路径 `/api/data` - 应该返回飞书多维表格数据

如果仍然遇到 404 错误，请检查：
1. Vercel 控制台中的环境变量是否正确设置
2. 部署日志是否有错误信息
3. 确认所有依赖都已正确安装