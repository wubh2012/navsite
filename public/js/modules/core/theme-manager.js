/**
 * 主题管理器 - 处理皮肤切换、暗黑模式等主题相关功能
 */

// 皮肤主题配置
const SKIN_THEMES = {
  neon: {
    name: '霓虹风格',
    icon: 'bi-stars',
    colors: {
      light: {
        primary: '#FF0066',
        secondary: '#4500FF',
        accent: '#0006FF',
        accentGreen: '#00FFAA',
        warning: '#FF8800',
        danger: '#FF4D4F',
        neonPink: '#FF0066',
        neonCyan: '#00F6FF',
        neonPurple: '#4500FF',
        textHigh: '#FFFFFF',
        textMid: '#8B86BD',
        textLow: '#5E55E7',
        primaryBg: 'linear-gradient(135deg, #050012, #0D0122, #1a0033)',
        glassBg: 'rgba(255, 255, 255, 0.8)',
        elevatedBg: 'rgba(13, 1, 34, 0.8)'
      },
      dark: {
        primary: '#FF0066',
        secondary: '#4500FF',
        accent: '#0006FF',
        accentGreen: '#00FFAA',
        warning: '#FF8800',
        danger: '#FF4D4F',
        neonPink: '#FF0066',
        neonCyan: '#00F6FF',
        neonPurple: '#4500FF',
        textHigh: '#FFFFFF',
        textMid: '#8B86BD',
        textLow: '#5E55E7',
        primaryBg: 'linear-gradient(135deg, #050012, #0D0122, #1a0033)',
        glassBg: 'rgba(13, 1, 34, 0.6)',
        elevatedBg: 'rgba(13, 1, 34, 0.8)'
      }
    }
  },
  ocean: {
    name: '海洋蓝调',
    icon: 'bi-water',
    colors: {
      light: {
        primary: '#0077BE',
        secondary: '#0096C7',
        accent: '#00B4D8',
        accentGreen: '#48CAE4',
        warning: '#FFB703',
        danger: '#FF6B6B',
        neonPink: '#00F5FF',
        neonCyan: '#40E0D0',
        neonPurple: '#0096C7',
        textHigh: '#003566',
        textMid: '#0077BE',
        textLow: '#0096C7',
        primaryBg: 'linear-gradient(135deg, #caf0f8, #ade8f4, #90e0ef)',
        glassBg: 'rgba(255, 255, 255, 0.8)',
        elevatedBg: 'rgba(202, 240, 248, 0.8)'
      },
      dark: {
        primary: '#00F5FF',
        secondary: '#40E0D0',
        accent: '#48CAE4',
        accentGreen: '#90E0EF',
        warning: '#FFB703',
        danger: '#FF6B6B',
        neonPink: '#00F5FF',
        neonCyan: '#40E0D0',
        neonPurple: '#0096C7',
        textHigh: '#FFFFFF',
        textMid: '#CAF0F8',
        textLow: '#ADE8F4',
        primaryBg: 'linear-gradient(135deg, #001122, #002244, #003366)',
        glassBg: 'rgba(0, 34, 68, 0.6)',
        elevatedBg: 'rgba(0, 34, 68, 0.8)'
      }
    }
  },
  forest: {
    name: '森林绿意',
    icon: 'bi-tree',
    colors: {
      light: {
        primary: '#2D5016',
        secondary: '#52734D',
        accent: '#73A942',
        accentGreen: '#B4C7A9',
        warning: '#FF8500',
        danger: '#E63946',
        neonPink: '#73A942',
        neonCyan: '#90C695',
        neonPurple: '#52734D',
        textHigh: '#1B4332',
        textMid: '#2D5016',
        textLow: '#52734D',
        primaryBg: 'linear-gradient(135deg, #f1faee, #e9f5db, #cfe1b9)',
        glassBg: 'rgba(255, 255, 255, 0.8)',
        elevatedBg: 'rgba(241, 250, 238, 0.8)'
      },
      dark: {
        primary: '#90C695',
        secondary: '#73A942',
        accent: '#B4C7A9',
        accentGreen: '#CFE1B9',
        warning: '#FF8500',
        danger: '#E63946',
        neonPink: '#90C695',
        neonCyan: '#B4C7A9',
        neonPurple: '#73A942',
        textHigh: '#FFFFFF',
        textMid: '#CFE1B9',
        textLow: '#B4C7A9',
        primaryBg: 'linear-gradient(135deg, #081c15, #1b4332, #2d5016)',
        glassBg: 'rgba(27, 67, 50, 0.6)',
        elevatedBg: 'rgba(27, 67, 50, 0.8)'
      }
    }
  },
  sunset: {
    name: '日落橙黄',
    icon: 'bi-sunset',
    colors: {
      light: {
        primary: '#FF6D00',
        secondary: '#FF8F00',
        accent: '#FFB300',
        accentGreen: '#FFD54F',
        warning: '#FF5722',
        danger: '#D32F2F',
        neonPink: '#FF8F00',
        neonCyan: '#FFD54F',
        neonPurple: '#FF6D00',
        textHigh: '#BF360C',
        textMid: '#E65100',
        textLow: '#FF6D00',
        primaryBg: 'linear-gradient(135deg, #fff8e1, #ffecb3, #ffe082)',
        glassBg: 'rgba(255, 255, 255, 0.8)',
        elevatedBg: 'rgba(255, 248, 225, 0.8)'
      },
      dark: {
        primary: '#FFD54F',
        secondary: '#FFB300',
        accent: '#FF8F00',
        accentGreen: '#FFF176',
        warning: '#FF5722',
        danger: '#D32F2F',
        neonPink: '#FFD54F',
        neonCyan: '#FFF176',
        neonPurple: '#FFB300',
        textHigh: '#FFFFFF',
        textMid: '#FFF8E1',
        textLow: '#FFECB3',
        primaryBg: 'linear-gradient(135deg, #3e2723, #5d4037, #8d6e63)',
        glassBg: 'rgba(62, 39, 35, 0.6)',
        elevatedBg: 'rgba(62, 39, 35, 0.8)'
      }
    }
  },
  purple: {
    name: '优雅紫色',
    icon: 'bi-gem',
    colors: {
      light: {
        primary: '#6A1B9A',
        secondary: '#8E24AA',
        accent: '#AB47BC',
        accentGreen: '#CE93D8',
        warning: '#FF9800',
        danger: '#F44336',
        neonPink: '#AB47BC',
        neonCyan: '#CE93D8',
        neonPurple: '#8E24AA',
        textHigh: '#4A148C',
        textMid: '#6A1B9A',
        textLow: '#8E24AA',
        primaryBg: 'linear-gradient(135deg, #f3e5f5, #e1bee7, #ce93d8)',
        glassBg: 'rgba(255, 255, 255, 0.8)',
        elevatedBg: 'rgba(243, 229, 245, 0.8)'
      },
      dark: {
        primary: '#CE93D8',
        secondary: '#AB47BC',
        accent: '#8E24AA',
        accentGreen: '#E1BEE7',
        warning: '#FF9800',
        danger: '#F44336',
        neonPink: '#CE93D8',
        neonCyan: '#E1BEE7',
        neonPurple: '#AB47BC',
        textHigh: '#FFFFFF',
        textMid: '#F3E5F5',
        textLow: '#E1BEE7',
        primaryBg: 'linear-gradient(135deg, #1a0e1a, #2a1a2a, #3a2a3a)',
        glassBg: 'rgba(26, 14, 26, 0.6)',
        elevatedBg: 'rgba(26, 14, 26, 0.8)'
      }
    }
  },
  classic: {
    name: '经典灰调',
    icon: 'bi-circle-half',
    colors: {
      light: {
        primary: '#424242',
        secondary: '#616161',
        accent: '#757575',
        accentGreen: '#9E9E9E',
        warning: '#FF9800',
        danger: '#F44336',
        neonPink: '#757575',
        neonCyan: '#9E9E9E',
        neonPurple: '#616161',
        textHigh: '#212121',
        textMid: '#424242',
        textLow: '#616161',
        primaryBg: 'linear-gradient(135deg, #fafafa, #f5f5f5, #eeeeee)',
        glassBg: 'rgba(255, 255, 255, 0.8)',
        elevatedBg: 'rgba(250, 250, 250, 0.8)'
      },
      dark: {
        primary: '#BDBDBD',
        secondary: '#9E9E9E',
        accent: '#757575',
        accentGreen: '#E0E0E0',
        warning: '#FF9800',
        danger: '#F44336',
        neonPink: '#BDBDBD',
        neonCyan: '#E0E0E0',
        neonPurple: '#9E9E9E',
        textHigh: '#FFFFFF',
        textMid: '#F5F5F5',
        textLow: '#EEEEEE',
        primaryBg: 'linear-gradient(135deg, #121212, #1e1e1e, #2a2a2a)',
        glassBg: 'rgba(18, 18, 18, 0.6)',
        elevatedBg: 'rgba(18, 18, 18, 0.8)'
      }
    }
  }
};

