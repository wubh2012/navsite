const express = require('express');
const path = require('path');
const axios = require('axios');
const moment = require('moment');
const { Lunar } = require('lunar-javascript');
const serverless = require('serverless-http');

const app = express();

// 中间件
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(express.json());

// 缓存tenant_access_token及其过期时间
let cachedToken = null;
let tokenExpireTime = null;

// 获取tenant_access_token
async function getTenantAccessToken() {
  const now = Date.now();
  if (cachedToken && tokenExpireTime && now < tokenExpireTime - 5 * 60 * 1000) {
    console.log('使用缓存的tenant_access_token');
    return cachedToken;
  }

  try {
    console.log('重新获取tenant_access_token');
    const response = await axios.post(
      'https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal',
      {
        app_id: process.env.APP_ID,
        app_secret: process.env.APP_SECRET
      },
      {
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        }
      }
    );

    if (response.data.code === 0) {
      cachedToken = response.data.tenant_access_token;
      tokenExpireTime = now + response.data.expire * 1000;
      return cachedToken;
    } else {
      throw new Error(`获取tenant_access_token失败: ${response.data.msg}`);
    }
  } catch (error) {
    console.error('获取tenant_access_token异常:', error.message);
    throw error;
  }
}

// 获取多维表格数据
async function getBitableData(token) {
  try {
    const response = await axios.get(
      `https://open.feishu.cn/open-apis/bitable/v1/apps/${process.env.APP_TOKEN}/tables/${process.env.TABLE_ID}/records`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json; charset=utf-8'
        },
        params: {
          page_size: 100
        }
      }
    );

    if (response.data.code === 0) {
      return response.data.data.items;
    } else {
      throw new Error(`获取多维表格数据失败: ${response.data.msg}`);
    }
  } catch (error) {
    console.error('获取多维表格数据异常:', error.message);
    throw error;
  }
}

// API路由
app.get('/api/data', async (req, res) => {
  try {
    const token = await getTenantAccessToken();
    const data = await getBitableData(token);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 根路由
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Vercel 无服务器函数适配器

// 开发环境
if (process.env.NODE_ENV !== 'production') {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`服务器运行在 http://localhost:${port}`);
  });
}

// Vercel 无服务器函数导出
module.exports = serverless(app);