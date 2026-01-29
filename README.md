# RunAll - 云资源与秒杀平台

现代化的云资源管理和秒杀平台，为用户提供直观、流畅的使用体验。

## 最新改进 ✨

### 视觉设计
- **纯黑背景**：采用 `#000000` 纯黑背景，提供极致的视觉对比
- **现代字体**：使用 Inter 和 SF Pro Display 字体系统，提升可读性
- **渐变色彩**：主色调采用青色 (`#00d9ff`) 和粉色 (`#ff3366`) 渐变
- **流畅动画**：卡片悬停、按钮交互都有精心设计的过渡效果

### 用户体验
- **登录弹窗**：登录改为模态框形式，不打断用户浏览流程
- **自动识别用户**：从 JWT Token 自动解析用户 ID，无需手动输入
- **智能导航**：右上角显示用户头像和昵称，一键登出
- **状态持久化**：登录状态自动保存，刷新页面不丢失

### 功能优化
- **我的实例**：登录后自动加载用户的云资源实例
- **秒杀活动**：可视化的秒杀流程，实时状态反馈
- **商品展示**：更丰富的产品卡片，包含规格、价格等信息

## 技术栈

- React 18 + Vite
- Ant Design 5 (Dark Theme)
- React Router 6
- Zustand (状态管理 + 持久化)
- Axios

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 项目结构

```
src/
├── components/       # 可复用组件
│   └── LoginModal.jsx
├── layouts/          # 布局组件
│   └── MainLayout.jsx
├── pages/            # 页面组件
│   ├── ProductList.jsx
│   ├── Seckill.jsx
│   ├── InstanceList.jsx
│   └── ...
├── services/         # API 服务
├── store/            # 状态管理
└── router/           # 路由配置
```

## API 说明

后端 API 基于 OpenAPI 规范，主要接口：

- `POST /api/users/login` - 用户登录
- `POST /api/users/register` - 用户注册
- `GET /api/users/{userId}` - 获取用户信息
- `GET /api/users/{userId}/resources` - 获取用户资源列表
- `POST /api/seckill/buy` - 发起秒杀
- `GET /api/seckill/result/{reqId}` - 查询秒杀结果

## 设计理念

这不是一个管理后台，而是面向最终用户的产品：

1. **用户友好**：无需记住 UUID，系统自动识别
2. **视觉现代**：纯黑背景 + 渐变色彩，符合现代审美
3. **交互流畅**：登录弹窗、卡片动画、状态反馈
4. **信息清晰**：合理的信息层级，突出重点内容

## License

MIT