// ThemeManager 类 - 主题管理器
class ThemeManager {
  constructor() {
    this.currentSkin = 'neon';  // 默认皮肤
    this.currentMode = 'dark'; // 默认模式
    this.isInitialized = false;
    this.init();
  }

  init() {
    this.loadUserPreferences();
    this.applyTheme();
    this.bindEvents();
    this.isInitialized = true;
    
    // 设置全局标志，表示主题已初始化
    window.themeInitialized = true;
  }

  loadUserPreferences() {
    // 加载用户保存的皮肤选择
    const savedSkin = localStorage.getItem('skin-theme');
    if (savedSkin && SKIN_THEMES[savedSkin]) {
      this.currentSkin = savedSkin;
    }

    // 加载用户保存的模式选择
    const savedMode = localStorage.getItem('theme');
    if (savedMode) {
      this.currentMode = savedMode;
    } else {
      // 检查系统偏好
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.currentMode = systemPrefersDark ? 'dark' : 'light';
    }
  }

  setSkin(skinName) {
    if (!SKIN_THEMES[skinName]) {
      console.warn(`皮肤主题 "${skinName}" 不存在`);
      return;
    }

    this.currentSkin = skinName;
    this.applyTheme();
    this.savePreferences();
    this.refreshIcons();
    this.updateSkinSelector();
  }

