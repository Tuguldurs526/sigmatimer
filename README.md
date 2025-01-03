# SigmaTimer

## Introduction
SigmaTimer is a combined Pomodoro timer application designed for web, desktop, and mobile platforms. It provides a seamless experience to manage your work and break intervals using the Pomodoro technique. This application supports synchronization across devices, ensuring you can maintain your workflow no matter where you are.

## Features
- Web, desktop, and mobile support
- Synchronization between devices
- Customizable work and rest durations
- Real-time dashboard for session tracking
- Simple and user-friendly interface

## Installation

### Prerequisites
- Node.js and npm installed on your system

### Steps
1. Clone the repository and switch to the `tugo` branch:
   ```bash
   git clone https://github.com/Tuguldurs526/sigmatimer.git
   cd sigmatimer
   git checkout tugo
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
   This will automatically install dependencies for the backend, frontend, and desktop app.

3. Start the application:
   ```bash
   npm start
   ```
   This will run the backend, frontend, and Electron app concurrently.

## Development

### Directory Structure
- **app/**: Contains the Electron app files
- **backend/**: Contains the backend server files
- **frontend/**: Contains the React frontend application

### Available Scripts
- `npm start`: Starts the backend, frontend, and Electron app concurrently.
- `npm run install-all`: Installs dependencies for all subdirectories (backend, frontend, app).
- `npm run build`: Builds the backend, frontend, and Electron app.
- `npm run clean`: Cleans all node_modules folders.

## Deployment

To deploy the application locally:
1. Ensure all dependencies are installed:
   ```bash
   npm run install-all
   ```
2. Build the application:
   ```bash
   npm run build
   ```

## Contributing
If you'd like to contribute, please fork the repository and use a feature branch. Pull requests are warmly welcome.

## License
This project is licensed under the MIT License.
