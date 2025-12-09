# SmartEduHub 前端项目

SmartEduHub 是一个数智教育资源管理平台的前端实现。本项目基于 **Vue 3** + **Vite** 构建，采用了现代化的前端技术栈，为教师和学生提供高效、流畅的教育资源管理、作业批改及互动体验。

## 1. 技术栈选型

本项目采用以下核心技术和库：

- **核心框架**: [Vue 3](https://vuejs.org/) (Composition API)
- **构建工具**: [Vite](https://vitejs.dev/)
- **UI 组件库**: [Naive UI](https://www.naiveui.com/) (清爽、高性能的组件库)
- **CSS 框架**: [Tailwind CSS](https://tailwindcss.com/) (原子化 CSS)
- **路由管理**: [Vue Router 4](https://router.vuejs.org/)
- **状态管理**: [Pinia](https://pinia.vuejs.org/)
- **HTTP 请求**: [Axios](https://axios-http.com/)
- **多媒体**:
  - `video.js`: 视频播放器
  - `danmaku`: 视频弹幕功能
- **图标库**: `@vicons/ionicons5`

## 2. 目录结构说明

```
SmartEduHub_frontend/
├── public/                 # 静态资源目录
├── src/
│   ├── api/                # 后端 API 接口封装
│   │   ├── auth.js         # 认证相关 (登录/注册)
│   │   ├── class.js        # 班级管理
│   │   ├── homework.js     # 作业系统
│   │   ├── resource.js     # 资源管理
│   │   └── danmaku.js      # 弹幕接口
│   ├── assets/             # 项目静态资源 (图片、样式等)
│   ├── components/         # 公共组件
│   │   ├── common/         # 通用组件 (如资源预览、弹窗)
│   │   ├── student/        # 学生端专用组件
│   │   └── teacher/        # 教师端专用组件
│   ├── layout/             # 页面布局
│   │   ├── StudentLayout.vue # 学生端布局 (侧边栏+顶部栏)
│   │   └── TeacherLayout.vue # 教师端布局
│   ├── router/             # 路由配置 (index.js)
│   ├── utils/              # 工具函数
│   │   ├── request.js      # Axios 封装 (拦截器、Token处理)
│   │   └── format.js       # 数据格式化工具
│   ├── views/              # 页面视图
│   │   ├── Dashboard.vue   # 仪表盘/控制台
│   │   ├── Login.vue       # 登录页
│   │   ├── Register.vue    # 注册页
│   │   ├── student/        # 学生端页面 (首页、作业、班级详情)
│   │   └── teacher/        # 教师端页面 (管理班级、批改作业)
│   ├── App.vue             # 根组件
│   ├── main.js             # 入口文件 (挂载 Vue、Pinia、Router)
│   └── style.css           # 全局样式 (Tailwind 指令)
├── .env                    # 环境变量
├── index.html              # HTML 模板
├── package.json            # 项目依赖配置
├── tailwind.config.js      # Tailwind 配置
└── vite.config.js          # Vite 配置
```

## 3. 快速开始 (Getting Started)

### 环境要求
- Node.js >= 16.0
- pnpm (推荐) 或 npm / yarn

### 安装依赖
```bash
# 使用 pnpm (推荐)
pnpm install

# 或者使用 npm
npm install
```

### 开发模式运行
```bash
# 启动本地开发服务器 (默认端口 5173)
npm run dev
```

### 生产环境构建
```bash
npm run build
```

## 4. 功能模块

### 用户中心
- **登录/注册**: 支持学生和教师身份注册与登录。
- **角色区分**: 登录后根据角色自动跳转至不同布局（StudentLayout / TeacherLayout）。

### 教师端 (Teacher)
- **班级管理**: 创建班级、查看班级成员、管理班级资源。
- **资源管理**: 上传教学视频/课件 (支持 MinIO OSS)、编辑资源信息。
- **作业管理**: 发布作业、查看提交情况、**AI 辅助批改** + 人工复核。

### 学生端 (Student)
- **资源浏览**: 浏览全站资源或班级资源，观看视频，发送/查看弹幕。
- **作业系统**:
  - 查看待办作业。
  - **手写作业提交**: 上传作业图片，后端自动进行 OCR 识别。
  - 查看 AI 批改结果和教师评语。
