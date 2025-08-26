require('dotenv').config();
const express = require('express');
const path = require('path');
const axios = require('axios');
const moment = require('moment');
const { Lunar } = require('lunar-javascript');
moment.locale('zh-cn');

const app = express();
const PORT = process.env.PORT || 3000;

// 静态文件服务
app.use(express.static(path.join(__dirname, 'public')));

// 缓存tenant_access_token及其过期时间
let cachedToken = null;
let tokenExpireTime = null;

// 获取tenant_access_token
async function getTenantAccessToken() {
  // 检查缓存的token是否存在且未过期（预留5分钟的缓冲时间）
  const now = Date.now();
  if (cachedToken && tokenExpireTime && now < tokenExpireTime - 5 * 60 * 1000) {
    console.log('使用缓存的tenant_access_token');
    return cachedToken;
  }

  try {
    console.log('重新获取tenant_access_token', process.env.APP_ID, process.env.APP_SECRET);
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
      // 缓存token和过期时间（飞书token有效期为2小时）
      cachedToken = response.data.tenant_access_token;
      // 计算过期时间（当前时间 + token有效期(秒) * 1000）
      tokenExpireTime = now + response.data.expire * 1000;
      return cachedToken;
    } else {
      console.error('获取tenant_access_token失败:', response.data);
      throw new Error(`获取tenant_access_token失败: ${response.data.msg}`);
    }
  } catch (error) {
    console.error('获取tenant_access_token异常:', error);
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
          page_size: 100 // 获取更多数据
        }
      }
    );

    if (response.data.code === 0) {
      return response.data.data.items;
    } else {
      console.error('获取多维表格数据失败:', response.data);
      throw new Error(`获取多维表格数据失败: ${response.data.msg}`);
    }
  } catch (error) {
    console.error('获取多维表格数据异常:', error.message);
    throw error;
  }
}

// 获取农历日期字符串
function getLunarDateString() {
  const date = new Date();
  const lunar = Lunar.fromDate(date);
  let result = '';
  
  // 处理闰月
  if (lunar.isLeap) {
    result += '闰';
  }
  
  // 月份和日期
  result += lunar.getMonthInChinese() + '月' + lunar.getDayInChinese();
  
  // 获取节气
  const jieQi = lunar.getJieQi();
  if (jieQi) {
    result += ' ' + jieQi;
  }
  
  return result;
}

// 处理多维表格数据
function processTableData(items) {
  // 提取记录并按分类分组
  const records = items.map(item => {
    const fields = item.fields;
    // 如果站点名称和网址都为空，则跳过该记录
    if ((!fields.name && !fields.站点名称) && (!fields.url && !fields.网址)) {
      return null;
    }
    return {
      name: fields.name || fields.站点名称 || '',
      url: fields.url || fields.网址.link || '',
      category: fields.category || fields.分类 || '其它',
      sort: fields.sort || fields.排序 || 0,
      icon: fields.icon || fields.图标 || ''
    };
  }).filter(record => record !== null); // 过滤掉空记录

  // 按分类分组
  const groupedByCategory = {};
  records.forEach(record => {
    if (!groupedByCategory[record.category]) {
      groupedByCategory[record.category] = [];
    }
    groupedByCategory[record.category].push(record);
  });

  // 每个分类内按排序字段排序
  Object.keys(groupedByCategory).forEach(category => {
    groupedByCategory[category].sort((a, b) => a.sort - b.sort);
  });

  return groupedByCategory;
}

