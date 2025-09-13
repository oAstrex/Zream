# StreamHub

A modern media streaming hub that combines TMDB movie data, Jackett torrent indexing, and TorBox cloud downloading to create a seamless streaming experience with real-time torrent cache detection.

## 🌟 Features

- 🎬 **TMDB Integration**: Browse popular movies with rich metadata and high-quality posters
- 🔍 **Multi-Indexer Search**: Search across multiple torrent indexers via Jackett
- ⚡ **TorBox Cache Detection**: Instant identification of cached torrents with star indicators
- 🎯 **Intelligent Ranking**: Advanced torrent ranking by quality, seeders, and metadata
- 📱 **Modern UI**: Clean, responsive React frontend with Tailwind CSS
- 🚀 **Real-time Updates**: Live torrent status via Server-Sent Events
- 🌐 **Network Accessible**: Frontend configured to listen on all network interfaces

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  React Frontend │◄──►│   Express API   │◄──►│     Jackett     │
│   (Port 5173)   │    │   (Port 4000)   │    │   (Indexers)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │      TMDB       │    │     TorBox      │
                       │   Movie Data    │    │ Seedbox Manager │
                       └─────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ with npm
- **Jackett** instance running
- **TMDB API** v4 Bearer token
- **TorBox API** token (optional but recommended for cache detection)

### Backend Setup

1. **Clone and install dependencies**
   ```bash
   git clone https://github.com/oAstrex/Zream.git
   cd Zream
   npm install
   ```

2. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # TMDB Configuration (Required)
   TMDB_BEARER=your_tmdb_v4_bearer_token

   # Jackett Configuration (Required)
   JACKETT_HOST=http://jacket_host_ip/url:9117
   JACKETT_API_KEY=your_jackett_api_key

   # TorBox Configuration (Optional - enables cache detection)
   TORBOX_API_TOKEN=your_torbox_api_token

   # Server Configuration
   PORT=4000
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   npm install
   ```

2. **Start the development server**
   ```bash
   npm run dev
   ```

   The frontend will be available at:
   - **Local**: `http://localhost:5173`
   - **Network**: `http://[your-ip]:5173` (accessible from other devices)

## 🔧 Configuration Guide

### TMDB Setup

