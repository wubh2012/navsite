# 技术方案设计

## 架构概述

本技术方案旨在优化网站导航项目的添加链接流程，实现两个主要功能：网址自动补全和从网址中提取域名作为默认网站名称。这两个功能都将在前端实现，主要涉及JavaScript逻辑的修改。

## 技术栈

- 前端：HTML, CSS, JavaScript

## 前端实现方案

### 1. 网址自动补全功能

- 监听网址输入框的事件（如 `blur`、`change` 或 `input`）
- 当用户输入网址时，检查输入内容是否包含 `http://` 或 `https://` 前缀
- 如果不包含协议前缀，则自动添加 `https://` 前缀
- 确保在表单验证和提交时使用带有正确协议前缀的完整网址

### 2. 自动提取域名作为网站名称

- 监听网址输入框的 `blur` 事件或 `input` 事件
- 当用户输入网址后，使用 URL 对象解析该网址
- 从解析后的 URL 对象中提取域名部分（`hostname`）
- 检查网站名称输入框是否为空
- 如果网站名称输入框为空，则将提取的域名填充到网站名称输入框中
- 如果用户已经手动输入了网站名称，则保留用户的输入，不进行覆盖

## 具体修改点

### 1. 修改 LinkManager 类中的初始化方法

在 `initAddLinkFeature` 方法中，为网址输入框添加事件监听器，用于实现网址自动补全和自动提取域名功能：

```javascript
// 在 initAddLinkFeature 方法中添加
const siteUrlInput = document.getElementById('site-url');
const siteNameInput = document.getElementById('site-name');

if (siteUrlInput) {
  // 添加网址自动补全和提取域名的事件监听器
  siteUrlInput.addEventListener('blur', () => {
    this.autoCompleteUrl();
    this.extractDomainForSiteName();
  });
  
  // 也可以在输入时进行自动补全，但要注意避免频繁触发
  siteUrlInput.addEventListener('input', debounce(() => {
    this.autoCompleteUrl();
  }, 300));
}
```

### 2. 添加自动补全 URL 的方法

```javascript
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
```

### 3. 添加从 URL 提取域名作为网站名称的方法

```javascript
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
```

### 4. 添加防抖函数（用于优化输入事件的触发频率）

```javascript
// 防抖函数
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
```

## 安全性考虑

- 确保 URL 解析时进行异常处理，防止无效的 URL 导致脚本错误
- 避免在用户已经输入网站名称后覆盖用户的输入，尊重用户的选择
- 确保自动补全的协议前缀是安全的 `https://`，提升安全性

## 测试策略

- 测试网址自动补全功能：
  - 输入不包含协议前缀的网址（如 google.com），检查是否自动添加 https:// 前缀
  - 输入已包含 http:// 前缀的网址，检查是否保持不变
  - 输入已包含 https:// 前缀的网址，检查是否保持不变
- 测试自动提取域名作为网站名称功能：
  - 输入完整网址后，检查网站名称输入框是否自动填充了域名
  - 先输入网站名称，再输入网址，检查网站名称是否保持不变
  - 测试包含 www. 的域名（如 www.github.com），检查是否正确提取为 github.com
  - 测试包含路径的网址（如 https://www.google.com/search），检查是否正确提取域名