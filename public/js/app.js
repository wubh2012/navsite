// 全局变量
let navigationData = {};
let categories = [];
let currentCategory = 'all';
let dataCache = null; // 数据缓存
let cacheTimestamp = null; // 缓存时间戳
const CACHE_DURATION = 5 * 60 * 1000; // 缓存5分钟

// DOM元素
const categoryMenu = document.getElementById('category-menu');
const toolsGrid = document.getElementById('tools-grid');
const currentTimeEl = document.getElementById('current-time');
const dateInfoEl = document.getElementById('date-info');

// 立即更新时间信息（在DOM加载完成后立即执行）
function updateTimeInfoImmediately() {
  if (currentTimeEl && dateInfoEl) {
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

    // 如果有缓存数据，使用缓存的日期信息
    if (dataCache && dataCache.dateInfo) {
      dateInfoEl.textContent = `${dataCache.dateInfo.date} ${dataCache.dateInfo.weekday} ${dataCache.dateInfo.lunarDate}`;
    } else {
      // 这里使用固定的农历日期，实际应用中可以使用专门的农历转换库
      const lunarDate = '闰六月十八'; // 示例值
      dateInfoEl.textContent = `${month} 月 ${date} 日 ${weekday} ${lunarDate}`;
    }
  }
}

// 在DOM加载完成后立即更新时间
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', updateTimeInfoImmediately);
} else {
  // DOM已经加载完成
  updateTimeInfoImmediately();
}

// 初始化函数
async function init() {
  // 显示页面加载动画
  showPageLoader();
  
  // 初始化粒子系统
  initParticles();
  
  // 更新时间信息（确保时间准确）
  updateTimeInfo();
  setInterval(updateTimeInfo, 1000); // 每秒更新一次

  // 获取导航数据
  await fetchNavigationData();

  // 添加事件监听器
  addEventListeners();

  // 初始化触摸支持
  initTouchSupport();
  
  // 初始化交互管理器
  const interactionManager = new InteractionManager();
  
  // 延迟隐藏页面加载动画，确保动画效果完整
  setTimeout(() => {
    hidePageLoader();
    
    // 确保图标背景色正确设置
    if (window.themeInitialized) {
      refreshToolIcons();
    }
  }, 800);
}

// 获取导航数据
async function fetchNavigationData(forceRefresh = false) {
  // 检查缓存是否有效（除非强制刷新）
  if (!forceRefresh && dataCache && cacheTimestamp && (Date.now() - cacheTimestamp < CACHE_DURATION)) {
    console.log('使用缓存数据');
    navigationData = dataCache.data;
    categories = dataCache.categories;

    // 生成分类菜单
    generateCategoryMenu();

    // 显示所有工具
    showTools('all');
    
    // 更新日期信息
    if (dataCache.dateInfo) {
      updateDateInfo(dataCache.dateInfo);
    }
    return;
  }

  // 显示加载动画
  showLoadingAnimation();

  try {
    const response = await fetch('/api/navigation');
    
    // 检查响应状态
    if (!response.ok) {
      console.warn(`API 请求失败: ${response.status} ${response.statusText}`);
      hideLoadingAnimation();
      useDefaultNavigationData();
      return;
    }
    
    // 检查内容类型
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.warn('API 返回非 JSON 数据，使用默认数据');
      hideLoadingAnimation();
      useDefaultNavigationData();
      return;
    }
    
    const result = await response.json();
    console.log('获取导航数据:', result);

    if (result.success) {
      navigationData = result.data;
      categories = result.categories;

      // 缓存数据
      dataCache = {
        data: result.data,
        categories: result.categories,
        dateInfo: result.dateInfo
      };
      cacheTimestamp = Date.now();

      // 隐藏加载动画
      hideLoadingAnimation();

      // 生成分类菜单
      generateCategoryMenu();

      // 显示所有工具
      showTools('all');
      
      // 更新日期信息
      updateDateInfo(result.dateInfo);
    } else {
      console.warn('获取导航数据失败:', result.message);
      hideLoadingAnimation();
      useDefaultNavigationData();
    }
  } catch (error) {
    console.warn('获取导航数据异常:', error);
    hideLoadingAnimation();
    // 使用默认数据
    useDefaultNavigationData();
  }
}

// 显示加载动画
function showLoadingAnimation() {
  toolsGrid.innerHTML = `
    <div class="loading-container" style="
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 300px;
      text-align: center;
    ">
      <div class="loading-spinner" style="
        width: 40px;
        height: 40px;
        border: 4px solid #f3f3f3;
        border-top: 4px solid #007bff;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-bottom: 20px;
      "></div>
      <p style="color: #666; font-size: 16px; margin: 0;">正在加载导航数据...</p>
    </div>
    <style>
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    </style>
  `;
}

