# Vercel部署步骤指南

以下是将项目部署到Vercel的详细步骤：

## 1. 准备工作
确保你已完成以下准备：
- 已安装Node.js和npm
- 已注册Vercel账号
- 已在本地安装Vercel CLI（通过`npm i -g vercel`安装）
- 已配置项目所需的环境变量（参考`DEPLOY_WITH_ENV_VARS.md`）

## 2. 安装依赖
在项目根目录执行以下命令安装依赖：
```bash
npm install
```

## 3. 检查配置文件
确保`vercel.json`文件已正确配置：
- 入口文件已设置为`/server.js`
- 环境变量引用格式为`${APP_ID}`等（而非`@app_id`）

## 4. 执行部署命令
有两种方式部署项目：

### 方式1：使用部署命令并临时设置环境变量
```bash
vercel --prod --env APP_ID=your_app_id --env APP_SECRET=your_app_secret --env APP_TOKEN=your_app_token --env TABLE_ID=your_table_id
```
替换命令中的`your_app_id`等为你实际的环境变量值。

### 方式2：先在Vercel控制台设置环境变量，再部署
1. 登录Vercel控制台
2. 选择你的项目
3. 进入"Settings" > "Environment Variables"
4. 添加所需的环境变量（APP_ID、APP_SECRET、APP_TOKEN、TABLE_ID）
5. 执行部署命令：
```bash
vercel --prod
```

## 5. 验证部署结果
部署完成后，Vercel会提供一个URL。访问该URL，确保：
- 主页能够正常加载
- `/api/data`接口能够返回正确的数据

## 6. 查看部署日志
如果部署过程中出现问题，可以通过以下命令查看部署日志：
```bash
vercel logs
```

## 7. 常见问题
- 如果遇到环境变量相关错误，请参考`DEPLOY_WITH_ENV_VARS.md`
- 如果遇到404错误，请检查`vercel.json`中的路由配置
- 如果遇到应用无法启动的错误，请检查`server.js`文件是否存在语法错误

祝你部署顺利！