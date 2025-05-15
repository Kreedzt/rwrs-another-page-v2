# RWRS Another Page(V2)

[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=Kreedzt_rwrs-another-page-v2&metric=sqale_rating)](https://sonarcloud.io/summary/new_code?id=Kreedzt_rwrs-another-page-v2)
[![codecov](https://codecov.io/gh/Kreedzt/rwrs-another-page-v2/branch/master/graph/badge.svg?token=MWGXZH7GO9)](https://codecov.io/gh/Kreedzt/rwrs-another-page-v2)
![build status](https://github.com/Kreedzt/rwrs-another-page-v2/actions/workflows/ci.yml/badge.svg?branch=master)

A clean and modern server browser for Running with Rifles (RWR) game, inspired by [rwrstats](https://rwrstats.com/).

## Overview

RWRS Another Page provides a pure and efficient way to browse Running with Rifles game servers. Built with modern web technologies, it offers:

- Real-time server list with auto-refresh capability
- Advanced filtering and search functionality
- Multiple view modes (table and map-based)
- Multilingual support (English and Chinese)
- Mobile-friendly responsive design

## Dependencies

This project requires the following backend:
- [rwrs-server](https://github.com/Kreedzt/rwrs-server) - Provides the API for server data

## Development

### Prerequisites

- Node.js (v20 or later recommended)
- pnpm package manager

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/rwrs-another-page.git
   cd rwrs-another-page
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

3. Start the rwrs-another-page container:
   ```bash
   docker pull zhaozisong0/rwrs-another-page:latest
   docker run -d --name rwrs-another-page --network rwrs-network -p 80:80 zhaozisong0/rwrs-another-page:latest
   ```

4. Configure a reverse proxy (like Nginx) to route:
   - `/api/*` requests to the rwrs-server container
   - `/*` requests to the rwrs-another-page container

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
docker run -p 80:80 -e "HEADER_SCRIPTS=<script>console.log('Custom script');</script>" zhaozisong0/rwrs-another-page:latest
```

### Manual Deployment

1. Build the project:
   ```bash
   pnpm build
   ```

2. Either:
   - Deploy the contents of the `build` directory to your web server and configure it to proxy API requests to the rwrs-server backend.
   - Copy the contents of the `build` directory to the `/static` directory of your rwrs-server installation.

## License

- [MIT](LICENSE)
