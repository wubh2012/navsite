/**
 * PWA管理器 - 处理Service Worker、安装提示等PWA相关功能
 */
class PWAManager {
  constructor() {
    this.deferredPrompt = null;
    this.init();
  }

  async init() {
    if ('serviceWorker' in navigator) {
      await this.registerServiceWorker();
    }
    this.bindInstallEvents();
  }

  // Service Worker 注册
  async registerServiceWorker() {
    try {
      console.log('[PWA] 开始注册 Service Worker...');
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      
      console.log('[PWA] Service Worker 注册成功:', registration.scope);
      
      // 监听 Service Worker 更新
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        console.log('[PWA] 发现新版本 Service Worker');
        
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('[PWA] 新版本已安装，等待激活');
            this.showUpdateNotification();
          }
        });
      });
      
      // 监听 Service Worker 控制器变化
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('[PWA] Service Worker 已更新，重新加载页面');
        window.location.reload();
      });
      
    } catch (error) {
      console.error('[PWA] Service Worker 注册失败:', error);
    }
  }

  // 绑定安装事件
  bindInstallEvents() {
    // PWA 安装提示
    window.addEventListener('beforeinstallprompt', (e) => {
      console.log('[PWA] 安装提示事件触发');
      e.preventDefault();
      this.deferredPrompt = e;
      this.showInstallPrompt();
    });

    // PWA 安装成功
    window.addEventListener('appinstalled', () => {
      console.log('[PWA] PWA 安装成功');
      this.showInstallSuccessMessage();
      this.deferredPrompt = null;
    });
  }

  // 显示更新通知
  showUpdateNotification() {
    const notification = document.createElement('div');
    notification.className = 'pwa-update-notification';
    notification.innerHTML = `
      <div class="notification-content">
        <i class="bi bi-arrow-clockwise"></i>
        <span>发现新版本，点击更新</span>
        <button class="update-btn">更新</button>
        <button class="dismiss-btn">×</button>
      </div>
    `;
    
    // 添加样式
    const style = document.createElement('style');
    style.textContent = `
      .pwa-update-notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, var(--neon-pink), var(--neon-purple));
        color: white;
        padding: 16px;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(255, 0, 102, 0.3);
        z-index: 10000;
        animation: slideInFromRight 0.3s ease;
      }
      .notification-content {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .update-btn, .dismiss-btn {
        background: rgba(255, 255, 255, 0.2);
        border: none;
        color: white;
        padding: 6px 12px;
        border-radius: 6px;
        cursor: pointer;
        transition: background 0.3s;
      }
      .update-btn:hover, .dismiss-btn:hover {
        background: rgba(255, 255, 255, 0.3);
      }
      @keyframes slideInFromRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(notification);
    
    // 事件监听
    notification.querySelector('.update-btn').addEventListener('click', () => {
      navigator.serviceWorker.getRegistration().then(registration => {
        if (registration && registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
      });
      notification.remove();
    });
    
    notification.querySelector('.dismiss-btn').addEventListener('click', () => {
      notification.remove();
    });
    
    // 10秒后自动消失
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 10000);
  }

  // 显示安装提示
  showInstallPrompt() {
    if (!this.deferredPrompt) return;
    
    const prompt = document.createElement('div');
    prompt.className = 'pwa-install-prompt';
    prompt.innerHTML = `
      <div class="prompt-content">
        <div class="prompt-icon">
          <i class="bi bi-phone"></i>
        </div>
        <div class="prompt-text">
          <h3>安装水果导航</h3>
          <p>添加到主屏幕，享受更好的使用体验</p>
        </div>
        <div class="prompt-actions">
          <button class="install-btn">安装</button>
          <button class="later-btn">稍后</button>
        </div>
      </div>
    `;
    
    // 添加样式
    const style = document.createElement('style');
    style.textContent = `
      .pwa-install-prompt {
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(13, 1, 34, 0.95);
        backdrop-filter: blur(10px);
        border: 1px solid var(--neon-pink);
        border-radius: 16px;
        padding: 20px;
        z-index: 10000;
        animation: slideUpFromBottom 0.3s ease;
        max-width: 400px;
        width: 90%;
      }
      .prompt-content {
        display: flex;
        align-items: center;
        gap: 16px;
        color: white;
      }
      .prompt-icon {
        font-size: 32px;
        color: var(--neon-cyan);
      }
      .prompt-text h3 {
        margin: 0 0 4px 0;
        color: white;
        font-size: 18px;
      }
      .prompt-text p {
        margin: 0;
        color: var(--text-mid);
        font-size: 14px;
      }
      .prompt-actions {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .install-btn, .later-btn {
        padding: 8px 16px;
        border-radius: 8px;
        border: none;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.3s;
      }
      .install-btn {
        background: linear-gradient(135deg, var(--neon-pink), var(--neon-purple));
        color: white;
      }
      .install-btn:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(255, 0, 102, 0.4);
      }
      .later-btn {
        background: transparent;
        color: var(--text-mid);
        border: 1px solid var(--text-mid);
      }
      .later-btn:hover {
        background: rgba(255, 255, 255, 0.1);
      }
      @keyframes slideUpFromBottom {
        from { transform: translateX(-50%) translateY(100%); opacity: 0; }
        to { transform: translateX(-50%) translateY(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(prompt);
    
    // 事件监听
    prompt.querySelector('.install-btn').addEventListener('click', async () => {
      if (this.deferredPrompt) {
        this.deferredPrompt.prompt();
        const { outcome } = await this.deferredPrompt.userChoice;
        console.log('[PWA] 用户选择:', outcome);
        
        if (outcome === 'accepted') {
          console.log('[PWA] 用户接受安装');
        } else {
          console.log('[PWA] 用户拒绝安装');
        }
        
        this.deferredPrompt = null;
      }
      prompt.remove();
    });
    
    prompt.querySelector('.later-btn').addEventListener('click', () => {
      prompt.remove();
      // 保存用户选择，24小时内不再显示
      localStorage.setItem('pwa-install-dismissed', Date.now());
    });
    
    // 检查是否最近被拒绝过
    const lastDismissed = localStorage.getItem('pwa-install-dismissed');
    if (lastDismissed && (Date.now() - parseInt(lastDismissed)) < 24 * 60 * 60 * 1000) {
      prompt.remove();
      return;
    }
  }

  // 显示安装成功消息
  showInstallSuccessMessage() {
    const message = document.createElement('div');
    message.className = 'pwa-success-message';
    message.innerHTML = `
      <div class="success-content">
        <i class="bi bi-check-circle"></i>
        <span>水果导航已成功安装到您的设备</span>
      </div>
    `;
    
    // 添加样式
    const style = document.createElement('style');
    style.textContent = `
      .pwa-success-message {
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, var(--accent-green), #4CAF50);
        color: white;
        padding: 16px;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0, 255, 170, 0.3);
        z-index: 10000;
        animation: slideInFromRight 0.3s ease;
      }
      .success-content {
        display: flex;
        align-items: center;
        gap: 12px;
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(message);
    
    // 5秒后自动消失
    setTimeout(() => {
      if (message.parentNode) {
        message.style.animation = 'slideOutToRight 0.3s ease';
        setTimeout(() => message.remove(), 300);
      }
    }, 5000);
    
    // 清除安装提示标记
    localStorage.removeItem('pwa-install-dismissed');
  }
}

// 导出PWA管理器
window.PWAManager = PWAManager;