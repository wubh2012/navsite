/**
 * 工具函数集合
 */

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

// 初始化皮肤选择器
function initSkinSelector() {
  if (!window.themeManager) {
    console.warn('主题管理器未初始化');
    return;
  }
  
  // 更新当前皮肤显示
  updateCurrentSkinDisplay();
  
  // 更新皮肤选项状态
  updateSkinOptionsState();
  
  // 更新模式切换按钮
  updateModeToggleDisplay();
}

// 更新当前皮肤显示
function updateCurrentSkinDisplay() {
  const currentSkinName = document.querySelector('.current-skin-name');
  const currentSkinIcon = document.querySelector('.current-skin-icon');
  
  if (currentSkinName && currentSkinIcon && window.themeManager) {
    const currentSkin = window.themeManager.getCurrentSkin();
    const skinConfig = window.SKIN_THEMES[currentSkin];
    
    currentSkinName.textContent = skinConfig.name;
    currentSkinIcon.className = `bi ${skinConfig.icon} current-skin-icon`;
  }
}

// 更新皮肤选项状态
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
        console.log('页面加载性能:', {
          domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
          loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
          totalTime: perfData.loadEventEnd - perfData.fetchStart
        });
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