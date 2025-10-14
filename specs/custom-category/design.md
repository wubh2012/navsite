# 技术方案设计

## 架构概述

自定义分类功能将在现有的添加链接功能基础上进行扩展，主要涉及前端部分的修改，包括表单界面和验证逻辑。

## 技术栈

- 前端：HTML, CSS, JavaScript

## 前端实现方案

### 1. 用户界面修改

- 在添加链接模态框的分类选择区域，增加一个"自定义分类"的输入框
- 默认情况下，输入框隐藏，当用户选择特定选项（如"自定义"）时显示
- 调整表单布局，确保新添加的输入框与现有界面风格一致

### 2. 交互逻辑修改

- 修改 `populateCategories()` 方法，在分类下拉菜单中添加一个"自定义"选项
- 监听分类下拉菜单的变化事件，当选择"自定义"选项时，显示自定义分类输入框
- 修改表单验证逻辑，增加对自定义分类的验证
- 修改保存链接的逻辑，优先使用自定义分类的值（如果有且有效）

### 3. 数据处理

- 当用户保存链接时，如果提供了有效的自定义分类名称，则使用该名称作为链接的分类
- 保存成功后，需要刷新分类列表，以便新添加的分类在后续添加链接时可用

## 具体修改点

### 1. HTML结构修改

在添加链接模态框的分类选择区域，增加自定义分类输入框：

```html
<div class="form-group">
  <label for="site-category">分类 *</label>
  <select id="site-category" name="site-category">
    <!-- 动态生成的分类选项 -->
  </select>
  <div id="custom-category-container" style="display: none;">
    <input type="text" id="custom-category" name="custom-category" placeholder="请输入自定义分类名称" maxlength="20">
  </div>
  <div class="error-message" id="category-error"></div>
</div>
```

### 2. JavaScript逻辑修改

#### 2.1 在 LinkManager 类中修改 populateCategories 方法

在现有分类选项的基础上，添加一个"自定义"选项：

```javascript
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
```

#### 2.2 添加事件监听器来控制自定义分类输入框的显示/隐藏

```javascript
// 在 showAddModal 方法中添加
const categorySelect = document.getElementById('site-category');
const customCategoryContainer = document.getElementById('custom-category-container');

categorySelect.addEventListener('change', () => {
  if (categorySelect.value === 'custom') {
    customCategoryContainer.style.display = 'block';
    document.getElementById('custom-category').focus();
  } else {
    customCategoryContainer.style.display = 'none';
  }
});
```

#### 2.3 修改 validateForm 方法，增加自定义分类的验证

```javascript
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
```

#### 2.4 修改 saveLink 方法，优先使用自定义分类的值

```javascript
saveLink() {
  if (!this.validateForm()) return;

  const siteName = document.getElementById('site-name').value.trim();
  const siteUrl = document.getElementById('site-url').value.trim();
  const siteCategory = document.getElementById('site-category').value;
  const customCategory = document.getElementById('custom-category').value.trim();
  const siteSort = document.getElementById('site-sort').value;
  
  // 确定最终使用的分类
  let finalCategory = siteCategory;
  if (siteCategory === 'custom' && customCategory) {
    finalCategory = customCategory;
  }

  // 构建链接数据
  const linkData = {
    name: siteName,
    url: siteUrl,
    category: finalCategory,
    sort: parseInt(siteSort) || 200
  };

  // 调用dataManager保存链接
  this.dataManager.addLink(linkData).then(() => {
    // 保存成功后的处理
    this.hideAddModal();
    this.dataManager.refreshData(); // 刷新数据，确保新分类可见
  }).catch(error => {
    // 保存失败的处理
    console.error('保存链接失败:', error);
    this.showError('category', '保存失败，请稍后重试');
  });
}
```

## 测试策略

- 测试分类下拉菜单中是否显示"自定义"选项
- 测试选择"自定义"选项后，自定义分类输入框是否正确显示
- 测试自定义分类输入框的验证功能（非空验证和长度验证）
- 测试使用自定义分类保存链接后，链接是否正确保存，并且新分类在后续添加链接时可用
- 测试在不同屏幕尺寸下，自定义分类功能的显示和交互是否正常