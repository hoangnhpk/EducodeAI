# EducodeAI Project Structure

## Overview
Tài liệu này mô tả cấu trúc folder của project EducodeAI, bao gồm backend API (ASP.NET Core) và frontend web application (React và TypeScript).

## Backend Structure (educodeai-server)

```
educodeai-server/
```

### Core Configuration
- **Config/** - Các file cấu hình và cài đặt
- **Program.cs** - Điểm entry và middleware cấu hình
- **appsettings.json** - Cấu hình application
- **appsettings.Development.json** - Cài đặt môi trường development
- **Config/GeminiAIOptions.cs** - Cấu hình cho Gemini AI API Key
- **Dockerfile** - Cấu hình Docker container

### API Layer
- **Controllers/** (21 items) - API controllers xử lý HTTP requests
  - Controllers cho các functional areas khác nhau của application
  - **QuanTriVien/KeyApiController.cs** - API Controller cho Quan lý Key API

### Data Layer
- **Data/** (5 items) - Database context và cấu hình data access
- **Models/** (24 items) - Entity models biểu diễn database tables
- **Models/KeyAPIModel.cs** - Entity model cho Key API
- **Migrations/** (3 items) - Database migration files
- **Repository/** (22 items) - Repository pattern implementation cho data access
  - **Implementation/KeyApiRepository.cs** - Repository implementation cho Quan lý Key API
  - **Interface/IKeyApiRepository.cs** - Interface cho Key API Repository

### Business Logic
- **Services/** (38 items) - Business logic và service layer
  - **Implementation/KeyApiService.cs** - Service cho Quan lý Key API
  - **Interface/IKeyApiService.cs** - Interface cho Key API Service
  - **Implementation/RedisService.cs** - Service cho Redis operations
  - **Interface/IRedisService.cs** - Interface cho Redis Service
- **Helpers/** (9 items) - Utility và helper classes

### Data Transfer Objects
- **DTOs/** (48 items) - Data Transfer Objects cho API communication
  - **AI/KeyAPISummaryDto.cs** - DTO cho Key API summary

### Background Services
- **Workers/** (1 items) - Background service implementations
  - **RedisSyncWorker.cs** - Background service cho Redis synchronization

### Static Files
- **wwwroot/** (4 items) - Static web files (CSS, JS, images)

### Project Files
- **educodeai-server.csproj** - Project cấu hình file
- **Properties/** - Project properties
- **bin/**, **obj/** - Build output directories

---

## Frontend Structure (educodeai-client)

```
educodeai-client/
```

### Project Configuration
- **package.json** - Node.js dependencies và scripts
- **vite.config.ts** - Cấu hình Vite build tool
- **tsconfig.json** - Cấu hình TypeScript
- **eslint.config.js** - Cấu hình ESLint linting
- **index.html** - Main HTML entry point
- **.env** - Environment variables

### Source Code (src/)
- **main.tsx** - Application entry point
- **App.tsx** - Root React component

### Core Directories
- **assets/** (6 items) - Static assets (images, fonts, icons)
- **configs/** (1 items) - Application cấu hình files
- **layouts/** (12 items) - Layout components cho các page structures khác nhau
- **pages/** (115 items) - Page components cho các routes khác nhau
- **router/** (1 items) - Routing cấu hình
- **services/** (14 items) - API service functions
- **utils/** (3 items) - Utility functions và helpers

### Public Files
- **public/** (1 items) - Public static assets

### Documentation
- **README.md** - Project documentation
- **CHANGELOG.md** - Version changelog
- **CSS_ARCHITECTURE.md** - CSS architecture documentation
- **CSS_CLEANUP_REPORT.md** - CSS cleanup report

### Build Output
- **node_modules/** - Installed npm packages

---

## Root Level Files

```
EducodeAI/
```

- **EduCodeAI.sln** - Visual Studio solution file
- **package.json** - Root package cấu hình
- **package-lock.json** - Dependency lock file
- **.gitignore** - Git ignore rules
- **.gitattributes** - Git attributes
- **.github/** - GitHub workflows và cấu hình

---

## Technology Stack

### Backend
- **ASP.NET Core** - Web framework
- **Entity Framework Core** - ORM cho database operations
- **C#** - Programming language

### Frontend
- **React** - UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Build tool và development server
- **ESLint** - Code linting

---

## Development Workflow

1. **Backend Development**: Làm việc trong `educodeai-server/` directory
2. **Frontend Development**: Làm việc trong `educodeai-client/` directory
3. **Database**: Sử dụng Entity Framework migrations trong `educodeai-server/Migrations/`
4. **API Integration**: Frontend services trong `src/services/` giao tiếp với backend controllers
5. **Build & Deploy**: Sử dụng Docker cho backend containerization và Vite cho frontend builds