// 隐藏加载动画
function hideLoadingAnimation() {
  const loadingContainer = toolsGrid.querySelector('.loading-container');
  if (loadingContainer) {
    loadingContainer.remove();
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

// 获取网站favicon的缓存
const faviconCache = new Map();

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
        return null;
      }
    }

    // 确保url是字符串
    if (typeof url !== 'string' || !url.trim()) {
      return null;
    }

    // 尝试创建URL对象
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;

    // 检查内存缓存
    const cacheKey = `favicon_${hostname}`;
    if (faviconCache.has(cacheKey)) {
      return faviconCache.get(cacheKey);
    }

    // 检查LocalStorage缓存
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const cacheData = JSON.parse(cached);
        // 检查缓存是否过期（24小时）
        if (Date.now() - cacheData.timestamp < 24 * 60 * 60 * 1000) {
          faviconCache.set(cacheKey, cacheData.url);
          return cacheData.url;
        }
      }
    } catch (e) {
      // 静默处理LocalStorage错误
    }

    // 备用方案： https://favicon.im/hey.com
    // 使用Google的favicon服务作为主要方案 `https://www.google.com/s2/favicons?sz=48&domain_url=${hostname}`;
    const googleFaviconUrl = `https://www.google.com/s2/favicons?sz=48&domain_url=${hostname}`;

    // 服务器代理作为备用方案
    const proxyFaviconUrl = `/api/favicon?url=${encodeURIComponent(url)}`;

    // 预缓存到内存（使用Google服务）
    faviconCache.set(cacheKey, googleFaviconUrl);

    // 异步缓存到LocalStorage（不阻塞主线程）
    setTimeout(() => {
      try {
        localStorage.setItem(cacheKey, JSON.stringify({
          url: googleFaviconUrl,
          timestamp: Date.now(),
          ttl: 24 * 60 * 60 * 1000 // 24小时
        }));
      } catch (e) {
        // 静默处理LocalStorage错误
      }
    }, 0);

    return googleFaviconUrl;

  } catch (e) {
    // 静默处理URL错误，返回null使用文字图标
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

  // 检查当前主题模式
  const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
  
  // 生成随机背景色（柔和的颜色）
  const hue = Math.floor(Math.random() * 360);
  // 在亮色模式下使用更浅的背景色（亮度从80%提高到90%）
  const lightness = isDarkMode ? 80 : 90;
  const bgColor = `hsl(${hue}, 70%, ${lightness}%)`;
  const textColor = `hsl(${hue}, 70%, 30%)`;

  return `<div class="text-icon" style="background-color: ${bgColor}; color: ${textColor};">${iconText}</div>`;
}

// 添加工具项
function addToolItem(tool) {
  const toolItem = document.createElement('div');
  toolItem.className = 'tool-item glass-container hover-lift click-bounce';
  toolItem.dataset.id = tool.id || '';

  // 创建链接元素
  const linkElement = document.createElement('a');
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
  linkElement.href = urlString || '#';
  linkElement.target = '_blank';
  linkElement.rel = 'noopener noreferrer';
  if (tool && tool.name) {
    linkElement.title = tool.name;
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

  linkElement.innerHTML = `
    ${iconHtml}
    <div class="tool-name">${tool.name}</div>
  `;

  // 添加删除按钮
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'tool-item-delete-btn';
  deleteBtn.innerHTML = '<i class="bi bi-trash"></i>';
  deleteBtn.title = '删除网站';
  deleteBtn.dataset.toolId = tool.id || '';
  deleteBtn.dataset.toolName = tool.name || '';

  // 添加点击事件
  deleteBtn.addEventListener('click', function (e) {
    e.preventDefault();
    e.stopPropagation();
    showDeleteConfirmation(tool.id || '', tool.name || '');
  });

  // 组装工具项
  toolItem.appendChild(linkElement);
  toolItem.appendChild(deleteBtn);

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

  // 如果有缓存数据，使用缓存的日期信息
  if (dataCache && dataCache.dateInfo) {
    updateDateInfo(dataCache.dateInfo);
  } else {
    // 更新日期信息（使用静态值作为fallback）
    const month = now.getMonth() + 1;
    const date = now.getDate();
    const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    const weekday = weekdays[now.getDay()];
    const lunarDate = '闰六月十八'; // 示例值
    dateInfoEl.textContent = `${month} 月 ${date} 日 ${weekday} ${lunarDate}`;
  }
}

// 更新日期信息
function updateDateInfo(dateInfo) {
  if (dateInfoEl && dateInfo) {
    dateInfoEl.textContent = `${dateInfo.date} ${dateInfo.weekday} ${dateInfo.lunarDate}`;
  }
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

// 显示页面加载动画
function showPageLoader() {
  const loader = document.createElement('div');
  loader.id = 'page-loader';
  loader.className = 'page-loader';
  loader.innerHTML = `
    <div class="loader-logo"></div>
  `;
  document.body.appendChild(loader);
}

// 隐藏页面加载动画
function hidePageLoader() {
  const loader = document.getElementById('page-loader');
  if (loader) {
    loader.style.opacity = '0';
    loader.style.visibility = 'hidden';
    setTimeout(() => loader.remove(), 500);
  }
}

// 粒子系统已移除

// 交互管理器
class InteractionManager {
  constructor() {
    this.init();
  }
  
  init() {
    this.bindMenuEvents();
    this.bindCardEvents();
    this.bindThemeToggle();
    this.bindGlobalEvents();
  }
  
  bindMenuEvents() {
    document.querySelectorAll('.nav-menu li').forEach(item => {
      item.addEventListener('click', (e) => {
        // 移除其他活跃状态
        document.querySelectorAll('.nav-menu li').forEach(i => 
          i.classList.remove('active'));
        
        // 添加当前活跃状态
        e.currentTarget.classList.add('active');
        
        // 添加点击波纹效果
        this.createRipple(e);
      });
    });
  }
  
  bindCardEvents() {
    document.querySelectorAll('.tool-item').forEach(card => {
      card.addEventListener('mouseenter', () => {
        card.style.setProperty('--hover-scale', '1.05');
      });
      
      card.addEventListener('mouseleave', () => {
        card.style.removeProperty('--hover-scale');
      });
      
      card.addEventListener('click', (e) => {
        this.createClickEffect(e.currentTarget);
      });
    });
  }
  
  bindThemeToggle() {
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', (e) => {
        this.createClickEffect(e.currentTarget);
      });
    }
  }
  
  bindGlobalEvents() {
    // 添加键盘导航支持
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        // 为可聚焦元素添加焦点样式
        const focusableElements = document.querySelectorAll('.tool-item, .nav-menu li, button');
        focusableElements.forEach(el => {
          el.addEventListener('focus', () => {
            el.style.outline = '2px solid var(--neon-cyan)';
            el.style.outlineOffset = '2px';
          });
          el.addEventListener('blur', () => {
            el.style.outline = 'none';
          });
        });
      }
    });
  }
  
  createRipple(e) {
    const ripple = document.createElement('span');
    const rect = e.currentTarget.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    ripple.style.cssText = `
      position: absolute;
      border-radius: 50%;
      background: rgba(255, 0, 102, 0.3);
      transform: scale(0);
      animation: ripple 0.6s linear;
      left: ${x}px;
      top: ${y}px;
      width: ${size}px;
      height: ${size}px;
      pointer-events: none;
    `;
    
    e.currentTarget.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  }
  
  createClickEffect(element) {
    element.style.transform = 'scale(0.95)';
    setTimeout(() => {
      element.style.transform = '';
    }, 150);
  }
}

