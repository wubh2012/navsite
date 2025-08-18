// 全局变量
let navigationData = {};
let categories = [];
let currentCategory = 'all';

// DOM元素
const categoryMenu = document.getElementById('category-menu');
const toolsGrid = document.getElementById('tools-grid');
const currentTimeEl = document.getElementById('current-time');
const dateInfoEl = document.getElementById('date-info');

// 初始化函数
async function init() {
  // 获取导航数据
  await fetchNavigationData();
  
  // 更新时间信息
  updateTimeInfo();
  setInterval(updateTimeInfo, 1000); // 每秒更新一次
  
  // 添加事件监听器
  addEventListeners();
}

// 获取导航数据
async function fetchNavigationData() {
  try {
    const response = await fetch('/api/navigation');
    const result = await response.json();
    console.log('获取导航数据:', result);
    
    if (result.success) {
      navigationData = result.data;
      categories = result.categories;
      
      // 生成分类菜单
      generateCategoryMenu();
      
      // 显示所有工具
      showTools('all');
    } else {
      console.error('获取导航数据失败:', result.message);
      showError('获取数据失败，请刷新页面重试');
    }
  } catch (error) {
    console.error('获取导航数据异常:', error);
    showError('网络错误，请检查网络连接后重试');
  }
}

// 生成分类菜单
function generateCategoryMenu() {
  // 保留第一个"主页"菜单项
  const homeMenuItem = categoryMenu.firstElementChild;
  categoryMenu.innerHTML = '';
  categoryMenu.appendChild(homeMenuItem);
  
  // 添加分类菜单项
  categories.forEach(category => {
    const li = document.createElement('li');
    li.setAttribute('data-category', category);
    
    // 根据分类名称选择合适的图标
    let iconClass = 'bi-folder';
    if (category.includes('Code') || category.includes('代码')) {
      iconClass = 'bi-code-square';
    } else if (category.includes('设计')) {
      iconClass = 'bi-palette';
    } else if (category.includes('产品')) {
      iconClass = 'bi-diagram-3';
    }
    
    li.innerHTML = `<i class="bi ${iconClass}"></i> ${category}`;
    li.addEventListener('click', () => showTools(category));
    categoryMenu.appendChild(li);
  });
}

