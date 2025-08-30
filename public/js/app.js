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

// 初始化函数
async function init() {
  // 获取导航数据
  await fetchNavigationData();
  
  // 更新时间信息
  updateTimeInfo();
  setInterval(updateTimeInfo, 1000); // 每秒更新一次
  
  // 添加事件监听器
  addEventListeners();
  
  // 初始化触摸支持
  initTouchSupport();
}

// 获取导航数据
async function fetchNavigationData() {
  // 检查缓存是否有效
  if (dataCache && cacheTimestamp && (Date.now() - cacheTimestamp < CACHE_DURATION)) {
    console.log('使用缓存数据');
    navigationData = dataCache.data;
    categories = dataCache.categories;
    
    // 生成分类菜单
    generateCategoryMenu();
    
    // 显示所有工具
    showTools('all');
    return;
  }

  // 显示加载动画
  showLoadingAnimation();
  
  try {
    const response = await fetch('/api/navigation');
    const result = await response.json();
    console.log('获取导航数据:', result);
    
    if (result.success) {
      navigationData = result.data;
      categories = result.categories;
      
      // 缓存数据
      dataCache = {
        data: result.data,
        categories: result.categories
      };
      cacheTimestamp = Date.now();
      
      // 隐藏加载动画
      hideLoadingAnimation();
      
      // 生成分类菜单
      generateCategoryMenu();
      
      // 显示所有工具
      showTools('all');
    } else {
      console.error('获取导航数据失败:', result.message);
      hideLoadingAnimation();
      showError('获取数据失败，请刷新页面重试');
    }
  } catch (error) {
    console.error('获取导航数据异常:', error);
    hideLoadingAnimation();
    showError('网络错误，请检查网络连接后重试');
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
    // 使用Google的favicon服务作为主要方案 `https://www.google.com/s2/favicons?sz=32&domain_url=${hostname}`;
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
    searchBtn.addEventListener('click', function(e) {
      console.log('搜索按钮被点击');
      e.preventDefault();
      e.stopPropagation();
      openMobileSearch();
    });
    
    // 返回按钮点击事件
    if (searchBackBtn) {
      searchBackBtn.addEventListener('click', function(e) {
        console.log('返回按钮被点击');
        e.preventDefault();
        e.stopPropagation();
        closeMobileSearch();
      });
    }
    
    // 搜索输入框事件
    if (searchInput) {
      searchInput.addEventListener('input', handleSearchInput);
      searchInput.addEventListener('keydown', function(e) {
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
      searchInput.addEventListener('keypress', function(e) {
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
    
    element.addEventListener('touchstart', function(e) {
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
    
    mainContent.addEventListener('touchstart', function(e) {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });
    
    mainContent.addEventListener('touchend', function(e) {
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
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach(function(node) {
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
document.addEventListener('DOMContentLoaded', function() {
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
window.addEventListener('error', function(event) {
  console.error('全局错误:', event.error);
});

// 添加未处理的Promise错误处理
window.addEventListener('unhandledrejection', function(event) {
  console.error('未处理的Promise错误:', event.reason);
});

// 性能监控
if ('performance' in window) {
  window.addEventListener('load', function() {
    setTimeout(function() {
      const perfData = performance.getEntriesByType('navigation')[0];
      console.log('页面加载性能:', {
        domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
        loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
        totalTime: perfData.loadEventEnd - perfData.fetchStart
      });
    }, 0);
  });
}
