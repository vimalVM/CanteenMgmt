# Canteen Management System

A full-stack web application designed to manage canteen operations, including ordering, menu management, cart handling, and analytics. 

## Tech Stack

### Backend
- **Java 17**
- **Spring Boot 3.4.x** (Web, Data MongoDB, Security, Validation)
- **MongoDB Atlas**
- **Lombok**
- **JWT** (JSON Web Tokens for authentication)
- **Maven**

### Frontend
- **React 18**
- **Vite**
- **React Router Dom**
- **Bootstrap / React-Bootstrap**
- **Axios**
- **Recharts** (for Analytics)
- **React Hook Form**
- **Date-fns**

## Project Structure

- `canteen-frontend/`: Contains the React frontend application.
- `src/`: Contains the Spring Boot backend Java source code.
- `pom.xml`: Maven configuration for the backend dependencies.

## How to Run the Application

### 1. Start the Backend (Spring Boot)

The backend connects to a MongoDB Atlas cluster, so no local database setup is required.

1. Open a terminal in the root directory (`CanteenMgmt`).
2. Run the application using the Maven wrapper:
   ```bash
   # On Windows
   .\mvnw.cmd spring-boot:run

   # On macOS/Linux
   ./mvnw spring-boot:run
   ```
The backend server will start on `http://localhost:8081`.

### 2. Start the Frontend (React + Vite)

1. Open a terminal and navigate to the frontend directory:
   ```bash
   cd canteen-frontend
   ```
2. Install the necessary dependencies (only required the first time):
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
The frontend application will be accessible at `http://localhost:5173`.

## Features

- User Authentication (Login / Register) via JWT
- Menu Browsing and Cart Management
- Order Placement and Tracking
- Daily token number generation for orders
- Canteen Analytics and Reporting (Daily, Weekly, Hourly sales)
- Secure API endpoints using Spring Security

## License

This project is licensed under the MIT License.
