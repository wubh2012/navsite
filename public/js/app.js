/**
 * 主应用程序 - 重构后的模块化版本
 * 负责加载所有模块并初始化应用程序
 */

// 加载模块脚本
function loadModules() {
  const modules = [
    // 核心模块
    '/js/modules/core/pwa-manager.js',
    '/js/modules/core/theme-manager.js', 
    '/js/modules/core/data-manager.js',
    '/js/modules/core/ui-renderer.js',
    
    // 功能模块
    '/js/modules/features/search-manager.js',
    '/js/modules/features/link-manager.js',
    '/js/modules/features/interaction-manager.js',
    
    // 工具模块
    '/js/modules/utils/common-utils.js'
  ];

  return Promise.all(
    modules.map(src => {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    })
  );
}

// 全局变量
let dataManager = null;
let uiRenderer = null;
let themeManager = null;
let pwaManager = null;
let searchManager = null;
let linkManager = null;
let interactionManager = null;

// 初始化应用程序
async function initApp() {
  try {
    // 显示页面加载动画
    window.utils.showPageLoader();
    
    // 初始化粒子系统
    window.utils.initParticles();
    
    // 初始化核心模块
    await initCoreModules();
    
    // 初始化功能模块
    await initFeatureModules();
    
    // 初始化交互管理器
    interactionManager = new window.InteractionManager();
    
    // 获取并显示数据
    await loadAndDisplayData();
    
    // 绑定事件监听器
    bindEventListeners();
    
    // 延迟隐藏页面加载动画，确保动画效果完整
    setTimeout(() => {
      window.utils.hidePageLoader();
      
      // 初始化皮肤选择器
      window.utils.initSkinSelector();
      
      // 确保图标背景色正确设置
      if (window.themeInitialized) {
        window.utils.refreshToolIcons();
      }
      
      // 验证用户偏好持久化功能
      setTimeout(() => {
        const isValid = window.utils.validatePersistence();
        if (isValid) {
          console.log('✅ 用户皮肤切换功能初始化成功');
        }
      }, 500);
    }, 800);
    
  } catch (error) {
    console.error('初始化失败:', error);
    handleInitError(error);
  }
}

// 初始化核心模块
async function initCoreModules() {
  // 初始化PWA管理器
  pwaManager = new window.PWAManager();
  
  // 初始化主题管理器
  themeManager = new window.ThemeManager();
  window.themeManager = themeManager; // 设置全局引用
  
  // 初始化数据管理器
  dataManager = new window.DataManager();
  window.dataManager = dataManager; // 设置全局引用
  
  // 初始化UI渲染器
  uiRenderer = new window.UIRenderer(dataManager);
  window.uiRenderer = uiRenderer; // 设置全局引用
  
  // 立即更新时间信息
  uiRenderer.updateTimeInfoImmediately();
  
  // 开始定时更新时间
  setInterval(() => uiRenderer.updateTimeInfo(), 1000);
}

// 初始化功能模块
async function initFeatureModules() {
  // 初始化搜索管理器
  searchManager = new window.SearchManager(dataManager);
  window.searchManager = searchManager; // 设置全局引用
  
  // 初始化链接管理器
  linkManager = new window.LinkManager(dataManager);
  window.linkManager = linkManager; // 设置全局引用
}

// 加载并显示数据
async function loadAndDisplayData() {
  // 显示加载动画
  uiRenderer.showLoadingAnimation();
  
  try {
    const result = await dataManager.fetchNavigationData();
    
    if (result.success) {
      // 隐藏加载动画
      uiRenderer.hideLoadingAnimation();
      
      // 生成分类菜单
      uiRenderer.generateCategoryMenu();
      
      // 显示所有工具
      uiRenderer.showTools('all');
      
      // 更新日期信息
      if (result.dateInfo) {
        uiRenderer.updateDateInfo(result.dateInfo);
      }
    } else {
      uiRenderer.hideLoadingAnimation();
      uiRenderer.showError('加载数据失败，请稍后重试');
    }
  } catch (error) {
    console.error('加载数据异常:', error);
    uiRenderer.hideLoadingAnimation();
    uiRenderer.showError('网络错误，请检查网络连接');
  }
}

// 绑定事件监听器
function bindEventListeners() {
  // 主页菜单项点击事件
  const homeMenuItem = document.querySelector('[data-category="all"]');
  if (homeMenuItem) {
    homeMenuItem.addEventListener('click', () => uiRenderer.showTools('all'));
  }

  // 数据变更事件监听器
  window.addEventListener('dataChanged', async () => {
    console.log('数据发生变更，重新加载...');
    await loadAndDisplayData();
  });
}

// 处理初始化错误
function handleInitError(error) {
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

// 初始化性能监控和错误处理
function initGlobalFeatures() {
  window.utils.initPerformanceMonitoring();
  window.utils.initErrorHandling();
}

// 兼容性函数 - 保持向后兼容
window.refreshToolIcons = function() {
  if (window.uiRenderer) {
    window.uiRenderer.refreshToolIcons();
  }
};

window.toggleTheme = function() {
  if (window.themeManager) {
    window.themeManager.toggleMode();
  }
};

// 在DOM加载完成后初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', async () => {
    await loadModules();
    initGlobalFeatures();
    await initApp();
  });
} else {
  // DOM已经加载完成
  loadModules().then(() => {
    initGlobalFeatures();
    initApp();
  });
}