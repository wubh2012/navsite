/**
 * 交互管理器 - 处理用户交互、手势操作、动画效果等
 */
class InteractionManager {
  constructor() {
    this.init();
  }
  
  init() {
    this.bindMenuEvents();
    this.bindCardEvents();
    this.bindThemeToggle();
    this.bindGlobalEvents();
    this.bindMobileMenuEvents();
    this.initTouchSupport();
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
    // 绑定移动端和桌面端的主题切换按钮
    const themeToggleBtns = document.querySelectorAll('#theme-toggle-btn, #desktop-theme-toggle-btn');
    themeToggleBtns.forEach(themeToggleBtn => {
      if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', (e) => {
          this.createClickEffect(e.currentTarget);
          // 主题切换逻辑由ThemeManager处理
          if (window.themeManager) {
            window.themeManager.toggleMode();
          }
        });
      }
    });
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

    // 监听窗口大小变化
    window.addEventListener('resize', this.handleResize.bind(this));
  }

  // 绑定移动端菜单事件
  bindMobileMenuEvents() {
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('mobile-overlay');

    if (hamburgerBtn && sidebar && overlay) {
      // 汉堡菜单按钮点击事件
      hamburgerBtn.addEventListener('click', () => this.toggleMobileMenu());

      // 遮罩层点击事件 - 关闭菜单
      overlay.addEventListener('click', () => this.closeMobileMenu());

      // 侧边栏菜单项点击事件 - 选择分类后关闭菜单
      const menuItems = sidebar.querySelectorAll('.nav-menu li');
      menuItems.forEach(item => {
        item.addEventListener('click', () => {
          // 延迟关闭菜单，让用户看到选中效果
          setTimeout(() => this.closeMobileMenu(), 300);
        });
      });

      // ESC键关闭菜单
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && sidebar.classList.contains('active')) {
          this.closeMobileMenu();
        }
      });
    }
  }

  // 切换移动端菜单显示/隐藏
  toggleMobileMenu() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar && sidebar.classList.contains('active')) {
      this.closeMobileMenu();
    } else {
      this.openMobileMenu();
    }
  }

  // 打开移动端菜单
  openMobileMenu() {
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('mobile-overlay');

    if (hamburgerBtn) hamburgerBtn.classList.add('active');
    if (sidebar) sidebar.classList.add('active');
    if (overlay) overlay.classList.add('active');

    // 防止背景滚动
    document.body.style.overflow = 'hidden';
  }

  // 关闭移动端菜单
  closeMobileMenu() {
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('mobile-overlay');

    if (hamburgerBtn) hamburgerBtn.classList.remove('active');
    if (sidebar) sidebar.classList.remove('active');
    if (overlay) overlay.classList.remove('active');

    // 恢复背景滚动
    document.body.style.overflow = '';
  }

  // 处理窗口大小变化
  handleResize() {
    const sidebar = document.getElementById('sidebar');

    // 如果窗口变大（超过768px），自动关闭移动端菜单
    if (window.innerWidth > 768 && sidebar && sidebar.classList.contains('active')) {
      this.closeMobileMenu();
    }
  }

  // 初始化触摸支持
  initTouchSupport() {
    // 检查是否为触摸设备
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      this.addTouchGestureSupport();
    }
  }

  // 添加触摸手势支持
  addTouchGestureSupport() {
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;

    // 为工具卡片添加涟漪效果
    const addRippleEffect = (element) => {
      element.classList.add('ripple');

      element.addEventListener('touchstart', function (e) {
        // 添加触摸震动反馈（如果支持）
        if (navigator.vibrate) {
          navigator.vibrate(10);
        }
      });
    };

    // 为所有工具卡片添加涟漪效果
    const initRippleEffects = () => {
      const toolItems = document.querySelectorAll('.tool-item');
      toolItems.forEach(addRippleEffect);
    };

    // 左右滑动切换分类
    const handleSwipeGesture = () => {
      const mainContent = document.querySelector('.main-content');
      if (!mainContent) return;

      mainContent.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
      }, { passive: true });

      mainContent.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        touchEndY = e.changedTouches[0].screenY;
        this.handleGesture(touchStartX, touchStartY, touchEndX, touchEndY);
      }, { passive: true });
    };

    // 初始化触摸手势
    initRippleEffects();
    handleSwipeGesture();

    // 监听DOM变化，为新添加的工具卡片添加涟漪效果
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
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

  // 处理手势
  handleGesture(startX, startY, endX, endY) {
    const deltaX = endX - startX;
    const deltaY = endY - startY;
    const minSwipeDistance = 50;

    // 确保是水平滑动而不是垂直滑动
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
      // 获取当前分类和分类列表
      if (window.uiRenderer && window.dataManager) {
        const currentCategory = window.uiRenderer.getCurrentCategory();
        const { categories } = window.dataManager.getCurrentData();
        const currentIndex = categories.indexOf(currentCategory);

        if (deltaX > 0 && currentIndex > 0) {
          // 向右滑动，切换到上一个分类
          window.uiRenderer.showTools(categories[currentIndex - 1]);
        } else if (deltaX < 0 && currentIndex < categories.length - 1) {
          // 向左滑动，切换到下一个分类
          window.uiRenderer.showTools(categories[currentIndex + 1]);
        }
      }
    }
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

// 导出交互管理器
window.InteractionManager = InteractionManager;