// 模拟数据（当无法连接飞书API时使用）
const mockData = {
  'Code': [
    { name: 'GitHub', url: 'https://github.com', category: 'Code', sort: 1, icon: 'bi-github' },
    { name: 'Stack Overflow', url: 'https://stackoverflow.com', category: 'Code', sort: 2, icon: 'bi-stack-overflow' },
    { name: 'VSCode', url: 'https://code.visualstudio.com', category: 'Code', sort: 3, icon: 'bi-code-square' },
    { name: 'CodePen', url: 'https://codepen.io', category: 'Code', sort: 4, icon: 'bi-code-slash' }
  ],
  '设计': [
    { name: 'Figma', url: 'https://figma.com', category: '设计', sort: 1, icon: 'bi-palette' },
    { name: 'Dribbble', url: 'https://dribbble.com', category: '设计', sort: 2, icon: 'bi-dribbble' },
    { name: 'Behance', url: 'https://behance.net', category: '设计', sort: 3, icon: 'bi-brush' },
    { name: 'Unsplash', url: 'https://unsplash.com', category: '设计', sort: 4, icon: 'bi-image' }
  ],
  '产品': [
    { name: 'ProductHunt', url: 'https://producthunt.com', category: '产品', sort: 1, icon: 'bi-graph-up' },
    { name: 'Trello', url: 'https://trello.com', category: '产品', sort: 2, icon: 'bi-kanban' },
    { name: 'Notion', url: 'https://notion.so', category: '产品', sort: 3, icon: 'bi-journal-text' },
    { name: 'Asana', url: 'https://asana.com', category: '产品', sort: 4, icon: 'bi-list-check' }
  ],
  '其它': [
    { name: '百度', url: 'https://baidu.com', category: '其它', sort: 1, icon: 'bi-search' },
    { name: '微博', url: 'https://weibo.com', category: '其它', sort: 2, icon: 'bi-chat-dots' },
    { name: '知乎', url: 'https://zhihu.com', category: '其它', sort: 3, icon: 'bi-question-circle' },
    { name: 'B站', url: 'https://bilibili.com', category: '其它', sort: 4, icon: 'bi-play-btn' }
  ]
};

// API路由 - 获取导航数据
app.get('/api/navigation', async (req, res) => {
  try {
    let data;
    let categories;
    
    // 尝试从飞书API获取数据
    try {
      const token = await getTenantAccessToken();
      const items = await getBitableData(token);
      data = processTableData(items);
      categories = Object.keys(data);
    } catch (apiError) {
      console.log('无法从飞书API获取数据，使用模拟数据:', apiError.message);
      // 使用模拟数据
      data = mockData;
      categories = Object.keys(mockData);
    }
    
    res.json({
      success: true,
      data: data,
      categories: categories,
      timestamp: new Date().toISOString(),
      dateInfo: {
        time: moment().format('HH:mm'),
        date: moment().format('M月D日'),
        weekday: moment().format('dddd'),
        lunarDate: getLunarDateString()
      }
    });
  } catch (error) {
    console.error('API错误:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Favicon代理端点
app.get('/api/favicon', async (req, res) => {
  try {
    const { url } = req.query;
    
    if (!url) {
      return res.status(400).json({
        success: false,
        message: '缺少url参数'
      });
    }
    
    // 验证URL格式
    let parsedUrl;
    try {
      parsedUrl = new URL(url);
    } catch (e) {
      return res.status(400).json({
        success: false,
        message: '无效的URL格式'
      });
    }
    
    // 只允许http和https协议
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return res.status(400).json({
        success: false,
        message: '只支持HTTP和HTTPS协议'
      });
    }
    
    // 尝试获取网站的favicon
    const faviconUrl = `https://www.google.com/s2/favicons?domain=${parsedUrl.hostname}&size=32`;
    
    // 代理请求到Google favicon服务
    const response = await axios.get(faviconUrl, {
      responseType: 'arraybuffer',
      timeout: 5000 // 5秒超时
    });
    
    // 设置正确的Content-Type
    res.set('Content-Type', response.headers['content-type']);
    res.set('Cache-Control', 'public, max-age=86400'); // 缓存24小时
    
    // 返回图片数据
    res.send(response.data);
    
  } catch (error) {
    console.error('Favicon代理错误:', error.message);
    
    // 返回一个透明的1x1像素图片作为fallback
    const fallbackImage = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');
    res.set('Content-Type', 'image/png');
    res.set('Cache-Control', 'public, max-age=300'); // 缓存5分钟
    res.send(fallbackImage);
  }
});

// 主页路由
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});