/**
 * 数据管理器 - 处理导航数据获取、缓存、默认数据等
 */
class DataManager {
  constructor() {
    this.navigationData = {};
    this.categories = [];
    this.dataCache = null;
    this.cacheTimestamp = null;
    this.CACHE_DURATION = 5 * 60 * 1000; // 缓存5分钟
  }

  // 获取导航数据
  async fetchNavigationData(forceRefresh = false) {
    // 检查缓存是否有效（除非强制刷新）
    if (!forceRefresh && this.dataCache && this.cacheTimestamp && 
        (Date.now() - this.cacheTimestamp < this.CACHE_DURATION)) {
      console.log('使用缓存数据');
      this.navigationData = this.dataCache.data;
      this.categories = this.dataCache.categories;
      return {
        success: true,
        data: this.navigationData,
        categories: this.categories,
        dateInfo: this.dataCache.dateInfo,
        fromCache: true
      };
    }

    try {
      const response = await fetch('/api/navigation');
      
      // 检查响应状态
      if (!response.ok) {
        console.warn(`API 请求失败: ${response.status} ${response.statusText}`);
        return this.useDefaultNavigationData();
      }
      
      // 检查内容类型
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.warn('API 返回非 JSON 数据，使用默认数据');
        return this.useDefaultNavigationData();
      }
      
      const result = await response.json();
      console.log('获取导航数据:', result);

      if (result.success) {
        this.navigationData = result.data;
        this.categories = result.categories;

        // 缓存数据
        this.dataCache = {
          data: result.data,
          categories: result.categories,
          dateInfo: result.dateInfo
        };
        this.cacheTimestamp = Date.now();

        return result;
      } else {
        console.warn('获取导航数据失败:', result.message);
        return this.useDefaultNavigationData();
      }
    } catch (error) {
      console.warn('获取导航数据异常:', error);
      return this.useDefaultNavigationData();
    }
  }

  // 使用默认导航数据
  useDefaultNavigationData() {
    console.log('使用默认导航数据');
    
    // 默认分类
    this.categories = ['Code', '设计', '工具', '学习'];
    
    // 默认导航数据
    this.navigationData = {
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
    this.dataCache = {
      data: this.navigationData,
      categories: this.categories,
      dateInfo: {
        date: '12月25日',
        weekday: '星期一',
        lunarDate: '腊月初五'
      }
    };
    this.cacheTimestamp = Date.now();
    
    return {
      success: true,
      data: this.navigationData,
      categories: this.categories,
      dateInfo: this.dataCache.dateInfo,
      fromDefault: true
    };
  }

  // 添加链接
  async addLink(linkData) {
    try {
      const response = await fetch('/api/links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(linkData)
      });

      const result = await response.json();
      
      if (result.success) {
        // 清除缓存，强制下次重新获取数据
        this.clearCache();
      }
      
      return result;
    } catch (error) {
      console.error('添加链接异常:', error);
      return {
        success: false,
        message: '网络错误，请检查网络连接后重试'
      };
    }
  }

  // 删除链接
  async deleteLink(linkId) {
    try {
      const response = await fetch(`/api/links/${linkId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      
      if (result.success) {
        // 清除缓存，强制下次重新获取数据
        this.clearCache();
      }
      
      return result;
    } catch (error) {
      console.error('删除链接异常:', error);
      return {
        success: false,
        message: '网络错误，请检查网络连接后重试'
      };
    }
  }

  // 清除缓存
  clearCache() {
    this.dataCache = null;
    this.cacheTimestamp = null;
  }

  // 获取当前数据
  getCurrentData() {
    return {
      navigationData: this.navigationData,
      categories: this.categories,
      dataCache: this.dataCache
    };
  }

  // 检查缓存是否有效
  isCacheValid() {
    return this.dataCache && this.cacheTimestamp && 
           (Date.now() - this.cacheTimestamp < this.CACHE_DURATION);
  }
}

// 导出数据管理器
window.DataManager = DataManager;