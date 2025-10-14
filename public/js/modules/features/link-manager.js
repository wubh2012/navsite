/**
 * 链接管理器 - 处理添加和删除链接的功能
 */
class LinkManager {
  constructor(dataManager) {
    this.dataManager = dataManager;
    this.isAddLinkEventsBound = false;
    this.init();
  }

  init() {
    this.initAddLinkFeature();
    this.initDeleteLinkFeature();
  }

  // 初始化添加链接功能
  initAddLinkFeature() {
    const addLinkBtn = document.getElementById('add-link-btn');
    const addLinkModal = document.getElementById('add-link-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const cancelAddBtn = document.getElementById('cancel-add-btn');
    const saveLinkBtn = document.getElementById('save-link-btn');
    const addLinkForm = document.getElementById('add-link-form');
    const modalOverlay = document.querySelector('.modal-overlay');

    // 检查元素是否存在
    if (!addLinkBtn || !addLinkModal || !closeModalBtn || !cancelAddBtn || !saveLinkBtn || !addLinkForm) {
      console.error('添加链接功能的DOM元素未找到');
      return;
    }

    // 如果事件监听器已经绑定，直接返回
    if (this.isAddLinkEventsBound) {
      return;
    }

    // 添加事件监听器（一次性绑定）
    addLinkBtn.addEventListener('click', () => this.showAddModal());
    closeModalBtn.addEventListener('click', () => this.hideAddModal());
    cancelAddBtn.addEventListener('click', () => this.hideAddModal());
    saveLinkBtn.addEventListener('click', () => this.submitAddForm());
    
    if (modalOverlay) {
      modalOverlay.addEventListener('click', () => this.hideAddModal());
    }
    
    // 标记事件监听器已绑定
    this.isAddLinkEventsBound = true;

    // 阻止模态框内容点击事件冒泡到遮罩层
    const modalContent = addLinkModal.querySelector('.modal-content');
    if (modalContent) {
      modalContent.addEventListener('click', (e) => {
        e.stopPropagation();
      });
    }

    // ESC键关闭模态框
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && addLinkModal.classList.contains('active')) {
        this.hideAddModal();
      }
    });

    // 实时验证
    const siteNameInput = document.getElementById('site-name');
    const siteUrlInput = document.getElementById('site-url');
    
    if (siteNameInput) {
      siteNameInput.addEventListener('input', () => {
        const value = siteNameInput.value.trim();
        if (value.length > 50) {
          this.showError('name', '网站名称长度不能超过50个字符');
        } else {
          this.clearFieldError('name');
        }
      });
    }

    if (siteUrlInput) {
      siteUrlInput.addEventListener('input', () => {
        const value = siteUrlInput.value.trim();
        if (value) {
          try {
            new URL(value);
            this.clearFieldError('url');
          } catch (e) {
            this.showError('url', '无效的网址格式，请确保包含http://或https://');
          }
        } else {
          this.clearFieldError('url');
        }
      });
      
      // 网址自动补全和提取域名的事件监听器
      // 使用防抖函数优化input事件，避免频繁触发
      const debouncedAutoComplete = debounce(() => {
        this.autoCompleteUrl();
      }, 300);
      
      siteUrlInput.addEventListener('input', debouncedAutoComplete);
      
      // 在失去焦点时执行完整的处理
      siteUrlInput.addEventListener('blur', () => {
        this.autoCompleteUrl();
        this.extractDomainForSiteName();
      });
    }
  }

  // 填充分类下拉菜单
  populateCategories() {
    const categorySelect = document.getElementById('site-category');
    if (!categorySelect) return;

    // 清空现有选项
    categorySelect.innerHTML = '<option value="">请选择分类</option>';

    const { categories } = this.dataManager.getCurrentData();

    // 添加现有分类
    if (categories && categories.length > 0) {
      categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
      });
    } else {
      // 如果没有分类数据，添加默认分类
      const defaultCategories = ['主页', '工具', '文档', '社交', '娱乐', '其他'];
      defaultCategories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
      });
    }

    // 添加自定义选项
    const customOption = document.createElement('option');
    customOption.value = 'custom';
    customOption.textContent = '自定义...';
    categorySelect.appendChild(customOption);
  }

  // 显示添加模态框
  showAddModal() {
    const addLinkModal = document.getElementById('add-link-modal');
    const addLinkForm = document.getElementById('add-link-form');
    
    if (!addLinkModal || !addLinkForm) return;

    addLinkModal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // 填充分类
    this.populateCategories();

    // 清空表单
    addLinkForm.reset();
    this.clearErrors();

    // 控制自定义分类输入框的显示/隐藏
    const categorySelect = document.getElementById('site-category');
    const customCategoryContainer = document.getElementById('custom-category-container');
    const customCategoryInput = document.getElementById('custom-category');
    
    if (categorySelect && customCategoryContainer) {
      // 先移除可能存在的事件监听器，避免重复添加
      const newSelect = categorySelect.cloneNode(true);
      categorySelect.parentNode.replaceChild(newSelect, categorySelect);
      
      // 重新获取元素引用
      const updatedCategorySelect = document.getElementById('site-category');
      
      // 添加新的事件监听器
      updatedCategorySelect.addEventListener('change', () => {
        if (updatedCategorySelect.value === 'custom') {
          customCategoryContainer.style.display = 'block';
          if (customCategoryInput) {
            customCategoryInput.focus();
          }
        } else {
          customCategoryContainer.style.display = 'none';
        }
      });
    }

    // 聚焦到网址输入框（根据用户需求，先让用户输入网址）
    setTimeout(() => {
      const siteUrlInput = document.getElementById('site-url');
      if (siteUrlInput) {
        siteUrlInput.focus();
      }
    }, 300);
  }

  // 隐藏添加模态框
  hideAddModal() {
    const addLinkModal = document.getElementById('add-link-modal');
    if (!addLinkModal) return;

    addLinkModal.classList.remove('active');
    document.body.style.overflow = '';
    this.clearErrors();
  }

  // 清除所有错误提示
  clearErrors() {
    this.clearFieldError('name');
    this.clearFieldError('url');
    this.clearFieldError('category');
  }

  // 清除单个字段的错误提示
  clearFieldError(fieldId) {
    const errorElement = document.getElementById(`${fieldId}-error`);
    if (errorElement) {
      errorElement.textContent = '';
    }
  }

  // 显示错误提示
  showError(fieldId, message) {
    const errorElement = document.getElementById(`${fieldId}-error`);
    if (errorElement) {
      errorElement.textContent = message;
    }
  }

  // 验证表单
  validateForm() {
    let isValid = true;
    this.clearErrors();

    // 验证网站名称
    const siteName = document.getElementById('site-name').value.trim();
    if (!siteName) {
      this.showError('name', '请输入网站名称');
      isValid = false;
    } else if (siteName.length > 50) {
      this.showError('name', '网站名称长度不能超过50个字符');
      isValid = false;
    }

    // 验证网址
    const siteUrl = document.getElementById('site-url').value.trim();
    if (!siteUrl) {
      this.showError('url', '请输入网站网址');
      isValid = false;
    } else {
      try {
        new URL(siteUrl);
      } catch (e) {
        this.showError('url', '无效的网址格式，请确保包含http://或https://');
        isValid = false;
      }
    }

    // 验证分类
    const siteCategory = document.getElementById('site-category').value;
    const customCategory = document.getElementById('custom-category').value.trim();
    
    if (siteCategory === 'custom') {
      if (!customCategory) {
        this.showError('category', '请输入自定义分类名称');
        isValid = false;
      } else if (customCategory.length > 20) {
        this.showError('category', '分类名称长度不能超过20个字符');
        isValid = false;
      }
    } else if (!siteCategory) {
      this.showError('category', '请选择分类');
      isValid = false;
    }

    return isValid;
  }

  // 提交添加表单
  async submitAddForm() {
    if (!this.validateForm()) {
      return;
    }

    // 收集表单数据
    const siteName = document.getElementById('site-name').value.trim();
    const siteUrl = document.getElementById('site-url').value.trim();
    const siteCategory = document.getElementById('site-category').value;
    const customCategory = document.getElementById('custom-category').value.trim();
    const siteSort = document.getElementById('site-sort').value ? parseInt(document.getElementById('site-sort').value) : 200;
    
    // 确定最终使用的分类
    let finalCategory = siteCategory;
    if (siteCategory === 'custom' && customCategory) {
      finalCategory = customCategory;
    }
    
    const formData = {
      name: siteName,
      url: siteUrl,
      category: finalCategory,
      sort: siteSort
    };

    // 禁用保存按钮，防止重复提交
    const saveLinkBtn = document.getElementById('save-link-btn');
    if (saveLinkBtn) {
      saveLinkBtn.disabled = true;
      saveLinkBtn.textContent = '保存中...';
    }

    try {
      // 调用数据管理器的添加方法
      const result = await this.dataManager.addLink(formData);

      if (result.success) {
        // 显示成功提示
        this.showSuccessMessage('添加成功');

        // 隐藏模态框
        this.hideAddModal();

        // 触发数据刷新事件
        window.dispatchEvent(new CustomEvent('dataChanged'));
      } else {
        // 显示错误提示
        this.showErrorMessage(result.message || '添加失败');
      }
    } catch (error) {
      console.error('添加异常:', error);
      this.showErrorMessage('网络错误，请检查网络连接后重试');
    } finally {
      // 恢复保存按钮状态
      if (saveLinkBtn) {
        saveLinkBtn.disabled = false;
        saveLinkBtn.textContent = '保存';
      }
    }
  }

  // 初始化删除链接功能
  initDeleteLinkFeature() {
    const deleteModal = document.getElementById('delete-link-modal');
    const closeDeleteModalBtn = document.getElementById('close-delete-modal-btn');
    const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
    const modalOverlay = deleteModal?.querySelector('.modal-overlay');

    // 检查元素是否存在
    if (!deleteModal || !closeDeleteModalBtn || !cancelDeleteBtn || !confirmDeleteBtn) {
      console.error('删除链接功能的DOM元素未找到');
      return;
    }

    // 关闭模态框事件
    const closeModalEvents = [
      { element: closeDeleteModalBtn, event: 'click' },
      { element: cancelDeleteBtn, event: 'click' },
      { element: modalOverlay, event: 'click' }
    ];

    closeModalEvents.forEach(({ element, event }) => {
      if (element) {
        element.addEventListener(event, (e) => {
          // 如果点击的是覆盖层，确保不是点击模态框内容
          if (element === modalOverlay && e.target !== modalOverlay) {
            return;
          }
          this.hideDeleteConfirmation();
        });
      }
    });

    // 确认删除事件
    confirmDeleteBtn.addEventListener('click', () => {
      const toolId = deleteModal.dataset.toolId || '';
      const toolName = deleteModal.dataset.toolName || '';

      if (toolId) {
        this.deleteTool(toolId, toolName);
      } else {
        this.showErrorMessage('无效的工具ID');
        this.hideDeleteConfirmation();
      }
    });
  }

  // 显示删除确认对话框
  showDeleteConfirmation(toolId, toolName) {
    const deleteModal = document.getElementById('delete-link-modal');
    const siteNameElement = document.getElementById('delete-site-name');

    if (!deleteModal || !siteNameElement) {
      console.error('删除确认对话框的DOM元素未找到');
      return;
    }

    // 设置要删除的网站名称
    siteNameElement.textContent = toolName;

    // 保存当前要删除的工具ID和名称
    deleteModal.dataset.toolId = toolId;
    deleteModal.dataset.toolName = toolName;

    // 显示模态框
    deleteModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  // 隐藏删除确认对话框
  hideDeleteConfirmation() {
    const deleteModal = document.getElementById('delete-link-modal');

    if (!deleteModal) {
      console.error('删除确认对话框的DOM元素未找到');
      return;
    }

    // 隐藏模态框
    deleteModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  // 删除网站
  async deleteTool(toolId, toolName) {
    if (!toolId) {
      this.showErrorMessage('无效的工具ID');
      return;
    }

    try {
      // 显示加载状态
      const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
      if (confirmDeleteBtn) {
        const originalText = confirmDeleteBtn.textContent;
        confirmDeleteBtn.textContent = '删除中...';
        confirmDeleteBtn.disabled = true;

        try {
          // 调用数据管理器的删除方法
          const result = await this.dataManager.deleteLink(toolId);

          if (result.success) {
            // 显示成功提示
            this.showSuccessMessage(`网站 "${toolName}" 删除成功`);

            // 隐藏模态框
            this.hideDeleteConfirmation();

            // 触发数据刷新事件
            window.dispatchEvent(new CustomEvent('dataChanged'));
          } else {
            // 显示错误提示
            this.showErrorMessage(result.message || '删除网站失败');

            // 如果是模拟数据的ID，提示用户
            if (toolId.startsWith('mock_')) {
              this.showErrorMessage('这是演示数据，无法删除真实记录');
            }
          }
        } finally {
          // 恢复按钮状态
          confirmDeleteBtn.textContent = originalText;
          confirmDeleteBtn.disabled = false;
        }
      }
    } catch (error) {
      console.error('删除网站异常:', error);
      this.showErrorMessage('网络错误，请检查网络连接后重试');
    }
  }

  // 显示成功消息
  showSuccessMessage(message) {
    // 移除已存在的成功消息
    const existingMessages = document.querySelectorAll('.success-message');
    existingMessages.forEach(msg => msg.remove());

    const messageElement = document.createElement('div');
    messageElement.className = 'success-message';
    messageElement.innerHTML = `
      <i class="bi bi-check-circle"></i>
      <span>${message}</span>
    `;

    // 添加样式
    Object.assign(messageElement.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      backgroundColor: '#52c41a',
      color: 'white',
      padding: '12px 20px',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      zIndex: '1004',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '14px',
      animation: 'fadeInSlideIn 0.3s ease',
      maxWidth: '300px'
    });

    // 添加动画样式
    if (!document.querySelector('#message-animations')) {
      const style = document.createElement('style');
      style.id = 'message-animations';
      style.textContent = `
        @keyframes fadeInSlideIn {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes fadeOutSlideOut {
          from {
            opacity: 1;
            transform: translateX(0);
          }
          to {
            opacity: 0;
            transform: translateX(100%);
          }
        }
      `;
      document.head.appendChild(style);
    }

    // 添加到页面
    document.body.appendChild(messageElement);

    // 3秒后自动移除
    setTimeout(() => {
      messageElement.style.animation = 'fadeOutSlideOut 0.3s ease';
      setTimeout(() => {
        messageElement.remove();
      }, 300);
    }, 3000);
  }

  // 显示错误消息
  showErrorMessage(message) {
    // 移除已存在的错误消息
    const existingMessages = document.querySelectorAll('.error-message');
    existingMessages.forEach(msg => msg.remove());

    const messageElement = document.createElement('div');
    messageElement.className = 'error-message';
    messageElement.innerHTML = `
      <i class="bi bi-exclamation-circle"></i>
      <span>${message}</span>
    `;

    // 添加样式
    Object.assign(messageElement.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      backgroundColor: '#ff4d4f',
      color: 'white',
      padding: '12px 20px',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      zIndex: '1004',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '14px',
      animation: 'fadeInSlideIn 0.3s ease',
      maxWidth: '300px'
    });

    // 添加动画样式（如果还没有添加）
    if (!document.querySelector('#message-animations')) {
      const style = document.createElement('style');
      style.id = 'message-animations';
      style.textContent = `
        @keyframes fadeInSlideIn {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes fadeOutSlideOut {
          from {
            opacity: 1;
            transform: translateX(0);
          }
          to {
            opacity: 0;
            transform: translateX(100%);
          }
        }
      `;
      document.head.appendChild(style);
    }

    // 添加到页面
    document.body.appendChild(messageElement);

    // 5秒后自动移除
    setTimeout(() => {
      messageElement.style.animation = 'fadeOutSlideOut 0.3s ease';
      setTimeout(() => {
        messageElement.remove();
      }, 300);
    }, 5000);
  }
  
  // 自动补全 URL 协议前缀
  autoCompleteUrl() {
    const siteUrlInput = document.getElementById('site-url');
    if (!siteUrlInput) return;
    
    let url = siteUrlInput.value.trim();
    if (!url) return;
    
    // 检查是否已经包含协议前缀
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      // 添加 https:// 前缀
      url = 'https://' + url;
      siteUrlInput.value = url;
      
      // 触发 input 事件，以便实时验证能够检测到变化
      const inputEvent = new Event('input', { bubbles: true });
      siteUrlInput.dispatchEvent(inputEvent);
    }
  }
  
  // 从 URL 中提取域名作为网站名称
  extractDomainForSiteName() {
    const siteUrlInput = document.getElementById('site-url');
    const siteNameInput = document.getElementById('site-name');
    
    if (!siteUrlInput || !siteNameInput) return;
    
    const url = siteUrlInput.value.trim();
    const currentName = siteNameInput.value.trim();
    
    // 只有当网址不为空且网站名称为空时才进行提取
    if (url && !currentName) {
      try {
        // 使用 URL 对象解析网址
        const urlObj = new URL(url);
        // 提取域名（hostname）
        const domain = urlObj.hostname;
        
        // 如果域名以 'www.' 开头，则移除 'www.'
        const cleanDomain = domain.startsWith('www.') ? domain.substring(4) : domain;
        
        // 将提取的域名填充到网站名称输入框
        siteNameInput.value = cleanDomain;
      } catch (e) {
        // 如果 URL 解析失败，则不进行任何操作
        console.log('URL 解析失败，无法提取域名:', e);
      }
    }
  }
}

// 导出链接管理器
window.LinkManager = LinkManager;

/**
 * 防抖函数 - 用于优化输入事件的触发频率
 * @param {Function} func - 要执行的函数
 * @param {number} wait - 等待时间（毫秒）
 * @returns {Function} 包装后的防抖函数
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}