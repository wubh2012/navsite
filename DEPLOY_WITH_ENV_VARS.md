# Vercel部署环境变量配置指南

## 问题回顾

之前的部署错误是由于Vercel项目中缺少必要的Secrets配置。我们已经修改了`vercel.json`文件，将环境变量引用从`@app_id`格式更改为`${APP_ID}`格式，这样Vercel就可以直接使用环境变量而不是引用Secrets。

## 部署方法

### 方法1：在部署命令中临时设置环境变量

你可以在运行部署命令时直接设置环境变量：

```bash
# Windows命令提示符
set APP_ID=your_app_id && set APP_SECRET=your_app_secret && set APP_TOKEN=your_app_token && set TABLE_ID=your_table_id && vercel --prod

# Windows PowerShell
$env:APP_ID="your_app_id"; $env:APP_SECRET="your_app_secret"; $env:APP_TOKEN="your_app_token"; $env:TABLE_ID="your_table_id"; vercel --prod

# macOS/Linux
APP_ID=your_app_id APP_SECRET=your_app_secret APP_TOKEN=your_app_token TABLE_ID=your_table_id vercel --prod
```

### 方法2：在Vercel控制台中设置环境变量

1. 登录Vercel控制台，选择你的项目
2. 点击顶部的`Settings`选项卡
3. 在左侧导航栏中选择`Environment Variables`
4. 点击`Add New Variable`按钮，添加以下环境变量：
   - `APP_ID`: 你的飞书应用ID
   - `APP_SECRET`: 你的飞书应用密钥
   - `APP_TOKEN`: 你的飞书多维表格应用Token
   - `TABLE_ID`: 你的飞书多维表格ID
5. 不需要勾选`Encrypt`选项，因为我们现在使用的是普通环境变量而不是Secrets
6. 点击`Add`按钮保存
7. 运行部署命令：
   ```bash
   vercel --prod
   ```

## 注意事项

1. 方法1中的环境变量只在当前命令执行期间有效，不会被保存

2. 方法2中的环境变量会被保存在Vercel项目中， future 部署时会自动使用

3. 请确保不要将敏感信息（如APP_SECRET）提交到代码仓库中

4. 如果你之前已经在Vercel控制台中设置了Secrets，可以继续使用它们，但需要将`vercel.json`文件中的引用格式改回`@app_id`格式

5. 对于生产环境，建议使用方法2并勾选`Encrypt`选项来保护敏感信息

## 验证部署

部署完成后，你可以通过访问应用来验证配置是否正确。如果配置正确，应用应该能够正常连接到飞书API并获取数据。

如果遇到问题，请检查环境变量值是否正确或查看Vercel部署日志获取详细错误信息。