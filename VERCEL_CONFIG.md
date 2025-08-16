# Vercel Framework Settings 配置指南

根据你的项目结构和需求，以下是Vercel部署的Framework Settings推荐配置：

## 基础配置

### Framework Preset
选择：**Other**

> 因为这是一个自定义的Express应用，没有使用Vercel预设的框架模板。

### Build Command
保持默认值：`echo "No build required"`

> 你的项目是纯Node.js应用，不需要额外的构建步骤。

### Output Directory
保持默认值：`.`

> 应用直接从根目录运行，无需指定特定的输出目录。

### Install Command
保持默认值：`npm install`

> 用于安装项目的所有依赖包。

### Development Command
设置为：`npm run dev`

> 这将使用nodemon启动开发服务器，方便本地开发和调试。

## 高级配置

### 环境变量
在Vercel控制台中，你需要设置以下环境变量：
- `APP_ID`: 飞书应用ID
- `APP_SECRET`: 飞书应用密钥
- `APP_TOKEN`: 飞书多维表格应用Token
- `TABLE_ID`: 飞书多维表格ID

### vercel.json 配置
我们已经更新了vercel.json文件，确保正确部署：
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/server.js"
    }
  ],
  "env": {
    "APP_ID": "@app_id",
    "APP_SECRET": "@app_secret",
    "APP_TOKEN": "@app_token",
    "TABLE_ID": "@table_id"
  }
}
```

## 部署步骤

1. 确保你已经安装了Vercel CLI：
   ```bash
   npm install -g vercel
   ```

2. 登录Vercel账户：
   ```bash
   vercel login
   ```

3. 部署项目：
   ```bash
   vercel --prod
   ```

4. 部署完成后，Vercel会提供一个URL，你可以通过该URL访问你的应用。

## 常见问题

1. **404错误**：确保vercel.json中的入口文件配置正确，与项目实际结构一致。

2. **环境变量问题**：检查Vercel控制台中是否正确设置了所有必需的环境变量。

3. **依赖安装问题**：如果依赖安装失败，尝试在本地运行`npm install`，确保package.json文件没有问题。

如果遇到其他问题，可以查看Vercel部署日志获取详细错误信息。