  toggleMode() {
    this.currentMode = this.currentMode === 'dark' ? 'light' : 'dark';
    this.applyTheme();
    this.savePreferences();
    this.refreshIcons();
    this.updateModeToggle();
  }

  setMode(mode) {
    if (mode === 'dark' || mode === 'light') {
      this.currentMode = mode;
      this.applyTheme();
      this.savePreferences();
      this.refreshIcons();
      this.updateModeToggle();
    }
  }

  applyTheme() {
    const skin = SKIN_THEMES[this.currentSkin];
    const colors = skin.colors[this.currentMode];

    // 设置数据属性
    document.documentElement.setAttribute('data-skin', this.currentSkin);
    document.documentElement.setAttribute('data-theme', this.currentMode);

    // 应用CSS变量
    const root = document.documentElement;
    
    // 主题颜色变量
    root.style.setProperty('--primary-color', colors.primary);
    root.style.setProperty('--secondary-color', colors.secondary);
    root.style.setProperty('--accent-color', colors.accent);
    root.style.setProperty('--accent-green', colors.accentGreen);
    root.style.setProperty('--warning-color', colors.warning);
    root.style.setProperty('--danger-color', colors.danger);
    
    // 霓虹发光颜色
    root.style.setProperty('--neon-pink', colors.neonPink);
    root.style.setProperty('--neon-cyan', colors.neonCyan);
    root.style.setProperty('--neon-purple', colors.neonPurple);
    
    // 文本颜色层级
    root.style.setProperty('--text-high', colors.textHigh);
    root.style.setProperty('--text-mid', colors.textMid);
    root.style.setProperty('--text-low', colors.textLow);
    
    // 背景渐变
    root.style.setProperty('--primary-bg', colors.primaryBg);
    root.style.setProperty('--glass-bg', colors.glassBg);
    root.style.setProperty('--elevated-bg', colors.elevatedBg);
    
    // 根据模式调整具体元素的颜色
    this.applyModeSpecificColors();
  }