// 显示工具
function showTools(category) {
  // 更新当前分类
  currentCategory = category;
  
  // 更新菜单项激活状态
  const menuItems = categoryMenu.querySelectorAll('li');
  menuItems.forEach(item => {
    if (
      (category === 'all' && item.getAttribute('data-category') === 'all') ||
      item.getAttribute('data-category') === category
    ) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
  
  // 清空工具网格
  toolsGrid.innerHTML = '';
  
  // 显示所有分类或特定分类的工具
  if (category === 'all') {
    // 显示所有分类的工具
    categories.forEach(cat => {
      const tools = navigationData[cat] || [];
      tools.forEach(tool => addToolItem(tool));
    });
  } else {
    // 显示特定分类的工具
    const tools = navigationData[category] || [];
    tools.forEach(tool => addToolItem(tool));
  }
}

// 获取网站favicon的URL
function getFaviconUrl(url) {
  try {
    // 检查url是否为对象（有些数据可能格式不正确）
    if (typeof url === 'object') {
      // 如果是对象，尝试使用link或text属性
      if (url.link && typeof url.link === 'string') {
        url = url.link;
      } else if (url.text && typeof url.text === 'string') {
        url = url.text;
      } else {
        // 如果没有可用的字符串属性，则返回null
        console.error('URL对象格式不正确:', url);
        return null;
      }
    }
    
    // 确保url是字符串
    if (typeof url !== 'string') {
      console.error('URL不是字符串:', url);
      return null;
    }
    
    // 尝试创建URL对象
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;
    
    // 使用Favicon.im服务获取高质量图标（支持更大尺寸和更清晰的图标）
    return `https://favicon.im/${hostname}?larger=true`;
    
    // 备选方案
    // 1. Google的favicon服务
    // return `https://www.google.com/s2/favicons?domain=${hostname}&size=64`;
    
    // 2. ToolB的favicon服务
    // return `https://toolb.cn/favicon/${hostname}`;
  } catch (e) {
    console.error('无效的URL:', url);
    return null;
  }
}

// 生成文字图标
function generateTextIcon(name) {
  // 获取名称的第一个字符（如果是中文）或前两个字符的首字母（如果是英文）
  let iconText = '';
  if (/[\u4e00-\u9fa5]/.test(name[0])) {
    // 中文名称，取第一个字
    iconText = name[0];
  } else {
    // 英文名称，取前两个单词的首字母
    const words = name.split(/\s+/);
    if (words.length >= 2) {
      iconText = (words[0][0] + words[1][0]).toUpperCase();
    } else if (words[0].length >= 2) {
      iconText = words[0].substring(0, 2).toUpperCase();
    } else {
      iconText = words[0][0].toUpperCase();
    }
  }
  
  // 生成随机背景色（柔和的颜色）
  const hue = Math.floor(Math.random() * 360);
  const bgColor = `hsl(${hue}, 70%, 80%)`;
  const textColor = `hsl(${hue}, 70%, 30%)`;
  
  return `<div class="text-icon" style="background-color: ${bgColor}; color: ${textColor};">${iconText}</div>`;
}

// 添加工具项
function addToolItem(tool) {
  const toolItem = document.createElement('a');
  toolItem.className = 'tool-item';
  // 解析URL，兼容对象格式 { link: string } 或 { text: string }
  let urlString = '';
  if (tool && tool.url) {
    if (typeof tool.url === 'string') {
      urlString = tool.url;
    } else if (typeof tool.url === 'object') {
      if (tool.url.link && typeof tool.url.link === 'string') {
        urlString = tool.url.link;
      } else if (tool.url.text && typeof tool.url.text === 'string') {
        urlString = tool.url.text;
      }
    }
  }
  toolItem.href = urlString || '#';
  toolItem.target = '_blank';
  toolItem.rel = 'noopener noreferrer';
  if (tool && tool.name) {
    toolItem.title = tool.name;
  }
  
  // 使用图标（如果有）或尝试获取网站favicon或生成文字图标
  let iconHtml = '';
  let useFavicon = false;
  
  if (tool.icon) {
    // 如果是URL，使用img标签
    if (tool.icon.startsWith('http')) {
      iconHtml = `<img src="${tool.icon}" alt="${tool.name}" class="tool-icon">`;
    } else {
      // 否则假设是Bootstrap图标类名
      iconHtml = `<i class="bi ${tool.icon} tool-icon"></i>`;
    }
  } else {
    // 尝试使用网站的favicon
    const faviconUrl = getFaviconUrl(tool.url);
    if (faviconUrl) {
      // 添加onerror处理，当图标加载失败时显示文字图标
      iconHtml = `<img src="${faviconUrl}" alt="${tool.name}" class="tool-icon" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">`;
      useFavicon = true;
    }
    
    // 添加文字图标作为备用或默认选项
    
    // 如果工具名称为空则跳过生成图标
    if (tool.name) {
      const textIconHtml = generateTextIcon(tool.name);
      iconHtml += textIconHtml;
    }
    
    if (useFavicon) {
      // 如果使用favicon，初始隐藏文字图标
      iconHtml = iconHtml.replace('<div class="text-icon"', '<div class="text-icon" style="display: none;"');
    }
  }
  
  toolItem.innerHTML = `
    ${iconHtml}
    <div class="tool-name">${tool.name}</div>
  `;
  
  toolsGrid.appendChild(toolItem);
}

// 更新时间信息
function updateTimeInfo() {
  const now = new Date();
  
  // 更新当前时间
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  currentTimeEl.textContent = `${hours}:${minutes}:${seconds}`;
  
  // 更新日期信息
  const month = now.getMonth() + 1;
  const date = now.getDate();
  const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  const weekday = weekdays[now.getDay()];
  
  // 这里使用固定的农历日期，实际应用中可以使用专门的农历转换库
  const lunarDate = '闰六月十八'; // 示例值
  
  dateInfoEl.textContent = `${month} 月 ${date} 日 ${weekday} ${lunarDate}`;
}

// 显示错误信息
function showError(message) {
  toolsGrid.innerHTML = `
    <div style="text-align: center; width: 100%; padding: 30px;">
      <i class="bi bi-exclamation-triangle" style="font-size: 48px; color: #ff4d4f; margin-bottom: 20px;"></i>
      <p style="color: #666;">${message}</p>
    </div>
  `;
}

// 添加事件监听器
function addEventListeners() {
  // 主页菜单项点击事件
  const homeMenuItem = document.querySelector('[data-category="all"]');
  homeMenuItem.addEventListener('click', () => showTools('all'));
  
  // 暗黑模式切换按钮点击事件
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  themeToggleBtn.addEventListener('click', toggleTheme);
}

// 切换主题模式
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  // 应用新主题
  document.documentElement.setAttribute('data-theme', newTheme);
  
  // 保存用户选择到localStorage
  localStorage.setItem('theme', newTheme);
  
  // 更新按钮文本和图标
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const icon = themeToggleBtn.querySelector('i');
  if (newTheme === 'dark') {
    themeToggleBtn.innerHTML = '<i class="bi bi-sun"></i> 亮色模式';
  } else {
    themeToggleBtn.innerHTML = '<i class="bi bi-moon"></i> 暗黑模式';
  }
}

// 初始化主题模式
function initTheme() {
  // 检查localStorage中是否有用户选择
  const savedTheme = localStorage.getItem('theme');
  
  // 检查系统偏好
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  // 确定要应用的主题
  let themeToApply;
  if (savedTheme) {
    themeToApply = savedTheme;
  } else {
    themeToApply = systemPrefersDark ? 'dark' : 'light';
  }
  
  // 应用主题
  document.documentElement.setAttribute('data-theme', themeToApply);
  
  // 更新按钮文本和图标
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const icon = themeToggleBtn.querySelector('i');
  if (themeToApply === 'dark') {
    themeToggleBtn.innerHTML = '<i class="bi bi-sun"></i> 亮色模式';
  } else {
    themeToggleBtn.innerHTML = '<i class="bi bi-moon"></i> 暗黑模式';
  }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init);

// 初始化主题模式
initTheme();