// 添加事件监听器
function addEventListeners() {
  // 主页菜单项点击事件
  const homeMenuItem = document.querySelector('[data-category="all"]');
  homeMenuItem.addEventListener('click', () => showTools('all'));

  // 暗黑模式切换按钮点击事件
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  themeToggleBtn.addEventListener('click', toggleTheme);

  // 移动端汉堡菜单事件监听器
  addMobileMenuListeners();
}

// 添加移动端菜单事件监听器
function addMobileMenuListeners() {
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('mobile-overlay');

  if (hamburgerBtn && sidebar && overlay) {
    // 汉堡菜单按钮点击事件
    hamburgerBtn.addEventListener('click', toggleMobileMenu);

    // 遮罩层点击事件 - 关闭菜单
    overlay.addEventListener('click', closeMobileMenu);

    // 侧边栏菜单项点击事件 - 选择分类后关闭菜单
    const menuItems = sidebar.querySelectorAll('.nav-menu li');
    menuItems.forEach(item => {
      item.addEventListener('click', () => {
        // 延迟关闭菜单，让用户看到选中效果
        setTimeout(closeMobileMenu, 300);
      });
    });

    // ESC键关闭菜单
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && sidebar.classList.contains('active')) {
        closeMobileMenu();
      }
    });
  }

  // 添加搜索功能事件监听器
  addMobileSearchListeners();
}

// 添加移动端搜索事件监听器
function addMobileSearchListeners() {
  const searchBtn = document.getElementById('mobile-search-btn');
  const searchContainer = document.getElementById('mobile-search');
  const searchBackBtn = document.getElementById('search-back-btn');
  const searchInput = document.getElementById('search-input');
  const searchClearBtn = document.getElementById('search-clear-btn');

  console.log('初始化搜索事件监听器');
  console.log('搜索按钮:', searchBtn);
  console.log('搜索容器:', searchContainer);

  if (searchBtn && searchContainer) {
    console.log('绑定搜索按钮点击事件');
    // 搜索按钮点击事件
    searchBtn.addEventListener('click', function (e) {
      console.log('搜索按钮被点击');
      e.preventDefault();
      e.stopPropagation();
      openMobileSearch();
    });

    // 返回按钮点击事件
    if (searchBackBtn) {
      searchBackBtn.addEventListener('click', function (e) {
        console.log('返回按钮被点击');
        e.preventDefault();
        e.stopPropagation();
        closeMobileSearch();
      });
    }

    // 搜索输入框事件
    if (searchInput) {
      searchInput.addEventListener('input', handleSearchInput);
      searchInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          const query = searchInput.value.trim();
          if (query) {
            console.log('回车键搜索:', query);
            performSearch(query);
          }
        }
      });
      // 添加keypress事件作为备用，确保移动端回车键能被捕获
      searchInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter' || e.keyCode === 13) {
          e.preventDefault();
          const query = searchInput.value.trim();
          if (query) {
            console.log('keypress回车键搜索:', query);
            performSearch(query);
          }
        }
      });
      searchInput.addEventListener('focus', () => {
        searchInput.parentElement.classList.add('focused');
      });
      searchInput.addEventListener('blur', () => {
        searchInput.parentElement.classList.remove('focused');
      });
    }

    // 清除按钮点击事件
    if (searchClearBtn) {
      searchClearBtn.addEventListener('click', clearSearch);
    }

    // ESC键关闭搜索
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && searchContainer.classList.contains('active')) {
        closeMobileSearch();
      }
    });
  } else {
    console.error('搜索按钮或搜索容器未找到');
    console.error('searchBtn:', searchBtn);
    console.error('searchContainer:', searchContainer);
  }

}

// 打开移动端搜索
function openMobileSearch() {
  console.log('打开移动端搜索');
  const searchContainer = document.getElementById('mobile-search');
  const searchInput = document.getElementById('search-input');

  console.log('搜索容器:', searchContainer);
  console.log('搜索输入框:', searchInput);

  if (searchContainer) {
    searchContainer.classList.add('active');
    document.body.style.overflow = 'hidden';
    console.log('搜索界面已激活');

    // 延迟聚焦输入框，确保动画完成
    setTimeout(() => {
      if (searchInput) {
        searchInput.focus();
        console.log('输入框已聚焦');
      }
    }, 300);
  } else {
    console.error('搜索容器未找到，无法打开搜索界面');
  }
}

// 关闭移动端搜索
function closeMobileSearch() {
  const searchContainer = document.getElementById('mobile-search');
  const searchInput = document.getElementById('search-input');

  searchContainer.classList.remove('active');
  document.body.style.overflow = '';

  // 清空搜索内容
  if (searchInput) {
    searchInput.value = '';
    handleSearchInput({ target: searchInput });
  }
}

