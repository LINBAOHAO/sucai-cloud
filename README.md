# 速采云 SuCai Cloud

一站式 B2B 工业用品采购平台，连接中国供应商与印尼企业采购。

## 技术栈

- **Next.js 15** — App Router
- **React 19** — UI 框架
- **TypeScript** — 类型安全
- **Tailwind CSS 4** — 样式系统
- **shadcn/ui** — 组件库
- **Framer Motion** — 动画
- **next-intl** — 国际化（中文 / English / Bahasa Indonesia）
- **ESLint + Prettier** — 代码规范

## 快速开始

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 生产构建
npm run build
npm start
```

访问 [http://localhost:3000](http://localhost:3000)

## 语言路由

| 语言 | 路径 |
|------|------|
| 中文（默认） | `/` |
| English | `/en` |
| Bahasa Indonesia | `/id` |

## 项目结构

```
src/
├── app/
│   ├── [locale]/          # 国际化路由
│   │   ├── layout.tsx
│   │   └── page.tsx       # 首页
│   ├── globals.css        # 全局样式 & 主题
│   └── layout.tsx         # 根布局
├── components/
│   ├── home/              # 首页区块组件
│   ├── layout/            # Header / Footer
│   ├── motion/            # 动画组件
│   └── ui/                # shadcn/ui 组件
├── i18n/                  # 国际化配置
├── lib/                   # 工具函数 & 数据
└── middleware.ts          # 语言中间件
messages/                  # 翻译文件 (zh / en / id)
```

## 首页模块

1. 顶部导航 — Logo、菜单、语言切换、登录/注册
2. Hero Banner — 主标题、CTA、数据统计
3. AI 搜索框 — 智能搜索 + 热门标签
4. 产品分类 — 7 大品类
5. 热门商品 — 商品卡片展示
6. 推荐品牌 — 合作品牌
7. 我们的优势 — 4 大核心优势
8. 为什么选择速采云 — 差异化价值
9. 客户评价 — 真实反馈
10. 联系我们 — 表单 + 联系信息
11. Footer — 完整页脚

## 设计规范

- **主色**：深色背景 `#060a12` + 橙色 `#f97316`
- **风格**：现代工业科技风，参考 Alibaba / Grainger / Misumi
- **动画**：Framer Motion 滚动渐入、悬停交互
- **响应式**：Mobile First，适配手机 / 平板 / 桌面

## 脚本

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 生产构建 |
| `npm run start` | 启动生产服务器 |
| `npm run lint` | ESLint 检查 |
| `npm run format` | Prettier 格式化 |

## License

Private — All rights reserved.
