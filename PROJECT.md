🚀 MERN Stack Chat Application: Deployment & DevOps Essentials

This project demonstrates a MERN (MongoDB, Express, React, Node.js) chat application with a focus on Continuous Integration (CI) and Continuous Deployment (CD) implemented using GitHub Actions.

The entire workflow—from code checkout and linting to deployment—is managed by a single, sequential pipeline file.

🔗 Deployed Application Links

Component

URL

Provider

Frontend Application (Client)

[https://chat-app-client-u6qp.onrender.com]

(render)

Backend API (Server)

[https://chat-app-server-0tl2.onrender.com]

( Render)

🛠️ Deployment Instructions

Environment Variable Templates (.env.example)

Developers must create a .env file in both the /server and /client directories based on these templates:

/server/.env.example

# MongoDB Connection String
MONGO_URI=mongodb+srv://socket:6jVZjl9UT20ZqGow@socket.lejofpl.mongodb.net/?appName=socket
PORT=5000
CLIENT_URL=[http://localhost:5173]
NODE_ENV=development


/client/.env.example

# VITE Environment variables MUST be prefixed with VITE_
VITE_SOCKET_URL=[https://chat-app-server-0tl2.onrender.com]


CI/CD Pipeline Configuration

The entire CI/CD workflow is defined in a single file, .github/workflows/ci-cd.yml.

The pipeline executes sequentially:

CI Phase (Lines 26-44): Install dependencies, and run the npm run lint || true command for the client. The || true ensures the pipeline continues to deployment even if lint errors exist.

Build Phase (Lines 47-49): Creates the production build of the React application (npm run build).

CD Phase (Lines 53-65): Uses curl to trigger deployment webhooks on Render, pushing updates to both the backend and frontend services.

📸 CI/CD Pipeline in Action

The following screenshot confirms the successful execution of the combined ci-cd.yml workflow, demonstrating all steps completed successfully, including the deployment triggers.

## 📸 CI/CD SCREENSHOTS

The following screenshot confirms the successful execution of the combined `ci-cd.yml` workflow, demonstrating all steps completed successfully, including the deployment triggers.

![Successful GitHub Actions Pipeline](./screenshots/CI/CD.png)

📈 Monitoring Documentation

This application employs essential monitoring strategies across both the client and server components to ensure operational stability.

Frontend Monitoring (Client)

Tool: Browser Console (Network/Console Tabs)

Method: We monitor client-side logs for successful socket.on('connect') events and track connection latency. The primary focus is tracking real-time status changes and ensuring the client application handles reconnections gracefully.

Backend Monitoring (Server)

Tool: Render Built-in Logs

Method: Render's platform provides continuous logging. We monitor these logs for:

500 Internal Server Errors: Indicates unhandled exceptions in API routes.

Socket Activity: Tracking large volumes of connect/disconnect events for potential client instability.

Health Checks: Ensuring the server instance remains responsive and handles traffic spikes.

Key Metrics Tracked: Uptime, Request Latency, and Memory Usage.