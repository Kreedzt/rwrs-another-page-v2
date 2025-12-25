# Robin Web(RWRS Another Page V2)

[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=Kreedzt_rwrs-another-page-v2&metric=sqale_rating)](https://sonarcloud.io/summary/new_code?id=Kreedzt_rwrs-another-page-v2)
[![codecov](https://codecov.io/gh/Kreedzt/rwrs-another-page-v2/branch/master/graph/badge.svg?token=MWGXZH7GO9)](https://codecov.io/gh/Kreedzt/rwrs-another-page-v2)
![build status](https://github.com/Kreedzt/rwrs-another-page-v2/actions/workflows/ci.yml/badge.svg?branch=master)

A clean and modern server browser for Running with Rifles (RWR) game, inspired by [rwrstats](https://rwrstats.com/).

## Overview

Robin web provides a pure and efficient way to browse Running with Rifles game servers and player statistics. Built with modern web technologies, it offers:

- Real-time server list with auto-refresh capability
- Player leaderboard browsing with comprehensive statistics
- Multi-database player statistics (Invasion, Pacific, Prereset Invasion)
- Advanced filtering and search functionality
- Multiple view modes (table and map-based)
- Multilingual support (English and Chinese)
- Mobile-friendly responsive design

## Technical Stack

- **Framework**: SvelteKit 2.16.0 with Svelte 5
- **Styling**: Tailwind CSS 4.0 with DaisyUI components
- **Language**: TypeScript 5.0
- **Testing**: Vitest (unit) + Playwright (E2E)
- **i18n**: @inlang/paraglide-js
- **Package Manager**: pnpm

## Features

- Real-time server list with auto-refresh capability
- Player leaderboard browser with 15+ statistics (kills, deaths, K/D, score, time played, rank progression, etc.)
- Multi-database player statistics (Invasion, Pacific, Prereset Invasion)
- Advanced filtering with preset quick filters (Official, WW2, Dominance, Castling, HellDivers mods)
- Full-text search across servers and players with keyboard shortcut (/) support
- Multi-level column sorting (ascending/descending/clear)
- Configurable pagination with adjustable page size (10/20/50/100)
- Dual view modes: data table (desktop) and responsive cards (mobile)
- Column visibility toggles with persistent localStorage settings
- Map preview images with modal display
- Multilingual support (English and Chinese) with dynamic switching
- Mobile-friendly responsive design with infinite scroll
- Accessible keyboard navigation and ARIA-compliant markup
- URL state management for bookmarkable views

## Dependencies

This project requires the following backend:

- [rwrs-server](https://github.com/Kreedzt/rwrs-server) - Provides the API for server data

## Development

### Prerequisites

- Node.js (v22 or later recommended)
- pnpm package manager

### Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/rwrs-another-page-v2.git
   cd rwrs-another-page-v2
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Start the development server:
   ```bash
   pnpm dev
   ```

The application will be available at http://localhost:5173 and will proxy API requests to the backend server.

### Building

To build for production:

```bash
pnpm build
```

To build with CDN support (assets served from a CDN):

```bash
# Scenario 1: All assets (JS/CSS/Images) on the same CDN path
CDN_URL=https://assets.kreedzt.cn pnpm build:cdn

# Scenario 2: Separate CDN for images (e.g. OSS bucket for images)
# JS/CSS -> https://assets.kreedzt.cn/rwrs-v2-web-assets/...
# Images -> https://img.kreedzt.cn/images/...
CDN_URL=https://assets.kreedzt.cn/rwrs-v2-web-assets CDN_IMAGE_URL=https://img.kreedzt.cn/ pnpm build:cdn
```

## Deployment

### Docker

There are two ways to deploy using Docker:

#### Option 1: Separate Containers with Network

1. Create a Docker network:

   ```bash
   docker network create rwrs-network
   ```

2. Start the rwrs-server container:

   ```bash
   docker pull zhaozisong0/rwrs-server:latest
   docker run -d --name rwrs-server --network rwrs-network -e "HOST=0.0.0.0" -e "PORT=80" zhaozisong0/rwrs-server:latest
   ```

3. Start the rwrs-another-page-v2 container:

   ```bash
   docker pull zhaozisong0/rwrs-another-page-v2:latest
   docker run -d --name rwrs-another-page-v2 --network rwrs-network -p 80:80 zhaozisong0/rwrs-another-page-v2:latest
   ```

4. Configure a reverse proxy (like Nginx) to route:
   - `/api/*` requests to the rwrs-server container
   - `/*` requests to the rwrs-another-page-v2 container

#### Option 2: Single Container

You can also deploy by copying the frontend build to the rwrs-server's static directory:

1. Build the frontend:

   ```bash
   pnpm build
   ```

2. Copy the contents of the `build` directory to the `/static` directory of the rwrs-server container:

   ```bash
   docker cp ./build/. rwrs-server:/static/
   ```

   Or mount the directory when starting the container:

   ```bash
   docker run -d -p 80:80 -e "HOST=0.0.0.0" -e "PORT=80" -v $(pwd)/build:/static zhaozisong0/rwrs-server:latest
   ```

You can inject custom header scripts using the `HEADER_SCRIPTS` environment variable:

```bash
docker run -p 80:80 -e "HEADER_SCRIPTS=<script>console.log('Custom script');</script>" zhaozisong0/rwrs-another-page-v2:latest
```

### Manual Deployment

1. Build the project:

   ```bash
   pnpm build
   ```

2. Either:
   - Deploy the contents of the `build` directory to your web server and configure it to proxy API requests to the rwrs-server backend.
   - Copy the contents of the `build` directory to the `/static` directory of your rwrs-server installation.

## Disclaimer

This project is an independent work and is **not affiliated, associated, authorized, endorsed by, or in any way officially connected with the original "rwrs" project or its authors**.  
The only relation is that this project was **inspired by the idea of rwrs**, but it is written entirely from scratch and does not contain any code, documentation, or resources from the original repository.

All data used by this project is obtained transparently and directly from the public API provided by the official RWR service.  
This project:

- Does not store, cache, modify, or permanently retain any external data.
- Acts only as a live data viewer/relay querying the official API at request time.
- Does not operate any independent backend database or persistent storage.
- Does not claim ownership over the data provided by the official RWR API.

All trademarks, service names, and project names mentioned belong to their respective owners. Their use here is purely for **identification and reference purposes**, and does not imply any form of partnership or endorsement.

Users should refer to the official RWR project and its documentation for authoritative information.

## License

- [MIT](LICENSE)
