# OpenTube

OpenTube is a web application designed to provide a customized YouTube viewing experience. Built with Preact and Vite, it leverages `youtubei.js` and `video.js` for video streaming and content retrieval. It focuses on performance and a clean, customizable user interface.

![Image 1](doc/img/image1.png)
![Image 2](doc/img/image2.png)
![Image 3](doc/img/image3.png)

## Libraries Used in This Project

### Core
- **Preact**: A lightweight version of React.

- **Vite**: A next-generation frontend tool.

- **TypeScript**: Typed JavaScript that improves the developer experience.

### Video and API
- **video.js / @videojs/react**: A robust video player implementation.

- **youtubei.js**: A powerful library for interacting with YouTube's internal API.

- **videojs-youtube**: An integrated library for playing YouTube videos within video.js.

### UI and Styling
- **TailwindCSS**: A utility-first CSS framework.

- **shadcn / Radix UI**: Highly accessible and customizable component primitives.

- **Lucide React**: A beautiful and consistent icon library.

### State and Storage
- **Dexie.js**: An IndexedDB wrapper for local data persistence.

## How to Use

1. **Installing Dependencies:**

```bash

bun install
```

2. **Starting the Development Server:**

```bash

bun run dev
```

3. **Building for Production:**

```bash

bun run build
```

4. **Starting the Backend/Utility Server:**

```bash

bun run server
```

## Roadmap

### Currently Implemented
- [x] Basic UI Structure (Layout, Sidebar, Header)
- [x] Video Player Integration
- [x] Video Page
- [x] Routing Settings
- [x] Initial YouTube API Integration
- [x] Offline Download Support
- [x] Watch Later Feature Management
- [x] Ad Removal
- [x] Accountless Support

### Planned
- [ ] Channel Page
- [ ] Enhanced Search Functionality
- [ ] User Authentication/Subscription Management
- [ ] Advanced History Function
- [ ] Customization of Settings
- [ ] App Development
- [ ] Advanced Settings (Like YouTube Enchanser)
- [ ] Other Useful Features