// 处理搜索输入
function handleSearchInput(e) {
  const query = e.target.value.trim();
  const clearBtn = document.getElementById('search-clear-btn');
  const resultsContainer = document.getElementById('search-results');

  // 显示/隐藏清除按钮
  if (query) {
    clearBtn.classList.add('visible');
  } else {
    clearBtn.classList.remove('visible');
  }

  // 执行搜索
  if (query.length > 0) {
    performSearch(query);
  } else {
    showSearchSuggestions();
  }
}

// 执行搜索
function performSearch(query) {
  console.log('执行搜索，关键词:', query);
  console.log('当前数据状态:', { navigationData, categories });

  const resultsContainer = document.getElementById('search-results');
  const searchResults = [];

  // 检查数据是否已加载
  if (!navigationData || Object.keys(navigationData).length === 0) {
    console.log('导航数据为空，尝试重新获取数据');
    // 如果数据为空，尝试重新获取
    fetchNavigationData().then(() => {
      if (navigationData && Object.keys(navigationData).length > 0) {
        performSearch(query); // 递归调用
      } else {
        console.log('重新获取数据失败');
        displaySearchResults([], query);
      }
    });
    return;
  }

  if (!categories || categories.length === 0) {
    console.log('分类数据为空，使用navigationData的键作为分类');
    categories = Object.keys(navigationData);
  }

  console.log('开始在以下分类中搜索:', categories);

  // 在所有分类中搜索
  categories.forEach(category => {
    const tools = navigationData[category] || [];
    console.log(`分类 "${category}" 中有 ${tools.length} 个工具`);

    tools.forEach(tool => {
      if (tool && tool.name) {
        const toolName = tool.name.toLowerCase();
        const searchQuery = query.toLowerCase();

        if (toolName.includes(searchQuery)) {
          console.log(`找到匹配项: ${tool.name} (分类: ${category})`);
          searchResults.push({
            ...tool,
            category: category
          });
        }
      }
    });
  });

  console.log(`搜索 "${query}" 找到 ${searchResults.length} 个结果:`, searchResults);

  // 显示搜索结果
  displaySearchResults(searchResults, query);
}

// 显示搜索结果
function displaySearchResults(results, query, resultsContainer = null, noResultsContainer = null) {
  if (!resultsContainer) {
    resultsContainer = document.getElementById('search-results');
  }
  if (!noResultsContainer) {
    noResultsContainer = document.getElementById('search-no-results');
  }

  if (!resultsContainer) {
    console.error('搜索结果容器未找到');
    return;
  }

  if (!noResultsContainer) {
    console.error('无结果容器未找到');

    // 如果无结果容器不存在，创建一个
    const searchContainer = document.querySelector('.search-container');
    if (searchContainer) {
      const newNoResults = document.createElement('div');
      newNoResults.id = 'search-no-results';
      newNoResults.className = 'search-no-results';
      newNoResults.style.display = 'none';
      newNoResults.innerHTML = `
        <i class="bi bi-search"></i>
        <p>未找到相关网站</p>
        <span>请尝试其他关键词</span>
      `;
      searchContainer.appendChild(newNoResults);
      noResultsContainer = newNoResults;
    } else {
      return;
    }
  }

  if (results.length > 0) {
    resultsContainer.style.display = 'flex';
    noResultsContainer.style.display = 'none';

    let resultsHtml = `<div class="search-results-list">`;
    results.forEach(result => {
      // 安全地处理URL
      let urlString = '';
      if (result.url) {
        if (typeof result.url === 'string') {
          urlString = result.url;
        } else if (typeof result.url === 'object') {
          urlString = result.url.link || result.url.text || '';
        }
      }

      // 生成图标
      const faviconUrl = getFaviconUrl(result.url);
      let iconHtml = '';
      if (faviconUrl) {
        iconHtml = `<img src="${faviconUrl}" alt="${result.name}" class="search-result-icon" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">`;
      }

      // 生成文字图标作为备用
      if (result.name) {
        const textIconMatch = generateTextIcon(result.name).match(/>(.*?)</);
        const textIconText = textIconMatch ? textIconMatch[1] : result.name[0];
        iconHtml += `<div class="search-result-icon text-icon" style="width: 32px; height: 32px; font-size: 14px; ${faviconUrl ? 'display: none;' : ''}">${textIconText}</div>`;
      }

      resultsHtml += `
        <div class="search-result-item" onclick="openSearchResult('${urlString}')">
          ${iconHtml}
          <div class="search-result-info">
            <div class="search-result-name">${highlightSearchTerm(result.name, query)}</div>
            <div class="search-result-category">${result.category}</div>
          </div>
        </div>
      `;
    });
    resultsHtml += `</div>`;

    resultsContainer.innerHTML = resultsHtml;
  } else {
    noResultsContainer.style.display = 'flex';
    resultsContainer.style.display = 'none';
    //showSearchSuggestions();
  }
}

// 高亮搜索关键词
function highlightSearchTerm(text, term) {
  if (!term) return text;
  const regex = new RegExp(`(${term})`, 'gi');
  return text.replace(regex, '<mark style="background-color: #fff3cd; padding: 0 2px;">$1</mark>');
}

// 打开搜索结果
function openSearchResult(url) {
  let urlString = '';
  if (typeof url === 'string') {
    urlString = url;
  } else if (typeof url === 'object') {
    if (url.link && typeof url.link === 'string') {
      urlString = url.link;
    } else if (url.text && typeof url.text === 'string') {
      urlString = url.text;
    }
  }

  if (urlString) {
    window.open(urlString, '_blank', 'noopener,noreferrer');
    closeMobileSearch();
  }
}

// 清除搜索
function clearSearch() {
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.value = '';
    searchInput.focus();
    handleSearchInput({ target: searchInput });
  }
}

