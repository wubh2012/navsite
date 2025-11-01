/**
 * UI渲染器 - 处理DOM元素渲染、工具项生成、分类菜单等
 */
class UIRenderer {
  constructor(dataManager) {
    this.dataManager = dataManager;
    this.currentCategory = 'all';
    this.faviconCache = new Map();
    
    // DOM元素引用
    this.categoryMenu = document.getElementById('category-menu');
    this.toolsGrid = document.getElementById('tools-grid');
    this.currentTimeEl = document.getElementById('current-time');
    this.dateInfoEl = document.getElementById('date-info');
  }

  // 生成分类菜单
  generateCategoryMenu() {
    if (!this.categoryMenu) return;
    
    const { categories } = this.dataManager.getCurrentData();
    
    // 保留第一个"主页"菜单项
    const homeMenuItem = this.categoryMenu.firstElementChild;
    this.categoryMenu.innerHTML = '';
    if (homeMenuItem) {
      this.categoryMenu.appendChild(homeMenuItem);
    }

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
      li.addEventListener('click', () => this.showTools(category));
      this.categoryMenu.appendChild(li);
    });
  }

  // 显示工具
  showTools(category) {
    // 更新当前分类
    this.currentCategory = category;

    // 更新菜单项激活状态
    const menuItems = this.categoryMenu.querySelectorAll('li');
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
    this.toolsGrid.innerHTML = '';

    const { navigationData, categories } = this.dataManager.getCurrentData();

    // 显示所有分类或特定分类的工具
    if (category === 'all') {
      // 显示所有分类的工具
      categories.forEach(cat => {
        const tools = navigationData[cat] || [];
        tools.forEach(tool => this.addToolItem(tool));
      });
    } else {
      // 显示特定分类的工具
      const tools = navigationData[category] || [];
      tools.forEach(tool => this.addToolItem(tool));
    }
  }

  // 获取网站favicon的URL
  getFaviconUrl(url) {
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
      if (this.faviconCache.has(cacheKey)) {
        return this.faviconCache.get(cacheKey);
      }

      // 检查LocalStorage缓存
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const cacheData = JSON.parse(cached);
          // 检查缓存是否过期（24小时）
          if (Date.now() - cacheData.timestamp < 24 * 60 * 60 * 1000) {
            this.faviconCache.set(cacheKey, cacheData.url);
            return cacheData.url;
          }
        }
      } catch (e) {
        // 静默处理LocalStorage错误
      }

      // 使用Google的favicon服务作为主要方案
      const googleFaviconUrl = `https://www.google.com/s2/favicons?sz=48&domain_url=${url}`;

      // 预缓存到内存（使用Google服务）
      this.faviconCache.set(cacheKey, googleFaviconUrl);

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
  generateTextIcon(name) {
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
  addToolItem(tool) {
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

    if (tool.icon && typeof tool.icon === 'string' && tool.icon.trim()) {
      // 如果是URL，使用img标签      
      if (tool.icon.startsWith('http')) {
        iconHtml = `<img src="${tool.icon}" alt="${tool.name}" class="tool-icon">`;
      } else {
        // 否则假设是Bootstrap图标类名
        iconHtml = `<i class="bi ${tool.icon} tool-icon"></i>`;
      }
    } else {
      // 尝试使用网站的favicon
      const faviconUrl = this.getFaviconUrl(tool.url);      
      if (faviconUrl) {
        // 添加onerror处理，当图标加载失败时显示文字图标
        iconHtml = `<img src="${faviconUrl}" alt="${tool.name}" class="tool-icon" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">`;
        useFavicon = true;
      }

      // 添加文字图标作为备用或默认选项
      // 如果工具名称为空则跳过生成图标
      if (tool.name) {
        const textIconHtml = this.generateTextIcon(tool.name);
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
      if (window.linkManager) {
        window.linkManager.showDeleteConfirmation(tool.id || '', tool.name || '');
      }
    });

    // 组装工具项
    toolItem.appendChild(linkElement);
    toolItem.appendChild(deleteBtn);

    this.toolsGrid.appendChild(toolItem);
  }

  // 显示加载动画
  showLoadingAnimation() {
    if (!this.toolsGrid) return;
    
    this.toolsGrid.innerHTML = `
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
  hideLoadingAnimation() {
    if (!this.toolsGrid) return;
    
    const loadingContainer = this.toolsGrid.querySelector('.loading-container');
    if (loadingContainer) {
      loadingContainer.remove();
    }
  }

  // 显示错误信息
  showError(message) {
    if (!this.toolsGrid) return;
    
    this.toolsGrid.innerHTML = `
      <div style="text-align: center; width: 100%; padding: 30px;">
        <i class="bi bi-exclamation-triangle" style="font-size: 48px; color: #ff4d4f; margin-bottom: 20px;"></i>
        <p style="color: #666;">${message}</p>
      </div>
    `;
  }

  // 更新时间信息
  updateTimeInfo() {
    if (!this.currentTimeEl) return;
    
    const now = new Date();

    // 更新当前时间
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    this.currentTimeEl.textContent = `${hours}:${minutes}:${seconds}`;

    // 如果有缓存数据，使用缓存的日期信息
    const { dataCache } = this.dataManager.getCurrentData();
    if (dataCache && dataCache.dateInfo) {
      this.updateDateInfo(dataCache.dateInfo);
    } else {
      // 更新日期信息（使用静态值作为fallback）
      const month = now.getMonth() + 1;
      const date = now.getDate();
      const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
      const weekday = weekdays[now.getDay()];
      const lunarDate = '闰六月十八'; // 示例值
      if (this.dateInfoEl) {
        this.dateInfoEl.textContent = `${month} 月 ${date} 日 ${weekday} ${lunarDate}`;
      }
    }
  }

  // 更新日期信息
  updateDateInfo(dateInfo) {
    if (this.dateInfoEl && dateInfo) {
      this.dateInfoEl.textContent = `${dateInfo.date} ${dateInfo.weekday} ${dateInfo.lunarDate}`;
    }
  }

  // 立即更新时间信息
  updateTimeInfoImmediately() {
    if (this.currentTimeEl && this.dateInfoEl) {
      const now = new Date();

      // 更新当前时间
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      this.currentTimeEl.textContent = `${hours}:${minutes}:${seconds}`;

      // 更新日期信息
      const month = now.getMonth() + 1;
      const date = now.getDate();
      const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
      const weekday = weekdays[now.getDay()];

      // 如果有缓存数据，使用缓存的日期信息
      const { dataCache } = this.dataManager.getCurrentData();
      if (dataCache && dataCache.dateInfo) {
        this.dateInfoEl.textContent = `${dataCache.dateInfo.date} ${dataCache.dateInfo.weekday} ${dataCache.dateInfo.lunarDate}`;
      } else {
        // 这里使用固定的农历日期，实际应用中可以使用专门的农历转换库
        const lunarDate = '闰六月十八'; // 示例值
        this.dateInfoEl.textContent = `${month} 月 ${date} 日 ${weekday} ${lunarDate}`;
      }
    }
  }

  // 刷新工具图标
  refreshToolIcons() {
    // 重新显示工具，这将重新生成图标
    this.showTools(this.currentCategory);
  }

  // 获取当前分类
  getCurrentCategory() {
    return this.currentCategory;
  }
}

// 导出UI渲染器
window.UIRenderer = UIRenderer;