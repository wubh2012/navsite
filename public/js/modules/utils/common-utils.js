
// 显示页面加载动画
function showPageLoader() {
  // 尝试获取现有的加载器
  let loader = document.getElementById('page-loader');

  // 如果不存在，创建一个
  if (!loader) {
    loader = document.createElement('div');
    loader.id = 'page-loader';
    loader.style.position = 'fixed';
    loader.style.top = '0';
    loader.style.left = '0';
    loader.style.width = '100%';
    loader.style.height = '100%';
    loader.style.background = 'var(--bg-color, #fff)';
    loader.style.zIndex = '9999';
    loader.style.display = 'flex';
    loader.style.justifyContent = 'center';
    loader.style.alignItems = 'center';
    loader.style.transition = 'opacity 0.5s ease';

    loader.innerHTML = `
      <div class="loader-content" style="text-align: center;">
        <div class="spinner" style="width: 40px; height: 40px; border: 4px solid rgba(0,0,0,0.1); border-top-color: var(--primary-color, #ff0066); border-radius: 50%; animation: spin 1s linear infinite;"></div>
        <p style="margin-top: 10px; color: var(--text-color, #333);">加载中...</p>
      </div>
      <style>
        @keyframes spin { to { transform: rotate(360deg); } }
      </style>
    `;

    document.body.appendChild(loader);
  }

  loader.style.display = 'flex';
  loader.style.opacity = '1';
}

// 隐藏页面加载动画
function hidePageLoader() {
  const loader = document.getElementById('page-loader');
  if (loader) {
    loader.style.opacity = '0';
    setTimeout(() => {
      loader.style.display = 'none';
    }, 500);
  }
}

// 初始化粒子系统
function initParticles() {
  const container = document.querySelector('.particles');
  if (!container) return;

  // 清空现有粒子
  container.innerHTML = '';

  const particleCount = 30; // 粒子数量

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.classList.add('particle');

    // 随机大小 (2px - 6px)
    const size = Math.random() * 10 + 2;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;

    // 随机水平位置 (0% - 100%)
    particle.style.left = `${Math.random() * 100}%`;

    // 随机动画持续时间 (10s - 20s)
    const duration = Math.random() * 10 + 10;
    particle.style.animationDuration = `${duration}s`;

    // 随机延迟 (0s - 10s)
    const delay = Math.random() * 10;
    particle.style.animationDelay = `${delay}s`;

    // 霓虹风格颜色随机
    const colors = [
      '#00f6ff', // primary
      'rgba(0, 247, 255, 0.92)', // accent
      'rgba(68, 0, 255, 0.95)',  // secondary
      'rgba(255, 255, 255, 0.75)' // white
    ];
    particle.style.background = colors[Math.floor(Math.random() * colors.length)];

    container.appendChild(particle);
  }

  console.log('粒子系统初始化完成');
}

// 初始化皮肤选择器
function initSkinSelector() {
  const selector = document.getElementById('skin-selector');
  if (!selector) return;

  const expandBtn = selector.querySelector('.skin-expand-btn');
  const optionsContainer = selector.querySelector('.skin-options');

  // 切换展开/收起
  if (expandBtn) {
    expandBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      selector.classList.toggle('expanded');
      // 简单的样式切换，实际样式在CSS中定义
      if (optionsContainer) {
        optionsContainer.style.display = selector.classList.contains('expanded') ? 'block' : 'none';
      }
    });
  }

  // 点击外部关闭
  document.addEventListener('click', (e) => {
    if (!selector.contains(e.target)) {
      selector.classList.remove('expanded');
      if (optionsContainer) {
        optionsContainer.style.display = 'none';
      }
    }
  });

  // 绑定皮肤选项点击事件
  const skinOptions = selector.querySelectorAll('.skin-option');
  skinOptions.forEach(option => {
    option.addEventListener('click', () => {
      const skin = option.getAttribute('data-skin');
      if (window.themeManager) {
        window.themeManager.setSkin(skin);
        // 更新UI状态
        updateSkinOptionsState();
        updateCurrentSkinDisplay();
      }
    });
  });

  // 绑定模式切换按钮
  const modeToggle = selector.querySelector('.skin-mode-toggle');
  if (modeToggle) {
    modeToggle.addEventListener('click', (e) => {
      e.stopPropagation(); // 防止触发关闭
      if (window.themeManager) {
        window.themeManager.toggleMode();
      }
    });
  }
}

// 更新当前皮肤显示
function updateCurrentSkinDisplay() {
  if (!window.themeManager) return;

  const currentSkin = window.themeManager.getCurrentSkin();
  const selector = document.getElementById('skin-selector');
  if (!selector) return;

  // 查找当前皮肤对应的标签名称
  const activeOption = selector.querySelector(`.skin-option[data-skin="${currentSkin}"]`);
  if (activeOption) {
    const label = activeOption.querySelector('.skin-label');
    const nameEl = selector.querySelector('.current-skin-name');

    if (label && nameEl) {
      nameEl.textContent = label.textContent;
    }
  }
}

// 更新皮肤选项选中状态
function updateSkinOptionsState() {
  if (!window.themeManager) return;

  const currentSkin = window.themeManager.getCurrentSkin();

  document.querySelectorAll('.skin-option').forEach(option => {
    const skinName = option.getAttribute('data-skin');
    option.classList.toggle('active', skinName === currentSkin);
  });
}