// 点击搜索建议
function searchSuggestion(term) {
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.value = term;
    handleSearchInput({ target: searchInput });
    // 自动执行搜索
    performSearch(term);
  }
}

// 显示搜索建议
function showSearchSuggestions() {
  const resultsContainer = document.getElementById('search-results');
  const noResultsContainer = document.getElementById('search-no-results');

  if (!noResultsContainer || !resultsContainer) {
    console.error('搜索容器未找到');
    return;
  }

  noResultsContainer.style.display = 'none';

  // 创建建议容器，而不是覆盖整个results容器
  let suggestionsHtml = `
    <div class="search-suggestions">
      <div class="suggestions-title">热门搜索</div>
      <div class="suggestions-list" id="suggestions-list">
  `;

  suggestionsHtml += `
      </div>
    </div>
  `;

  resultsContainer.innerHTML = suggestionsHtml;
}

// 切换移动端菜单显示/隐藏
function toggleMobileMenu() {
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('mobile-overlay');

  if (sidebar.classList.contains('active')) {
    closeMobileMenu();
  } else {
    openMobileMenu();
  }
}

// 打开移动端菜单
function openMobileMenu() {
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('mobile-overlay');

  hamburgerBtn.classList.add('active');
  sidebar.classList.add('active');
  overlay.classList.add('active');

  // 防止背景滚动
  document.body.style.overflow = 'hidden';
}

// 关闭移动端菜单
function closeMobileMenu() {
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('mobile-overlay');

  hamburgerBtn.classList.remove('active');
  sidebar.classList.remove('active');
  overlay.classList.remove('active');

  // 恢复背景滚动
  document.body.style.overflow = '';
}

// 处理窗口大小变化
function handleResize() {
  const sidebar = document.getElementById('sidebar');

  // 如果窗口变大（超过768px），自动关闭移动端菜单
  if (window.innerWidth > 768 && sidebar && sidebar.classList.contains('active')) {
    closeMobileMenu();
  }
}

// 监听窗口大小变化
window.addEventListener('resize', handleResize);

// 添加触摸手势支持
function addTouchGestureSupport() {
  let touchStartX = 0;
  let touchStartY = 0;
  let touchEndX = 0;
  let touchEndY = 0;

  // 为工具卡片添加涟漪效果
  function addRippleEffect(element) {
    element.classList.add('ripple');

    element.addEventListener('touchstart', function (e) {
      // 添加触摸震动反馈（如果支持）
      if (navigator.vibrate) {
        navigator.vibrate(10);
      }
    });
  }

  // 为所有工具卡片添加涟漪效果
  function initRippleEffects() {
    const toolItems = document.querySelectorAll('.tool-item');
    toolItems.forEach(addRippleEffect);
  }

  // 左右滑动切换分类
  function handleSwipeGesture() {
    const mainContent = document.querySelector('.main-content');
    if (!mainContent) return;

    mainContent.addEventListener('touchstart', function (e) {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    mainContent.addEventListener('touchend', function (e) {
      touchEndX = e.changedTouches[0].screenX;
      touchEndY = e.changedTouches[0].screenY;
      handleGesture();
    }, { passive: true });
  }

  function handleGesture() {
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    const minSwipeDistance = 50;

    // 确保是水平滑动而不是垂直滑动
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
      const currentIndex = categories.indexOf(currentCategory);

      if (deltaX > 0 && currentIndex > 0) {
        // 向右滑动，切换到上一个分类
        showTools(categories[currentIndex - 1]);
      } else if (deltaX < 0 && currentIndex < categories.length - 1) {
        // 向左滑动，切换到下一个分类
        showTools(categories[currentIndex + 1]);
      }
    }
  }

  // 初始化触摸手势
  initRippleEffects();
  handleSwipeGesture();

  // 监听DOM变化，为新添加的工具卡片添加涟漪效果
  const observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach(function (node) {
          if (node.nodeType === 1 && node.classList.contains('tool-item')) {
            addRippleEffect(node);
          }
        });
      }
    });
  });

  const toolsGrid = document.getElementById('tools-grid');
  if (toolsGrid) {
    observer.observe(toolsGrid, { childList: true });
  }
}

// 在初始化函数中调用触摸手势支持
function initTouchSupport() {
  // 检查是否为触摸设备
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
    addTouchGestureSupport();
  }
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

// 刷新工具图标
function refreshToolIcons() {
  // 获取当前分类
  const currentCategory = document.querySelector('.nav-menu li.active')?.getAttribute('data-category') || 'all';
  
  // 重新显示工具，这将重新生成图标
  showTools(currentCategory);
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
  
  // 设置标志，表示主题已初始化
  window.themeInitialized = true;
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function () {
  try {
    init();
  } catch (error) {
    console.error('初始化失败:', error);
    // 显示错误信息给用户
    const toolsGrid = document.getElementById('tools-grid');
    if (toolsGrid) {
      toolsGrid.innerHTML = `
        <div style="text-align: center; padding: 40px; color: #666;">
          <i class="bi bi-exclamation-triangle" style="font-size: 48px; margin-bottom: 20px; color: #ff4d4f;"></i>
          <h3>页面加载失败</h3>
          <p>请刷新页面重试</p>
          <button onclick="location.reload()" style="
            margin-top: 20px;
            padding: 10px 20px;
            background: #1677ff;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
          ">刷新页面</button>
        </div>
      `;
    }
  }
});

// 初始化主题模式
try {
  initTheme();
} catch (error) {
  console.error('主题初始化失败:', error);
}

// 添加全局错误处理
window.addEventListener('error', function (event) {
  console.error('全局错误:', event.error);
});

