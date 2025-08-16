# 在Vercel中设置Secrets指南

## 问题分析

错误信息 `Error: Environment Variable "APP_ID" references Secret "app_id", which does not exist.` 表明你的Vercel项目中缺少必要的Secrets配置。

在`vercel.json`文件中，环境变量配置如下：
```json
"env": {
  "APP_ID": "@app_id",
  "APP_SECRET": "@app_secret",
  "APP_TOKEN": "@app_token",
  "TABLE_ID": "@table_id"
}
```

这里的`@app_id`格式表示引用Vercel Secrets中名为`app_id`的密钥，但这些密钥尚未在你的Vercel项目中创建。

## 解决步骤

### 1. 登录Vercel控制台

访问 [Vercel控制台](https://vercel.com/dashboard) 并登录你的账户。

### 2. 选择你的项目

从项目列表中选择你要配置的项目。

### 3. 进入项目设置

点击项目页面顶部的`Settings`选项卡。

### 4. 配置Secrets

在左侧导航栏中，选择`Environment Variables`选项。

### 5. 添加必要的Secrets

点击`Add New Variable`按钮，添加以下Secrets：

| 变量名称 | 引用名称 | 描述 |
|---------|---------|-----|
| app_id | APP_ID | 飞书应用ID |
| app_secret | APP_SECRET | 飞书应用密钥 |
| app_token | APP_TOKEN | 飞书多维表格应用Token |
| table_id | TABLE_ID | 飞书多维表格ID |

#### 添加步骤：
1. 在`Key`字段中输入Secret名称（如`app_id`）
2. 在`Value`字段中输入对应的Secret值
3. 确保勾选`Encrypt`选项以加密存储Secret
4. 点击`Add`按钮保存

### 6. 重新部署项目

添加完所有必要的Secrets后，重新部署你的项目：

```bash
vercel --prod
```

## 验证配置

部署完成后，你可以通过访问应用来验证配置是否正确。如果配置正确，应用应该能够正常连接到飞书API并获取数据。

## 注意事项

1. Secrets一旦设置，只能查看其名称，无法查看具体值，因此请确保妥善保管好这些值。

2. 如果你需要更新Secrets值，可以在`Environment Variables`页面找到对应的Secret并点击`Edit`按钮进行修改。

3. 如果你在本地开发，可以创建一个`.env`文件，将这些环境变量设置为本地开发值，但请确保不要将`.env`文件提交到版本控制系统中。

4. 如果你的项目有多个环境（如开发、测试、生产），请确保为每个环境配置正确的Secrets。

如果在配置过程中遇到问题，可以查看Vercel官方文档或联系Vercel支持。