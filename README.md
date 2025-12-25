# 📊 Work Report Svelte

> A modern, elegant dashboard for tracking work hours, visualizing progress, and calculating earnings. Built with SvelteKit and Tailwind CSS.

![Svelte](https://img.shields.io/badge/svelte-%23f1413d.svg?style=for-the-badge&logo=svelte&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)

## ✨ Features

*   **📈 Real-time Tracking**: Automatically syncs work data from local StaffCounter logs.
*   **🎯 Goal Management**: Set and track weekly hour targets with visual progress bars.
*   **💰 Earnings Calculator**: Real-time conversion of hours to USD and BDT with customizable rates.
*   **📊 Data Visualization**: Interactive charts for daily, weekly, and monthly storage.
*   **🌗 Dark/Light Mode**: Beautiful, responsive UI with automatic system theme detection.
*   **📝 Detailed Reporting**: View detailed breakdown of daily work sessions.
*   **⚡ Fast & Reactive**: Built on Svelte 5 for blazing fast performance.

## 🛠️ Tech Stack

### Frontend
-   **Framework**: SvelteKit (Svelte 5)
-   **Styling**: Tailwind CSS v4, Bits UI
-   **Icons**: Lucide Svelte
-   **Charts**: Chart.js
-   **Utils**: Date-fns

### Backend (`/Work-Time-Backend`)
-   **Runtime**: Node.js (Express)
-   **Database**: MySQL
-   **Scraping**: Cheerio (parses local HTML logs)

## 🚀 Getting Started

### Prerequisites
-   Node.js (v18+)
-   pnpm (recommended)
-   MySQL Server
-   StaffCounter desktop app (installed and logging locally)

### Installation

1.  **Clone the repository**
    ```bash
    git clone <repository-url>
    cd Work-Report-Svelte
    ```

2.  **Install Frontend Dependencies**
    ```bash
    pnpm install
    ```

3.  **Setup the Backend**
    Navigate to the backend directory and install dependencies:
    ```bash
    cd Work-Time-Backend
    npm install
    ```

### Configuration

#### Backend
1.  Ensure MySQL is running.
2.  Create the database using `Work-Time-Backend/schema.sql`.
3.  Configure database connection in `Work-Time-Backend/server.js` or separate config file (if applicable).
4.  **Important**: detailed in `api_documentation.md`, the backend looks for logs at `C:/Program Files (x86)/StaffCounter/logs/USER/`. Ensure this path matches your environment or update `worktime.py`/`workTimeScraper.js`.

#### Frontend
1.  The frontend connects to the backend at `http://192.168.0.2:88` by default (see `src/lib/config.ts` or `api_documentation.md`). Update this if running locally or on a different port.

### Running the App

1.  **Start the Backend**:
    ```bash
    cd Work-Time-Backend
    node server.js
    # OR use nodemon
    npx nodemon server.js
    ```

2.  **Start the Frontend**:
    ```bash
    # In the root directory
    pnpm dev
    ```

3.  Open your browser at `http://localhost:5173`.

## 📂 Project Structure

```
Work-Report-Svelte/
├── src/
│   ├── lib/
│   │   ├── components/   # UI Components (Header, Charts, etc.)
│   │   ├── stores/       # Svelte stores for state management
│   │   ├── utils/        # Helper functions
│   │   └── types.ts      # TypeScript interfaces
│   └── routes/           # SvelteKit File-based routing
├── Work-Time-Backend/      # Node.js API & Scraper
│   ├── database/         # SQL schema
│   ├── scripts/          # Scraping logic
│   └── server.js         # Express app entry point
└── ...config files
```

## 📄 License

This project is for personal use.

---

> Built with ❤️ using Svelte.