  applyModeSpecificColors() {
    const skin = SKIN_THEMES[this.currentSkin];
    const colors = skin.colors[this.currentMode];
    const root = document.documentElement;
    
    if (this.currentMode === 'dark') {
      root.style.setProperty('--bg-color', colors.primaryBg);
      root.style.setProperty('--text-color', colors.textHigh);
      root.style.setProperty('--sidebar-bg', colors.elevatedBg);
      root.style.setProperty('--menu-hover-bg', `rgba(${this.hexToRgb(colors.primary)}, 0.15)`);
      root.style.setProperty('--menu-active-color', colors.neonPink);
      root.style.setProperty('--menu-active-border', colors.neonPink);
      root.style.setProperty('--time-color', colors.textHigh);
      root.style.setProperty('--date-color', colors.textMid);
      root.style.setProperty('--tool-item-bg', colors.glassBg);
      root.style.setProperty('--tool-item-shadow', `0 2px 12px rgba(${this.hexToRgb(colors.primary)}, 0.2)`);
      root.style.setProperty('--tool-item-hover-shadow', `0 0 20px rgba(${this.hexToRgb(colors.neonPink)}, 0.5)`);
      root.style.setProperty('--tool-icon-color', colors.textHigh);
      root.style.setProperty('--tool-name-color', colors.textHigh);
    } else {
      // 亮色模式
      const lightBg = this.currentSkin === 'classic' ? '#fafafa' : 
                     this.currentSkin === 'ocean' ? '#f8fdff' :
                     this.currentSkin === 'forest' ? '#f9fdf7' :
                     this.currentSkin === 'sunset' ? '#fffaf0' :
                     this.currentSkin === 'purple' ? '#fdf7ff' : '#f5f7fa';
      
      root.style.setProperty('--bg-color', lightBg);
      root.style.setProperty('--text-color', colors.textLow);
      root.style.setProperty('--sidebar-bg', '#fff');
      root.style.setProperty('--menu-hover-bg', `rgba(${this.hexToRgb(colors.primary)}, 0.1)`);
      root.style.setProperty('--menu-active-color', colors.primary);
      root.style.setProperty('--menu-active-border', colors.primary);
      root.style.setProperty('--time-color', colors.textMid);
      root.style.setProperty('--date-color', colors.textLow);
      root.style.setProperty('--tool-item-bg', '#fff');
      root.style.setProperty('--tool-item-shadow', '0 2px 8px rgba(0, 0, 0, 0.08)');
      root.style.setProperty('--tool-item-hover-shadow', `0 4px 16px rgba(${this.hexToRgb(colors.primary)}, 0.2)`);
      root.style.setProperty('--tool-icon-color', colors.textHigh);
      root.style.setProperty('--tool-name-color', colors.textLow);
    }
  }

  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? 
      `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : 
      '0, 0, 0';
  }

  savePreferences() {
    localStorage.setItem('skin-theme', this.currentSkin);
    localStorage.setItem('theme', this.currentMode);
  }

  refreshIcons() {
    // 刷新工具图标，确保图标背景色正确更新
    if (typeof window.refreshToolIcons === 'function') {
      window.refreshToolIcons();
    }
  }

  updateSkinSelector() {
    // 更新皮肤选择器的显示状态
    const currentSkinEl = document.querySelector('.current-skin-name');
    const currentSkinIcon = document.querySelector('.current-skin-icon');
    
    if (currentSkinEl) {
      currentSkinEl.textContent = SKIN_THEMES[this.currentSkin].name;
    }
    
    if (currentSkinIcon) {
      currentSkinIcon.className = `bi ${SKIN_THEMES[this.currentSkin].icon}`;
    }
    
    // 更新皮肤选项的选中状态
    document.querySelectorAll('.skin-option').forEach(option => {
      const skinName = option.getAttribute('data-skin');
      option.classList.toggle('active', skinName === this.currentSkin);
    });
  }

  updateModeToggle() {
    // 更新所有主题切换按钮的图标（包括移动端和桌面端）
    const themeToggleBtns = document.querySelectorAll('#theme-toggle-btn, #desktop-theme-toggle-btn');
    themeToggleBtns.forEach(themeToggleBtn => {
      if (themeToggleBtn) {
        const icon = themeToggleBtn.querySelector('i');
        if (icon) {
          if (this.currentMode === 'dark') {
            icon.className = 'bi bi-sun';
            themeToggleBtn.title = '';
          } else {
            icon.className = 'bi bi-moon';
            themeToggleBtn.title = '';
          }
        }
      }
    });

    // 更新皮肤选择器中的模式切换按钮
    const skinModeToggle = document.querySelector('.skin-mode-toggle');
    if (skinModeToggle) {
      const icon = skinModeToggle.querySelector('i');
      const text = skinModeToggle.querySelector('span');
      if (this.currentMode === 'dark') {
        if (icon) icon.className = 'bi bi-sun';
        if (text) text.textContent = '';
      } else {
        if (icon) icon.className = 'bi bi-moon';
        if (text) text.textContent = '';
      }
    }
  }

  bindEvents() {
    // 皮肤选择器展开/收起事件
    document.addEventListener('click', (e) => {
      // 点击展开按钮或皮肤文字都可以弹出选择页面
      if (e.target.closest('.skin-expand-btn') || e.target.closest('.current-skin-name')) {
        this.toggleSkinSelector();
      }
      
      if (e.target.closest('.skin-option')) {
        const skinName = e.target.closest('.skin-option').getAttribute('data-skin');
        this.setSkin(skinName);
        // 选择后自动关闭选择dialog
        this.closeSkinSelector();
      }
      
      if (e.target.closest('.skin-mode-toggle')) {
        this.toggleMode();
      }
      
      // 点击其他区域关闭皮肤选择器
      if (!e.target.closest('.skin-selector')) {
        this.closeSkinSelector();
      }
    });
  }

  toggleSkinSelector() {
    const skinSelector = document.querySelector('.skin-selector');
    if (skinSelector) {
      skinSelector.classList.toggle('expanded');
      
      // 更新展开按钮的图标
      const expandBtn = skinSelector.querySelector('.skin-expand-btn i');
      if (expandBtn) {
        if (skinSelector.classList.contains('expanded')) {
          expandBtn.className = 'bi bi-chevron-up';
        } else {
          expandBtn.className = 'bi bi-chevron-down';
        }
      }
    }
  }

  closeSkinSelector() {
    const skinSelector = document.querySelector('.skin-selector');
    if (skinSelector && skinSelector.classList.contains('expanded')) {
      skinSelector.classList.remove('expanded');
      
      // 更新展开按钮的图标
      const expandBtn = skinSelector.querySelector('.skin-expand-btn i');
      if (expandBtn) {
        expandBtn.className = 'bi bi-chevron-down';
      }
    }
  }

  getCurrentSkin() {
    return this.currentSkin;
  }

  getCurrentMode() {
    return this.currentMode;
  }

  getSkinList() {
    return Object.keys(SKIN_THEMES).map(key => ({
      key,
      name: SKIN_THEMES[key].name,
      icon: SKIN_THEMES[key].icon
    }));
  }
}

// 导出主题管理器和配置
window.ThemeManager = ThemeManager;
window.SKIN_THEMES = SKIN_THEMES;