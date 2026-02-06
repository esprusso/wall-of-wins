# Wall of Wins 🧱🏆

A digital space to track your daily victories, small or big. "Wall of Wins" is designed to help you build consistency, gratitude, and a visual history of your achievements with a charming, hand-drawn aesthetic.

## ✨ Features

- **Daily Logging**: Quickly add text-based wins to your daily board.
- **Photo Memories**: Attach images to your wins to make them memorable.
- **Categorization**: Organize wins with color-coded sticky notes:
  - 🟨 **Yellow**: General
  - 🟩 **Green**: Personal/Health
  - 🟦 **Blue**: Work
  - 🩷 **Pink**: Creative/Fun
- **Hall of Fame**: Star your favorite wins to keep them in a dedicated "Hall of Fame" drawer.
- **Consistency Tracking**: View your activity heatmap and track your current/best streaks.
- **Calendar Navigation**: Browse past wins using a monthly calendar view.
- **Drag & Drop**: Reorder your daily wins exactly how you want them.
- **Search**: Instantly find past memories with a powerful search bar.
- **Theming**: Toggle between Light ☀️ and Dark 🌙 modes.
- **Responsive Design**: Works great on desktop and mobile.

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Language**: JavaScript
- **Database**: SQLite (via `better-sqlite3`) for robust, local-first data storage.
- **Styling**: CSS Modules with a custom hand-drawn/paper aesthetic.
- **Drag & Drop**: `@dnd-kit`
- **Animations**: `canvas-confetti` for celebrations.

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd wall-of-wins
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000) to see the app.

## 🐳 Deployment & Self-Hosting

This project is designed to be self-hosted, specifically optimized for environments like a Synology NAS using Docker.

### Docker

1. **Build the image:**
   ```bash
   docker build -t wall-of-wins .
   ```

2. **Run the container:**
   ```bash
   docker run -d -p 3000:3000 -v ./db:/app/db -v ./public/uploads:/app/public/uploads wall-of-wins
   ```

*Note: The `deploy.sh` script is available for automated deployment workflows, specifically tailored for rsync/ssh deployment to remote servers.*

## 📂 Project Structure

- `src/app`: Main application routes and views (Next.js App Router).
- `src/components`: Reusable UI components (StickyNote, Calendar, DateStrip, etc.).
- `src/lib`: Utility functions and database configuration.
- `db`: SQLite database file location.
- `public`: Static assets and uploaded images.

## 🤝 Contributing

Feel free to fork this project and make it your own! Pull requests for new features or bug fixes are welcome.

## 📄 License

[MIT](LICENSE)
