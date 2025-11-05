/**
 * 数据管理器 - 处理导航数据获取、缓存、默认数据等
 */
class DataManager {
  constructor() {
    this.navigationData = {};
    this.categories = [];
    this.CACHE_DURATION = 5 * 60 * 1000; // 缓存5分钟
    this.CACHE_KEY = 'navsite_navigation_cache'; // LocalStorage键名
  }

  // 从LocalStorage读取缓存数据
  readCacheFromStorage() {
    try {
      const cachedData = localStorage.getItem(this.CACHE_KEY);
      if (!cachedData) return null;
      
      const parsedData = JSON.parse(cachedData);
      
      // 检查缓存是否过期
      if (Date.now() - parsedData.timestamp > this.CACHE_DURATION) {
        localStorage.removeItem(this.CACHE_KEY); // 删除过期缓存
        return null;
      }
      
      return parsedData;
    } catch (error) {
      console.warn('读取缓存数据失败:', error);
      localStorage.removeItem(this.CACHE_KEY); // 删除损坏的缓存
      return null;
    }
  }

  // 将缓存数据写入LocalStorage
  writeCacheToStorage(data, categories, dateInfo) {
    try {
      const cacheData = {
        data: data,
        categories: categories,
        dateInfo: dateInfo,
        timestamp: Date.now()
      };
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('写入缓存数据失败:', error);
      // 静默处理写入失败，不影响主要功能
    }
  }

  // 获取导航数据
  async fetchNavigationData(forceRefresh = false) {
    // 检查是否强制刷新
    if (!forceRefresh) {
      // 尝试从LocalStorage读取缓存
      const cachedData = this.readCacheFromStorage();
      if (cachedData) {
        console.log('使用LocalStorage缓存数据');
        this.navigationData = cachedData.data;
        this.categories = cachedData.categories;
        return {
          success: true,
          data: this.navigationData,
          categories: this.categories,
          dateInfo: cachedData.dateInfo,
          fromCache: true
        };
      }
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
        const isMockData = result.isMockData;

        // 只有非模拟数据才进行缓存
        if (!isMockData) {
          console.log('非模拟数据，开始缓存...');
          this.writeCacheToStorage(result.data, result.categories, result.dateInfo);
        } else {
          console.log('检测到模拟数据，不进行缓存');
        }

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
    
    // 默认数据不再缓存，以便下次尝试从API获取最新数据
    
    return {
      success: true,
      data: this.navigationData,
      categories: this.categories,
      dateInfo: {
        date: '12月25日',
        weekday: '星期一',
        lunarDate: '腊月初五'
      },
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
    try {
      localStorage.removeItem(this.CACHE_KEY);
      console.log('已清除LocalStorage缓存');
    } catch (error) {
      console.warn('清除缓存失败:', error);
    }
  }

  // 获取当前数据
  getCurrentData() {
    return {
      navigationData: this.navigationData,
      categories: this.categories
    };
  }

  // 检查缓存是否有效
  isCacheValid() {
    const cachedData = this.readCacheFromStorage();
    return cachedData !== null;
  }
}

// 导出数据管理器
window.DataManager = DataManager;