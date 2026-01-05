# Valorant Reflex Test (瓦罗兰特反应测试)

## 简介
这是一个专为 FPS 玩家（特别是瓦罗兰特玩家）设计的反应速度训练工具。

## 功能
- **三种难度**: 简单、普通、困难，模拟不同距离和目标大小。
- **反应测试**: 10轮随机出现的目标，测试你的反应时间和准确率。
- **排行榜**: 全球玩家排名，看看你是否达到了职业选手水平。
- **数据分析**: 记录你的历史成绩，追踪进步曲线。
- **Supabase集成**: 完整的用户认证和数据存储。

## 技术栈
- React + TypeScript + Vite
- Tailwind CSS (Styling)
- Framer Motion (Animations)
- Supabase (Backend & Auth)
- Zustand (State Management)
- Chart.js (Data Visualization)

## 如何运行
1. 安装依赖:
   ```bash
   npm install
   ```
2. 启动开发服务器:
   ```bash
   npm run dev
   ```

## 数据库设置
项目包含 Supabase 迁移文件 `supabase/migrations/20240104000000_init_schema.sql`，用于初始化数据库结构。
