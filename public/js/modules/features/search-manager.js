/**
 * 搜索管理器 - 处理移动端搜索功能
 */
class SearchManager {
  constructor(dataManager) {
    this.dataManager = dataManager;
    this.init();
  }

  init() {
    this.bindSearchEvents();
  }

  // 绑定搜索事件
  bindSearchEvents() {
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
      searchBtn.addEventListener('click', (e) => {
        console.log('搜索按钮被点击');
        e.preventDefault();
        e.stopPropagation();
        this.openMobileSearch();
      });

      // 返回按钮点击事件
      if (searchBackBtn) {
        searchBackBtn.addEventListener('click', (e) => {
          console.log('返回按钮被点击');
          e.preventDefault();
          e.stopPropagation();
          this.closeMobileSearch();
        });
      }

      // 搜索输入框事件
      if (searchInput) {
        searchInput.addEventListener('input', (e) => this.handleSearchInput(e));
        searchInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            const query = searchInput.value.trim();
            if (query) {
              console.log('回车键搜索:', query);
              this.performSearch(query);
            }
          }
        });
        // 添加keypress事件作为备用，确保移动端回车键能被捕获
        searchInput.addEventListener('keypress', (e) => {
          if (e.key === 'Enter' || e.keyCode === 13) {
            e.preventDefault();
            const query = searchInput.value.trim();
            if (query) {
              console.log('keypress回车键搜索:', query);
              this.performSearch(query);
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
        searchClearBtn.addEventListener('click', () => this.clearSearch());
      }

      // ESC键关闭搜索
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && searchContainer.classList.contains('active')) {
          this.closeMobileSearch();
        }
      });
    } else {
      console.error('搜索按钮或搜索容器未找到');
      console.error('searchBtn:', searchBtn);
      console.error('searchContainer:', searchContainer);
    }
  }

  // 打开移动端搜索
  openMobileSearch() {
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
  closeMobileSearch() {
    const searchContainer = document.getElementById('mobile-search');
    const searchInput = document.getElementById('search-input');

    if (searchContainer) {
      searchContainer.classList.remove('active');
      document.body.style.overflow = '';

      // 清空搜索内容
      if (searchInput) {
        searchInput.value = '';
        this.handleSearchInput({ target: searchInput });
      }
    }
  }

  // 处理搜索输入
  handleSearchInput(e) {
    const query = e.target.value.trim();
    const clearBtn = document.getElementById('search-clear-btn');

    // 显示/隐藏清除按钮
    if (clearBtn) {
      if (query) {
        clearBtn.classList.add('visible');
      } else {
        clearBtn.classList.remove('visible');
      }
    }

    // 执行搜索
    if (query.length > 0) {
      this.performSearch(query);
    } else {
      this.showSearchSuggestions();
    }
  }

  // 执行搜索
  performSearch(query) {
    console.log('执行搜索，关键词:', query);
    
    const { navigationData, categories } = this.dataManager.getCurrentData();
    
    console.log('当前数据状态:', { navigationData, categories });

    const searchResults = [];

    // 检查数据是否已加载
    if (!navigationData || Object.keys(navigationData).length === 0) {
      console.log('导航数据为空，尝试重新获取数据');
      // 如果数据为空，尝试重新获取
      this.dataManager.fetchNavigationData().then(() => {
        const updatedData = this.dataManager.getCurrentData();
        if (updatedData.navigationData && Object.keys(updatedData.navigationData).length > 0) {
          this.performSearch(query); // 递归调用
        } else {
          console.log('重新获取数据失败');
          this.displaySearchResults([], query);
        }
      });
      return;
    }

    const searchCategories = categories && categories.length > 0 ? categories : Object.keys(navigationData);
    console.log('开始在以下分类中搜索:', searchCategories);

    // 在所有分类中搜索
    searchCategories.forEach(category => {
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
    this.displaySearchResults(searchResults, query);
  }

  // 显示搜索结果
  displaySearchResults(results, query) {
    const resultsContainer = document.getElementById('search-results');
    const noResultsContainer = document.getElementById('search-no-results');

    if (!resultsContainer) {
      console.error('搜索结果容器未找到');
      return;
    }

    let actualNoResultsContainer = noResultsContainer;
    if (!actualNoResultsContainer) {
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
        actualNoResultsContainer = newNoResults;
      } else {
        return;
      }
    }

    if (results.length > 0) {
      resultsContainer.style.display = 'flex';
      actualNoResultsContainer.style.display = 'none';

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
        const faviconUrl = this.getFaviconUrl(result.url);
        let iconHtml = '';
        if (faviconUrl) {
          iconHtml = `<img src="${faviconUrl}" alt="${result.name}" class="search-result-icon" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">`;
        }

        // 生成文字图标作为备用
        if (result.name) {
          const textIconMatch = this.generateTextIcon(result.name).match(/>(.*?)</);
          const textIconText = textIconMatch ? textIconMatch[1] : result.name[0];
          iconHtml += `<div class="search-result-icon text-icon" style="width: 32px; height: 32px; font-size: 14px; ${faviconUrl ? 'display: none;' : ''}">${textIconText}</div>`;
        }

        resultsHtml += `
          <div class="search-result-item" onclick="window.searchManager.openSearchResult('${urlString}')">
            ${iconHtml}
            <div class="search-result-info">
              <div class="search-result-name">${this.highlightSearchTerm(result.name, query)}</div>
              <div class="search-result-category">${result.category}</div>
            </div>
          </div>
        `;
      });
      resultsHtml += `</div>`;

      resultsContainer.innerHTML = resultsHtml;
    } else {
      actualNoResultsContainer.style.display = 'flex';
      resultsContainer.style.display = 'none';
    }
  }

  // 高亮搜索关键词
  highlightSearchTerm(text, term) {
    if (!term) return text;
    const regex = new RegExp(`(${term})`, 'gi');
    return text.replace(regex, '<mark style="background-color: #fff3cd; padding: 0 2px;">$1</mark>');
  }

  // 打开搜索结果
  openSearchResult(url) {
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
      this.closeMobileSearch();
    }
  }

  // 清除搜索
  clearSearch() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.value = '';
      searchInput.focus();
      this.handleSearchInput({ target: searchInput });
    }
  }

  // 显示搜索建议
  showSearchSuggestions() {
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
        </div>
      </div>
    `;

    resultsContainer.innerHTML = suggestionsHtml;
  }

  // 获取网站favicon的URL（复用UIRenderer的逻辑）
  getFaviconUrl(url) {
    // 这里可以复用UIRenderer的favicon逻辑
    if (window.uiRenderer && window.uiRenderer.getFaviconUrl) {
      return window.uiRenderer.getFaviconUrl(url);
    }
    return null;
  }

  // 生成文字图标（复用UIRenderer的逻辑）
  generateTextIcon(name) {
    // 这里可以复用UIRenderer的文字图标逻辑
    if (window.uiRenderer && window.uiRenderer.generateTextIcon) {
      return window.uiRenderer.generateTextIcon(name);
    }
    return `<div class="text-icon">${name[0]}</div>`;
  }
}

// 导出搜索管理器
window.SearchManager = SearchManager;