1. Create an account at [themoviedb.org](https://www.themoviedb.org)
2. Navigate to Settings → API
3. Generate a **v4 API Read Access Token** (Bearer token)
4. Add it to your `.env` file as `TMDB_BEARER`

### Jackett Configuration

1. Install [Jackett](https://github.com/Jackett/Jackett)
2. Configure your preferred indexers:
   - **Public**: 1337x, ThePirateBay, RARBG clones, YTS, EZTV
   - **Private**: Configure with your credentials/cookies
3. Copy the API key from Jackett's dashboard
4. Update `JACKETT_HOST` and `JACKETT_API_KEY` in your `.env`

**Indexer Recommendations:**
- Start with 3-5 public indexers for testing
- Use the "Test" button in Jackett to verify each indexer
- Red status = failure (often Cloudflare or authentication issues)

### TorBox Setup

1. Create an account at [TorBox](https://torbox.app)
2. Generate an API token from your account settings
3. Add it as `TORBOX_API_TOKEN` in your `.env`

**Benefits of TorBox integration:**
- ⭐ Cache detection shows instantly available torrents
- 🚀 Cached torrents download immediately
- 📊 Real-time download progress tracking

## 📡 API Reference

### Movies

#### Get Popular Movies
```http
GET /api/movies/popular?page=1
```

**Response:**
```json
{
  "page": 1,
  "results": [
    {
      "id": 123456,
      "title": "Movie Title",
      "overview": "Movie description...",
      "poster_path": "/path/to/poster.jpg",
      "release_date": "2023-01-01",
      "vote_average": 7.5
    }
  ],
  "total_pages": 500,
  "total_results": 10000
}
```

#### Discover Movies
```http
GET /api/movies/discover?with_genres=28&primary_release_year=2023&page=1
```

### Torrent Search with Cache Detection

#### Search for Sources
```http
POST /api/sources/search
Content-Type: application/json

{
  "title": "Movie Title",
  "year": 2023
}
```

**Response:**
```json
{
  "query": "Movie Title 2023",
  "count": 45,
  "results": [
    {
      "Title": "Movie.Title.2023.2160p.BluRay.x265-GROUP",
      "MagnetUri": "magnet:?xt=urn:btih:...",
      "Seeders": 1250,
      "Size": 15728640000,
      "Tracker": "1337x",
      "torboxCached": true,
      "_score": 95.2
    }
  ]
}
```

**Key Features:**
- `torboxCached`: Boolean indicating if torrent is cached on TorBox
- `_score`: Quality-based ranking score
- Smart fallback queries if initial search returns no results

### TorBox Integration

#### Add Torrent
```http
POST /api/torbox/add
Content-Type: application/json

{
  "magnet": "magnet:?xt=urn:btih:...",
  "name": "Movie Title"
}
```

**Response:**
```json
{
  "localId": "uuid-string",
  "cached": { "hash": "...", "found": true },
  "torbox": { "id": 12345, "status": "downloading" }
}
```

#### Real-time Status Stream
```http
GET /api/torbox/stream/:localId
```

Server-Sent Events providing live updates:
```
event: update
data: {"localId":"...","status":"downloading","progress":45}

event: done
data: {}
```

## 🎯 Quality Ranking System

StreamHub implements an intelligent ranking algorithm that prioritizes quality:

### Scoring Algorithm
```javascript
Score = (Seeders × 2) + Quality Score + Size Score
```

### Quality Points
- **4K/2160p**: +60 points
- **1080p**: +35 points  
- **720p**: +15 points
- **REMUX**: +18 points
- **BluRay/BDRip**: +10 points
- **HEVC/x265**: +6 points
- **x264**: +3 points
- **WEB-DL/WEBRip**: +4 points

### Penalties
- **CAM/TS releases**: -50 points
- **Small file sizes** (<700MB): -10 points

### Cache Priority
Cached torrents are visually highlighted with ⭐ indicators and sorted prominently in results.

## 🖥️ Frontend Features

### Movie Discovery
- **TMDB Integration**: Browse popular movies with rich metadata
- **High-Quality Images**: Poster and backdrop images from TMDB
- **Responsive Design**: Works seamlessly on desktop and mobile

### Torrent Search & Display
- **Visual Quality Indicators**: Clear resolution and format labeling
- **Cache Status**: ⭐ stars indicate TorBox cached torrents
- **Detailed Metadata**: File size, seeders, tracker information
- **One-Click Adding**: Direct integration with TorBox

### Real-time Progress Tracking
- **Live Updates**: Progress bars update via Server-Sent Events
- **Status Monitoring**: Real-time download status changes
- **Automatic UI Updates**: No manual refresh required

## 🔧 Development

### Project Structure
```
StreamHub/
├── src/
│   ├── server.ts      # Main Express server
│   ├── config.ts      # Environment configuration
│   ├── tmdb.ts        # TMDB API integration
│   ├── jackett.ts     # Jackett API with fallback queries
│   ├── torbox.ts      # TorBox API with cache detection
│   ├── magnet.ts      # Magnet link utilities
│   └── state.ts       # In-memory state management
├── frontend/
│   ├── src/
│   │   ├── App.tsx    # Main React component
│   │   ├── api.ts     # API client functions
│   │   └── main.tsx   # React entry point
│   └── package.json
├── package.json
└── nodemon.json
```

### Available Scripts

**Backend:**
```bash
npm run dev     # Start development server with nodemon
npm run build   # Compile TypeScript
npm start       # Start production server
```

**Frontend:**
```bash
npm run dev     # Start Vite dev server (accessible on network)
npm run build   # Build for production
npm run preview # Preview production build
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `TMDB_BEARER` | ✅ | TMDB v4 API Bearer token |
| `JACKETT_HOST` | ✅ | Jackett server URL |
| `JACKETT_API_KEY` | ✅ | Jackett API key |
| `TORBOX_API_TOKEN` | ❌ | TorBox API token (enables cache detection) |
| `PORT` | ❌ | Backend server port (default: 4000) |

## 🚀 Production Deployment

### Backend Deployment
```bash
# Build the application
npm run build

# Start with process manager
pm2 start dist/server.js --name streamhub-backend

# Or with systemd
sudo systemctl enable streamhub-backend
sudo systemctl start streamhub-backend
```

### Frontend Deployment
```bash
# Build the application
cd frontend
npm run build

# Serve with nginx
sudo cp -r dist/* /var/www/streamhub/
```

### Docker Support
```yaml
version: '3.8'
services:
  streamhub-backend:
    build: .
    ports:
      - "4000:4000"
    environment:
      - TMDB_BEARER=${TMDB_BEARER}
      - JACKETT_HOST=${JACKETT_HOST}
      - JACKETT_API_KEY=${JACKETT_API_KEY}
      - TORBOX_API_TOKEN=${TORBOX_API_TOKEN}

  streamhub-frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - streamhub-backend
```

## 🐛 Troubleshooting

### No Search Results
1. **Check Jackett indexers**: Ensure at least 3-5 indexers are configured and testing green
2. **Verify API keys**: Test manual curl requests to Jackett API
3. **Network connectivity**: Ensure backend can reach Jackett server
4. **Indexer health**: Some trackers may be down or behind Cloudflare

### TorBox Integration Issues
1. **Missing cache indicators**: Verify `TORBOX_API_TOKEN` is set correctly
2. **Download failures**: Check TorBox account status and credit balance
3. **Stream connection lost**: SSE connections may timeout, frontend will show error

### Frontend Access Issues
1. **Network not accessible**: Ensure `--host` flag is used in dev script
2. **API proxy errors**: Check that backend is running on port 4000
3. **CORS issues**: Ensure frontend is proxying requests correctly

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Create a Pull Request

## 📄 License

This project is licensed under the **Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License**.

This means you are free to:
- **Share** — copy and redistribute the material in any medium or format
- **Adapt** — remix, transform, and build upon the material

Under the following terms:
- **Attribution** — You must give appropriate credit and indicate if changes were made
- **NonCommercial** — You may not use the material for commercial purposes
- **ShareAlike** — If you remix or transform the material, you must distribute your contributions under the same license

For more details, see the [full license text](https://creativecommons.org/licenses/by-nc-sa/4.0/).

## ⚖️ Legal Notice

**Important**: This application is designed for personal use only. Users are responsible for ensuring compliance with:

- Local copyright and intellectual property laws
- Terms of service for all integrated services (TMDB, TorBox, indexers)
- Applicable streaming and downloading regulations in their jurisdiction

The developers of StreamHub do not encourage or condone piracy or copyright infringement. This tool is intended for legitimate use cases such as:
- Managing legally owned media collections
- Downloading content that is in the public domain
- Accessing content through legitimate subscription services

## 🙏 Acknowledgments

- **TMDB** for providing comprehensive movie metadata
- **TorBox** for cloud torrent management services
- **Jackett** for unified torrent indexer access
- **React & Vite** for the modern frontend framework
- **Tailwind CSS** for styling utilities

## 📞 Support

For issues and feature requests, please use the [GitHub issue tracker](https://github.com/oAstrex/StreamHub/issues).

For general questions or discussions, feel free to open a [GitHub Discussion](https://github.com/oAstrex/StreamHub/discussions).

---

**StreamHub** - Your personal media streaming hub 🎬✨