// 添加未处理的Promise错误处理
window.addEventListener('unhandledrejection', function (event) {
  console.error('未处理的Promise错误:', event.reason);
});

// 显示删除确认对话框
function showDeleteConfirmation(toolId, toolName) {
  const deleteModal = document.getElementById('delete-link-modal');
  const siteNameElement = document.getElementById('delete-site-name');

  if (!deleteModal || !siteNameElement) {
    console.error('删除确认对话框的DOM元素未找到');
    return;
  }

  // 设置要删除的网站名称
  siteNameElement.textContent = toolName;

  // 保存当前要删除的工具ID和名称
  deleteModal.dataset.toolId = toolId;
  deleteModal.dataset.toolName = toolName;

  // 显示模态框
  deleteModal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

// 隐藏删除确认对话框
function hideDeleteConfirmation() {
  const deleteModal = document.getElementById('delete-link-modal');

  if (!deleteModal) {
    console.error('删除确认对话框的DOM元素未找到');
    return;
  }

  // 隐藏模态框
  deleteModal.classList.remove('active');
  document.body.style.overflow = '';
}

// 删除网站
async function deleteTool(toolId, toolName) {
  if (!toolId) {
    showErrorMessage('无效的工具ID');
    return;
  }

  try {
    // 显示加载状态
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
    const originalText = confirmDeleteBtn.textContent;
    confirmDeleteBtn.textContent = '删除中...';
    confirmDeleteBtn.disabled = true;

    // 调用后端API
    const response = await fetch(`/api/links/${toolId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const result = await response.json();

    // 恢复按钮状态
    confirmDeleteBtn.textContent = originalText;
    confirmDeleteBtn.disabled = false;

    if (result.success) {
      // 显示成功提示
      showSuccessMessage(`网站 "${toolName}" 删除成功`);

      // 隐藏模态框
      hideDeleteConfirmation();

      // 刷新导航数据（强制刷新绕过缓存）
      await fetchNavigationData(true);
    } else {
      // 显示错误提示
      showErrorMessage(result.message || '删除网站失败');

      // 如果是模拟数据的ID，提示用户
      if (toolId.startsWith('mock_')) {
        showErrorMessage('这是演示数据，无法删除真实记录');
      }
    }
  } catch (error) {
    console.error('删除网站异常:', error);

    // 恢复按钮状态
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
    confirmDeleteBtn.textContent = '确认删除';
    confirmDeleteBtn.disabled = false;

    showErrorMessage('网络错误，请检查网络连接后重试');
  }
}

// 初始化删除网站功能
function initDeleteLinkFeature() {
  const deleteModal = document.getElementById('delete-link-modal');
  const closeDeleteModalBtn = document.getElementById('close-delete-modal-btn');
  const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
  const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
  const modalOverlay = deleteModal?.querySelector('.modal-overlay');

  // 检查元素是否存在
  if (!deleteModal || !closeDeleteModalBtn || !cancelDeleteBtn || !confirmDeleteBtn) {
    console.error('删除链接功能的DOM元素未找到');
    return;
  }

  // 关闭模态框事件
  const closeModalEvents = [
    { element: closeDeleteModalBtn, event: 'click' },
    { element: cancelDeleteBtn, event: 'click' },
    { element: modalOverlay, event: 'click' }
  ];

  closeModalEvents.forEach(({ element, event }) => {
    if (element) {
      element.addEventListener(event, (e) => {
        // 如果点击的是覆盖层，确保不是点击模态框内容
        if (element === modalOverlay && e.target !== modalOverlay) {
          return;
        }
        hideDeleteConfirmation();
      });
    }
  });

  // 确认删除事件
  confirmDeleteBtn.addEventListener('click', () => {
    const toolId = deleteModal.dataset.toolId || '';
    const toolName = deleteModal.dataset.toolName || '';

    if (toolId) {
      deleteTool(toolId, toolName);
    } else {
      showErrorMessage('无效的工具ID');
      hideDeleteConfirmation();
    }
  });
}

// 添加链接功能
function initAddLinkFeature() {
  const addLinkBtn = document.getElementById('add-link-btn');
  const addLinkModal = document.getElementById('add-link-modal');
  const closeModalBtn = document.getElementById('close-modal-btn');
  const cancelAddBtn = document.getElementById('cancel-add-btn');
  const saveLinkBtn = document.getElementById('save-link-btn');
  const addLinkForm = document.getElementById('add-link-form');
  const modalOverlay = document.querySelector('.modal-overlay');

  // 检查元素是否存在
  if (!addLinkBtn || !addLinkModal || !closeModalBtn || !cancelAddBtn || !saveLinkBtn || !addLinkForm) {
    console.error('添加链接功能的DOM元素未找到');
    return;
  }

  // 填充分类下拉菜单
  function populateCategories() {
    const categorySelect = document.getElementById('site-category');
    if (!categorySelect) return;

    // 清空现有选项
    categorySelect.innerHTML = '<option value="">请选择分类</option>';

    // 添加现有分类
    if (categories && categories.length > 0) {
      categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
      });
    } else {
      // 如果没有分类数据，添加默认分类
      const defaultCategories = ['主页', '工具', '文档', '社交', '娱乐', '其他'];
      defaultCategories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
      });
    }
  }

  // 显示模态框
  function showModal() {
    addLinkModal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // 填充分类
    populateCategories();

    // 清空表单
    addLinkForm.reset();
    clearErrors();

    // 聚焦到第一个输入框
    setTimeout(() => {
      document.getElementById('site-name')?.focus();
    }, 300);
  }

  // 隐藏模态框
  function hideModal() {
    addLinkModal.classList.remove('active');
    document.body.style.overflow = '';
    clearErrors();
  }

  // 清除错误提示
  function clearErrors() {
    const nameError = document.getElementById('name-error');
    const urlError = document.getElementById('url-error');
    const categoryError = document.getElementById('category-error');

    if (nameError) nameError.textContent = '';
    if (urlError) urlError.textContent = '';
    if (categoryError) categoryError.textContent = '';
  }

  // 显示错误提示
  function showError(fieldId, message) {
    const errorElement = document.getElementById(`${fieldId}-error`);
    if (errorElement) {
      errorElement.textContent = message;
    }
  }

  // 验证表单
  function validateForm() {
    let isValid = true;
    clearErrors();

    // 验证网站名称
    const siteName = document.getElementById('site-name').value.trim();
    if (!siteName) {
      showError('name', '请输入网站名称');
      isValid = false;
    } else if (siteName.length > 50) {
      showError('name', '网站名称长度不能超过50个字符');
      isValid = false;
    }

    // 验证网址
    const siteUrl = document.getElementById('site-url').value.trim();
    if (!siteUrl) {
      showError('url', '请输入网站网址');
      isValid = false;
    } else {
      try {
        new URL(siteUrl);
      } catch (e) {
        showError('url', '无效的网址格式，请确保包含http://或https://');
        isValid = false;
      }
    }

    // 验证分类
    const siteCategory = document.getElementById('site-category').value;
    if (!siteCategory) {
      showError('category', '请选择分类');
      isValid = false;
    }

    return isValid;
  }

  // 提交表单
  async function submitForm() {
    if (!validateForm()) {
      return;
    }

    // 收集表单数据
    const formData = {
      name: document.getElementById('site-name').value.trim(),
      url: document.getElementById('site-url').value.trim(),
      category: document.getElementById('site-category').value,
      sort: document.getElementById('site-sort').value ? parseInt(document.getElementById('site-sort').value) : 200
    };

    // 禁用保存按钮，防止重复提交
    saveLinkBtn.disabled = true;
    saveLinkBtn.textContent = '保存中...';

    try {
      // 调用后端API
      const response = await fetch('/api/links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success) {
        // 显示成功提示
        showSuccessMessage('链接添加成功');

        // 隐藏模态框
        hideModal();

        // 刷新导航数据（强制刷新绕过缓存）
        await fetchNavigationData(true);
      } else {
        // 显示错误提示
        showErrorMessage(result.message || '添加链接失败');
      }
    } catch (error) {
      console.error('添加链接异常:', error);
      showErrorMessage('网络错误，请检查网络连接后重试');
    } finally {
      // 恢复保存按钮状态
      saveLinkBtn.disabled = false;
      saveLinkBtn.textContent = '保存';
    }
  }



  // 添加事件监听器
  addLinkBtn.addEventListener('click', showModal);
  closeModalBtn.addEventListener('click', hideModal);
  cancelAddBtn.addEventListener('click', hideModal);
  saveLinkBtn.addEventListener('click', submitForm);
  modalOverlay.addEventListener('click', hideModal);

  // 阻止模态框内容点击事件冒泡到遮罩层
  addLinkModal.querySelector('.modal-content').addEventListener('click', function (e) {
    e.stopPropagation();
  });

  // ESC键关闭模态框
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && addLinkModal.classList.contains('active')) {
      hideModal();
    }
  });

  // 表单提交事件
  addLinkForm.addEventListener('submit', function (e) {
    e.preventDefault();
    submitForm();
  });

  // 实时验证
  document.getElementById('site-name').addEventListener('input', function () {
    const value = this.value.trim();
    if (value.length > 50) {
      showError('name', '网站名称长度不能超过50个字符');
    } else {
      document.getElementById('name-error').textContent = '';
    }
  });

  document.getElementById('site-url').addEventListener('input', function () {
    const value = this.value.trim();
    if (value) {
      try {
        new URL(value);
        document.getElementById('url-error').textContent = '';
      } catch (e) {
        showError('url', '无效的网址格式，请确保包含http://或https://');
      }
    } else {
      document.getElementById('url-error').textContent = '';
    }
  });
}

// 显示成功消息
function showSuccessMessage(message) {
  // 移除已存在的成功消息
  const existingMessages = document.querySelectorAll('.success-message');
  existingMessages.forEach(msg => msg.remove());

  const messageElement = document.createElement('div');
  messageElement.className = 'success-message';
  messageElement.innerHTML = `
    <i class="bi bi-check-circle"></i>
    <span>${message}</span>
  `;

  // 添加样式
  Object.assign(messageElement.style, {
    position: 'fixed',
    top: '20px',
    right: '20px',
    backgroundColor: '#52c41a',
    color: 'white',
    padding: '12px 20px',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    zIndex: '1004',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    animation: 'fadeInSlideIn 0.3s ease',
    maxWidth: '300px'
  });

  // 添加动画样式
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeInSlideIn {
      from {
        opacity: 0;
        transform: translateX(100%);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
    @keyframes fadeOutSlideOut {
      from {
        opacity: 1;
        transform: translateX(0);
      }
      to {
        opacity: 0;
        transform: translateX(100%);
      }
    }
  `;
  document.head.appendChild(style);

  // 添加到页面
  document.body.appendChild(messageElement);

  // 3秒后自动移除
  setTimeout(() => {
    messageElement.style.animation = 'fadeOutSlideOut 0.3s ease';
    setTimeout(() => {
      messageElement.remove();
    }, 300);
  }, 3000);
}

// 使用默认导航数据
function useDefaultNavigationData() {
  console.log('使用默认导航数据');
  
  // 默认分类
  categories = ['Code', '设计', '工具', '学习'];
  
  // 默认导航数据
  navigationData = {
    'Code': [
      { name: 'GitHub', url: 'https://github.com', icon: '🐙' },
      { name: 'Stack Overflow', url: 'https://stackoverflow.com', icon: '📚' },
      { name: 'VS Code', url: 'https://code.visualstudio.com', icon: '💻' }
    ],
    '设计': [
      { name: 'Figma', url: 'https://figma.com', icon: '🎨' },
      { name: 'Dribbble', url: 'https://dribbble.com', icon: '🏀' },
      { name: 'Behance', url: 'https://behance.net', icon: '📐' }
    ],
    '工具': [
      { name: 'Google', url: 'https://google.com', icon: '🔍' },
      { name: '翻译', url: 'https://translate.google.com', icon: '🌐' },
      { name: '时间', url: 'https://time.is', icon: '⏰' }
    ],
    '学习': [
      { name: 'MDN', url: 'https://developer.mozilla.org', icon: '📖' },
      { name: 'W3Schools', url: 'https://w3schools.com', icon: '🎓' },
      { name: 'FreeCodeCamp', url: 'https://freecodecamp.org', icon: '💡' }
    ]
  };
  
  // 缓存数据
  dataCache = {
    data: navigationData,
    categories: categories,
    dateInfo: {
      date: '12月25日',
      weekday: '星期一',
      lunarDate: '腊月初五'
    }
  };
  cacheTimestamp = Date.now();
  
  // 生成分类菜单
  generateCategoryMenu();
  
  // 显示所有工具
  showTools('all');
  
  // 更新日期信息
  updateDateInfo(dataCache.dateInfo);
}

// 显示错误消息
function showErrorMessage(message) {
  // 移除已存在的错误消息
  const existingMessages = document.querySelectorAll('.error-message');
  existingMessages.forEach(msg => msg.remove());

  const messageElement = document.createElement('div');
  messageElement.className = 'error-message';
  messageElement.innerHTML = `
    <i class="bi bi-exclamation-circle"></i>
    <span>${message}</span>
  `;

  // 添加样式
  Object.assign(messageElement.style, {
    position: 'fixed',
    top: '20px',
    right: '20px',
    backgroundColor: '#ff4d4f',
    color: 'white',
    padding: '12px 20px',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    zIndex: '1004',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    animation: 'fadeInSlideIn 0.3s ease',
    maxWidth: '300px'
  });

  // 添加动画样式
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeInSlideIn {
      from {
        opacity: 0;
        transform: translateX(100%);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
    @keyframes fadeOutSlideOut {
      from {
        opacity: 1;
        transform: translateX(0);
      }
      to {
        opacity: 0;
        transform: translateX(100%);
      }
    }
  `;
  document.head.appendChild(style);

  // 添加到页面
  document.body.appendChild(messageElement);

  // 5秒后自动移除
  setTimeout(() => {
    messageElement.style.animation = 'fadeOutSlideOut 0.3s ease';
    setTimeout(() => {
      messageElement.remove();
    }, 300);
  }, 5000);
}

// 在数据加载完成后初始化添加链接功能
function initAddLinkFeatureAfterDataLoaded() {
  // 检查是否有分类数据
  if (categories && categories.length > 0) {
    initAddLinkFeature();
  } else {
    // 如果没有分类数据，等待数据加载
    const checkInterval = setInterval(() => {
      if (categories && categories.length > 0) {
        clearInterval(checkInterval);
        initAddLinkFeature();
      }
    }, 500);

    // 5秒后超时
    setTimeout(() => {
      clearInterval(checkInterval);
      initAddLinkFeature();
    }, 5000);
  }
}

// 在页面加载完成后初始化添加和删除链接功能
document.addEventListener('DOMContentLoaded', function () {
  // 延迟初始化，确保数据已经加载
  setTimeout(initAddLinkFeatureAfterDataLoaded, 1000);

  // 初始化删除网站功能
  initDeleteLinkFeature();
});

// 性能监控
if ('performance' in window) {
  window.addEventListener('load', function () {
    setTimeout(function () {
      const perfData = performance.getEntriesByType('navigation')[0];
      console.log('页面加载性能:', {
        domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
        loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
        totalTime: perfData.loadEventEnd - perfData.fetchStart
      });
    }, 0);
  });
}

// 粒子系统功能
function initParticles() {
  const particlesContainer = document.createElement('div');
  particlesContainer.className = 'particles';
  particlesContainer.id = 'particles';
  document.body.appendChild(particlesContainer);

  // 创建网格背景
  const gridBg = document.createElement('div');
  gridBg.className = 'grid-bg';
  document.body.appendChild(gridBg);

  // 创建粒子
  function createParticle() {
    const particle = document.createElement('div');
    particle.className = 'particle';
    
    // 随机大小 (2-6px)
    const size = Math.random() * 4 + 2;
    particle.style.width = size + 'px';
    particle.style.height = size + 'px';
    
    // 随机位置
    particle.style.left = Math.random() * 100 + '%';
    
    // 随机动画延迟
    particle.style.animationDelay = Math.random() * 6 + 's';
    
    // 随机动画持续时间
    particle.style.animationDuration = (Math.random() * 3 + 4) + 's';
    
    particlesContainer.appendChild(particle);
    
    // 动画结束后移除粒子
    setTimeout(() => {
      if (particle.parentNode) {
        particle.parentNode.removeChild(particle);
      }
    }, 8000);
  }

  // 定期创建新粒子
  function generateParticles() {
    // 创建 3-8 个粒子
    const particleCount = Math.floor(Math.random() * 6) + 3;
    for (let i = 0; i < particleCount; i++) {
      setTimeout(() => createParticle(), i * 200);
    }
  }

  // 立即开始生成粒子
  generateParticles();
  
  // 每 3 秒生成一批新粒子
  setInterval(generateParticles, 3000);
}
