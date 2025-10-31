# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

### Starting the Development Server
```bash
npm run dev          # Start with nodemon (auto-reload on changes)
npm start            # Start production server
```

The application runs on `http://localhost:3000` by default (configurable via `PORT` env variable).

### Dependencies
```bash
npm install          # Install all dependencies
```

### Environment Configuration
Copy `.env.example` to `.env` and configure:
- `APP_ID`: Feishu (Lark) app ID
- `APP_SECRET`: Feishu app secret
- `APP_TOKEN`: Multi-dimensional table token
- `TABLE_ID`: Table ID
- `PORT`: Server port (default: 3000)

### Deployment
- **Vercel** (recommended): Project is pre-configured with `vercel.json`
- One-click deploy via: https://vercel.com/new/clone?repository-url=https://github.com/wubh2012/navsite

## Project Architecture

### Technology Stack
- **Backend**: Node.js + Express
- **Frontend**: Vanilla JavaScript (no framework)
- **Data Source**: Feishu (Lark) multi-dimensional table API
- **Cache**: 5-minute server-side caching for API responses
- **PWA**: Full Progressive Web App support with Service Worker

### High-Level Structure

```
/
├── server.js                          # Express server & API routes
├── public/
│   ├── index.html                     # Main HTML entry point
│   ├── css/style.css                  # Main stylesheet
│   ├── js/
│   │   ├── app.js                     # Frontend entry point (modular)
│   │   └── modules/                   # Modular architecture (refactored)
│   │       ├── core/                  # Core modules
│   │       │   ├── pwa-manager.js     # PWA functionality
│   │       │   ├── theme-manager.js   # Skin/theme management
│   │       │   ├── data-manager.js    # Data fetching & caching
│   │       │   └── ui-renderer.js     # UI rendering logic
│   │       ├── features/              # Feature modules
│   │       │   ├── search-manager.js  # Search functionality
│   │       │   ├── link-manager.js    # Add/delete links
│   │       │   └── interaction-manager.js # Touch gestures, animations
│   │       └── utils/
│   │           └── common-utils.js    # Shared utilities
│   ├── manifest.json                  # PWA manifest
│   ├── sw.js                          # Service Worker
│   └── icons/                         # PWA icons (various sizes)
├── vercel.json                        # Vercel deployment config
├── REFACTOR.md                        # Architecture refactoring documentation
└── specs/                             # Feature specification documents
```

### Backend API Endpoints (server.js:179-438)

**Navigation Data**
- `GET /api/navigation` - Fetch categorized navigation data from Feishu table
  - Falls back to mock data if Feishu API fails
  - Returns: grouped categories, date info (including Chinese lunar calendar)

**Link Management**
- `POST /api/links` - Add new navigation link (server.js:287-389)
- `DELETE /api/links/:id` - Delete navigation link (server.js:392-438)

**Utilities**
- `GET /api/favicon?url=<url>` - Proxy to Google Favicon API with caching (server.js:224-279)

### Frontend Architecture (REFACTOR.md)

The frontend was refactored from a single 89KB `app.js` to a modular architecture with 9 focused modules:

**Core Modules** (`public/js/modules/core/`)
- **PWAManager**: Service worker registration, install prompts, update notifications
- **ThemeManager**: 6 skin themes, dark/light mode, user preference persistence
- **DataManager**: API communication, 5-minute cache management, default data handling
- **UIRenderer**: Item rendering, category menus, favicon handling, time display

**Feature Modules** (`public/js/modules/features/`)
- **SearchManager**: Mobile search UI, real-time results, keyword highlighting
- **LinkManager**: Add/delete functionality with form validation
- **InteractionManager**: Touch gestures, mobile menu, animation effects

**Utils** (`public/js/modules/utils/`)
- **CommonUtils**: Loading animations, particle effects, error handling, performance monitoring

Module Loading (public/js/app.js:7-35):
- All modules loaded asynchronously via Promises
- Dependencies loaded in correct order (core → features → utils)
- Global instance references for cross-module communication

### Data Flow

1. **Server Side** (server.js:23-61, 64-89):
   - Fetches `tenant_access_token` from Feishu API
   - Caches token for 2 hours with 5-minute buffer
   - Retrieves data from multi-dimensional table
   - Processes and groups by category with sorting

2. **Client Side** (modules/core/data-manager.js):
   - Calls `/api/navigation` endpoint
   - Caches response for 5 minutes
   - Falls back to mock data on API failure

3. **Rendering** (modules/core/ui-renderer.js):
   - Dynamically generates category sections
   - Fetches favicons via `/api/favicon` proxy
   - Updates time/date display including lunar calendar

### Key Features Implementation

**PWA Support**
- Service Worker: `public/sw.js` - offline caching, background sync
- Manifest: `public/manifest.json` - app metadata, icons, splash screens
- Install prompts handled by PWAManager

**Theme System**
- 6 built-in skin themes
- Auto dark/light mode based on system preference
- User selections persisted to localStorage
- Dynamic CSS variable injection (public/css/style.css)

**Favicon Integration**
- Google Favicon API proxy: `GET /api/favicon?url=<domain>`
- Fallback to transparent 1x1px image on failure
- 24-hour cache headers

**Chinese Localization**
- Lunar calendar using `lunar-javascript` library (server.js:92-112)
- Chinese weekday display
- Moment.js locale set to 'zh-cn' (server.js:7)

### Important Project Notes

1. **No Build Process**: This is a pure Node.js + vanilla JavaScript project. No bundling, transpilation, or build steps required. Use `npm run dev` for development.

2. **Modular Frontend**: The frontend uses ES6 modules loaded via script tags. See `public/js/app.js` for the module loading pattern.

3. **API Dependencies**:
   - Feishu multi-dimensional table for data storage
   - Google Favicon API for icons (proxied through server)
   - No database - data lives in Feishu table

4. **Deployment**: Configured for Vercel with `vercel.json`. All requests route to `server.js` which handles both API and static file serving.

5. **Mock Data**: Server includes fallback mock data (server.js:151-176) when Feishu API is unavailable for development/testing.

6. **Refactoring**: See `REFACTOR.md` for detailed documentation of the modular architecture refactor from monolithic to modular design.

### Common Development Tasks

**Adding a New Feature**
1. Create module in `public/js/modules/features/` or appropriate subdirectory
2. Add script tag to `public/js/app.js` `modules` array
3. Initialize in `initFeatureModules()` function
4. Follow existing module pattern (class-based with global export)

**Modifying API**
- Main API logic in `server.js` lines 179-438
- Add new routes following existing patterns
- Update Feishu API calls in `getBitableData()` function

**Styling Changes**
- Main styles: `public/css/style.css`
- Theme variables defined as CSS custom properties
- PWA-specific styles may be inlined in HTML

**Testing Changes**
- No automated test suite currently
- Test manually by starting dev server: `npm run dev`
- API can be tested directly: `http://localhost:3000/api/navigation`

### Environment Variables Reference

Required for full functionality (`.env.example`):
```
APP_ID=your_app_id                  # Feishu app identifier
APP_SECRET=your_app_secret          # Feishu app secret
APP_TOKEN=your_app_token            # Multi-dimensional table token
TABLE_ID=your_table_id              # Table identifier
PORT=3000                           # Server port
```

Without configuration, the app runs with mock data but link add/delete features will fail.

### Documentation Files

- `README.md` - Complete setup and deployment guide
- `REFACTOR.md` - Frontend architecture refactoring details
- `doc/` - Detailed setup tutorials (Feishu app creation, table configuration)
- `specs/` - Feature requirements and design documents