// 更新模式切换按钮显示
function updateModeToggleDisplay() {
  if (!window.themeManager) return;

  const currentMode = window.themeManager.getCurrentMode();

  // 更新所有主题切换按钮（包括移动端和桌面端）
  const themeToggleBtns = document.querySelectorAll('#theme-toggle-btn, #desktop-theme-toggle-btn');
  themeToggleBtns.forEach(themeToggleBtn => {
    if (themeToggleBtn) {
      const icon = themeToggleBtn.querySelector('i');
      if (icon) {
        if (currentMode === 'dark') {
          icon.className = 'bi bi-sun';
          themeToggleBtn.title = '切换亮色模式';
        } else {
          icon.className = 'bi bi-moon';
          themeToggleBtn.title = '切换暗黑模式';
        }
      }
    }
  });

  // 更新皮肤选择器中的模式切换按钮
  const skinModeToggle = document.querySelector('.skin-mode-toggle');
  if (skinModeToggle) {
    const icon = skinModeToggle.querySelector('i');
    const text = skinModeToggle.querySelector('span');
    if (currentMode === 'dark') {
      if (icon) icon.className = 'bi bi-sun';
      if (text) text.textContent = '亮色模式';
    } else {
      if (icon) icon.className = 'bi bi-moon';
      if (text) text.textContent = '暗黑模式';
    }
  }
}

// 切换主题模式（兼容原有接口）
function toggleTheme() {
  if (window.themeManager) {
    window.themeManager.toggleMode();
  } else {
    console.warn('主题管理器未初始化');
  }
}

// 刷新工具图标
function refreshToolIcons() {
  if (window.uiRenderer) {
    window.uiRenderer.refreshToolIcons();
  }
}

// 验证用户偏好持久化功能
function validatePersistence() {
  console.log('开始验证用户偏好持久化功能...');

  if (!window.themeManager) {
    console.error('主题管理器未初始化，无法进行持久化测试');
    return false;
  }

  // 获取当前设置
  const currentSkin = window.themeManager.getCurrentSkin();
  const currentMode = window.themeManager.getCurrentMode();

  console.log('当前设置:', { currentSkin, currentMode });

  // 检查localStorage中的值
  const savedSkin = localStorage.getItem('skin-theme');
  const savedMode = localStorage.getItem('theme');

  console.log('保存的设置:', { savedSkin, savedMode });

  // 验证一致性
  const skinMatch = savedSkin === currentSkin;
  const modeMatch = savedMode === currentMode;

  if (skinMatch && modeMatch) {
    console.log('✅ 用户偏好持久化功能正常工作');
    return true;
  } else {
    console.warn('⚠️ 用户偏好持久化功能存在问题:', {
      skinMatch,
      modeMatch,
      expected: { currentSkin, currentMode },
      actual: { savedSkin, savedMode }
    });
    return false;
  }
}

// 测试完整的皮肤切换流程
function testSkinSwitching() {
  if (!window.themeManager) {
    console.error('主题管理器未初始化');
    return;
  }

  console.log('开始测试皮肤切换流程...');

  const testSequence = [
    { skin: 'ocean', mode: 'light' },
    { skin: 'forest', mode: 'dark' },
    { skin: 'sunset', mode: 'light' },
    { skin: 'purple', mode: 'dark' },
    { skin: 'classic', mode: 'light' },
    { skin: 'neon', mode: 'dark' }
  ];

  let testIndex = 0;

  function runNextTest() {
    if (testIndex >= testSequence.length) {
      console.log('✅ 所有皮肤切换测试完成');
      return;
    }

    const test = testSequence[testIndex];
    console.log(`测试 ${testIndex + 1}/${testSequence.length}: ${test.skin} - ${test.mode}`);

    window.themeManager.setSkin(test.skin);
    window.themeManager.setMode(test.mode);

    // 验证设置是否正确应用
    setTimeout(() => {
      const currentSkin = window.themeManager.getCurrentSkin();
      const currentMode = window.themeManager.getCurrentMode();

      if (currentSkin === test.skin && currentMode === test.mode) {
        console.log(`✅ 测试 ${testIndex + 1} 通过:`, { currentSkin, currentMode });
      } else {
        console.error(`❌ 测试 ${testIndex + 1} 失败:`, {
          expected: test,
          actual: { currentSkin, currentMode }
        });
      }

      testIndex++;
      setTimeout(runNextTest, 100);
    }, 100);
  }

  runNextTest();
}

// 性能监控
function initPerformanceMonitoring() {
  if ('performance' in window) {
    window.addEventListener('load', function () {
      setTimeout(function () {
        const perfData = performance.getEntriesByType('navigation')[0];
        if (perfData) {
          console.log('页面加载性能:', {
            domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
            loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
            totalTime: perfData.loadEventEnd - perfData.fetchStart
          });
        }
      }, 0);
    });
  }
}

// 添加全局错误处理
function initErrorHandling() {
  // 添加全局错误处理
  window.addEventListener('error', function (event) {
    console.error('全局错误:', event.error);
  });

  // 添加未处理的Promise错误处理
  window.addEventListener('unhandledrejection', function (event) {
    console.error('未处理的Promise错误:', event.reason);
  });
}

// 导出工具函数
window.utils = {
  showPageLoader,
  hidePageLoader,
  initParticles,
  initSkinSelector,
  updateCurrentSkinDisplay,
  updateSkinOptionsState,
  updateModeToggleDisplay,
  toggleTheme,
  refreshToolIcons,
  validatePersistence,
  testSkinSwitching,
  initPerformanceMonitoring,
  initErrorHandling
};