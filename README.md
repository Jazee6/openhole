# OpenHole

## 特性

- 基于Cloudflare workers，无服务器快速部署
- 完全匿名化，讨论无法被追踪
- 可选附带标签，可选IP屏蔽

## 部署

### 前端

#### 变量列表

| 变量名            | 描述          | 示例                       | 获取                                             |
|----------------|-------------|--------------------------|------------------------------------------------|
| VITE_API_URL   | 后端API地址     | https://api.openhole.top |                                                |
| VITE_RECAPTCHA | reCAPTCHA密钥 | 6Lc3IiQaAAAAAAB          | [Link](https://www.google.com/recaptcha/admin) |

#### Vercel(推荐)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FJazee6%2Fopenhole&env=VITE_API_URL,VITE_RECAPTCHA&envDescription=%E6%9F%A5%E7%9C%8B%E7%8E%AF%E5%A2%83%E5%8F%98%E9%87%8F%E6%8F%8F%E8%BF%B0&envLink=https%3A%2F%2Fgithub.com%2FJazee6%2Fopenhole&demo-title=OpenHole&demo-url=https%3A%2F%2Fweb.openhole.top)

#### Cloudflare Pages

- Fork本仓库
- 在Cloudflare Pages中导入本仓库
- 在设置-环境变量中添加环境变量
- 重新部署

### 后端

#### 变量列表

| 变量名        | 描述          | 示例                       | 获取                                             |
|------------|-------------|--------------------------|------------------------------------------------|
| SITE_URL   | 前端地址        | https://web.openhole.top |                                                |
| JWT_SECRET | JWT密钥       | BD7D1F7A5AB64A6D         | 随机字符串                                          |
| RECAPTCHA  | reCAPTCHA密钥 | 6Lc3IiQaAAAAAAB          | [Link](https://www.google.com/recaptcha/admin) |

#### Cloudflare Workers

- `Fork` and `git clone`
- `npm i`安装依赖
- 创建数据库`wrangler d1 create openhole-xxx`
- 将数据库信息填入`wrangler.toml`中的`[env.prod]`
- 执行初始化数据库`wrangler d1 execute openhole-xxx --remote --file=./init/create.sql`
- 导入标签数据`wrangler d1 execute openhole-xxx --remote --file=./init/tags.sql`
- `npm run deploy`
- 在web页面中添加环境变量

## 声明

本项目仅供学习交流使用，不得用于非法用途，否则后果自负。

## 感谢

- [treehollow](https://github.com/treehollow)