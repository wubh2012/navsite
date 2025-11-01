require('dotenv').config();
const express = require('express');
const path = require('path');
const axios = require('axios');
const moment = require('moment');
const { Lunar } = require('lunar-javascript');
moment.locale('zh-cn');

const app = express();
const PORT = process.env.PORT || 3000;

// 解析JSON请求体
app.use(express.json());

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
      id: item.record_id, // 添加记录ID
      name: fields.name || fields.站点名称 || '',
      url: fields.url || fields.网址.link || '',
      category: fields.category || fields.分类 || '其它',
      sort: fields.sort || fields.排序 || 0,
      icon: fields?.icon?.link || fields?.备用图标?.link || ''
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
    { id: 'mock_001', name: 'GitHub', url: 'https://github.com', category: 'Code', sort: 1, icon: 'bi-github' },
    { id: 'mock_002', name: 'Stack Overflow', url: 'https://stackoverflow.com', category: 'Code', sort: 2, icon: 'bi-stack-overflow' },
    { id: 'mock_003', name: 'VSCode', url: 'https://code.visualstudio.com', category: 'Code', sort: 3, icon: 'bi-code-square' },
    { id: 'mock_004', name: 'CodePen', url: 'https://codepen.io', category: 'Code', sort: 4, icon: 'bi-code-slash' }
  ],
  '设计': [
    { id: 'mock_005', name: 'Figma', url: 'https://figma.com', category: '设计', sort: 1, icon: 'bi-palette' },
    { id: 'mock_006', name: 'Dribbble', url: 'https://dribbble.com', category: '设计', sort: 2, icon: 'bi-dribbble' },
    { id: 'mock_007', name: 'Behance', url: 'https://behance.net', category: '设计', sort: 3, icon: 'bi-brush' },
    { id: 'mock_008', name: 'Unsplash', url: 'https://unsplash.com', category: '设计', sort: 4, icon: 'bi-image' }
  ],
  '产品': [
    { id: 'mock_009', name: 'ProductHunt', url: 'https://producthunt.com', category: '产品', sort: 1, icon: 'bi-graph-up' },
    { id: 'mock_010', name: 'Trello', url: 'https://trello.com', category: '产品', sort: 2, icon: 'bi-kanban' },
    { id: 'mock_011', name: 'Notion', url: 'https://notion.so', category: '产品', sort: 3, icon: 'bi-journal-text' },
    { id: 'mock_012', name: 'Asana', url: 'https://asana.com', category: '产品', sort: 4, icon: 'bi-list-check' }
  ],
  '其它': [
    { id: 'mock_013', name: '百度', url: 'https://baidu.com', category: '其它', sort: 1, icon: 'bi-search' },
    { id: 'mock_014', name: '微博', url: 'https://weibo.com', category: '其它', sort: 2, icon: 'bi-chat-dots' },
    { id: 'mock_015', name: '知乎', url: 'https://zhihu.com', category: '其它', sort: 3, icon: 'bi-question-circle' },
    { id: 'mock_016', name: 'B站', url: 'https://bilibili.com', category: '其它', sort: 4, icon: 'bi-play-btn' }
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
    
    // 获取中文星期
    const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    const today = new Date();
    const chineseWeekday = weekdays[today.getDay()];
    
    res.json({
      success: true,
      data: data,
      categories: categories,
      timestamp: new Date().toISOString(),
      dateInfo: {
        time: moment().format('HH:mm'),
        date: moment().format('M月D日'),
        weekday: chineseWeekday,
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

// 添加新的网站链接
app.post('/api/links', async (req, res) => {
  try {
    // 解析请求体
    let requestBody = req.body;
    
    // 检查请求体是否存在
    if (!requestBody) {
      return res.status(400).json({
        success: false,
        message: '请求体不能为空'
      });
    }
    
    // 验证必要的字段
    if (!requestBody.name || !requestBody.name.trim()) {
      return res.status(400).json({
        success: false,
        message: '网站名称不能为空'
      });
    }
    
    if (!requestBody.url || !requestBody.url.trim()) {
      return res.status(400).json({
        success: false,
        message: '网站网址不能为空'
      });
    }
    
    if (!requestBody.category || !requestBody.category.trim()) {
      return res.status(400).json({
        success: false,
        message: '分类不能为空'
      });
    }
    
    // 验证网址格式
    try {
      new URL(requestBody.url);
    } catch (e) {
      return res.status(400).json({
        success: false,
        message: '无效的网址格式，请确保包含http://或https://'
      });
    }
    
    // 验证网站名称长度
    if (requestBody.name.length > 50) {
      return res.status(400).json({
        success: false,
        message: '网站名称长度不能超过50个字符'
      });
    }
    
    // 获取飞书访问令牌
    const token = await getTenantAccessToken();
    
    // 构建请求体，符合飞书多维表格API的要求
    const createRecordBody = {
      fields: {
        '分类': requestBody.category,
        '排序': requestBody.sort || 200, // 默认排序值
        '站点名称': requestBody.name,
        '网址': {
          'link': requestBody.url,
          'text': requestBody.name
        }
      }
    };
    
    // 调用飞书多维表格API创建记录
    const response = await axios.post(
      `https://open.feishu.cn/open-apis/bitable/v1/apps/${process.env.APP_TOKEN}/tables/${process.env.TABLE_ID}/records`,
      createRecordBody,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json; charset=utf-8'
        }
      }
    );
    
    // 处理响应
    if (response.data.code === 0) {
      res.json({
        success: true,
        message: '链接添加成功',
        data: response.data.data
      });
    } else {
      console.error('飞书API错误:', response.data);
      res.status(500).json({
        success: false,
        message: `添加链接失败: ${response.data.msg || '未知错误'}`
      });
    }
  } catch (error) {
    console.error('添加链接异常:', error.message);
    res.status(500).json({
      success: false,
      message: `添加链接失败: ${error.message}`
    });
  }
});

// 删除网站链接
app.delete('/api/links/:id', async (req, res) => {
  try {
    const recordId = req.params.id;
    
    if (!recordId) {
      return res.status(400).json({
        success: false,
        message: '记录ID不能为空'
      });
    }
    
    // 获取飞书访问令牌
    const token = await getTenantAccessToken();
    
    // 调用飞书多维表格API删除记录
    const response = await axios.delete(
      `https://open.feishu.cn/open-apis/bitable/v1/apps/${process.env.APP_TOKEN}/tables/${process.env.TABLE_ID}/records/${recordId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json; charset=utf-8'
        }
      }
    );
    
    // 处理响应
    if (response.data.code === 0) {
      res.json({
        success: true,
        message: '链接删除成功',
        data: response.data.data
      });
    } else {
      console.error('飞书API错误:', response.data);
      res.status(500).json({
        success: false,
        message: `删除链接失败: ${response.data.msg || '未知错误'}`
      });
    }
  } catch (error) {
    console.error('删除链接异常:', error.message);
    res.status(500).json({
      success: false,
      message: `删除链接失败: ${error.message}`
    });
  }
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});