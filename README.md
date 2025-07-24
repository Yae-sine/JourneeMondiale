# Gustave-Roussey - Donation & Event Management Platform
[![Java](https://img.shields.io/badge/Java-17-orange.svg)](https://openjdk.java.net/projects/jdk/17/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.3-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![Stripe](https://img.shields.io/badge/Stripe-Payment-blue.svg)](https://stripe.com)
[![Docker](https://img.shields.io/badge/Docker-Container-blue.svg)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)


A comprehensive full-stack web application for managing donations, subscriptions, and events with integrated Stripe payment processing.

## ✨ Preview 
<table>
  <tr>
    <td>
      <img width="425" alt="Screenshot 1" src="https://github.com/user-attachments/assets/6527a5e3-a4d5-44c0-a600-361751ec5f07" />
    </td>
    <td>
      <img width="450" alt="Screenshot 4" src="https://github.com/user-attachments/assets/f62d8727-8725-46a6-96de-3b0ef781352c" />
    </td>
  </tr>
  <tr>
    <td>
      <img width="450" alt="Screenshot 3" src="https://github.com/user-attachments/assets/d0ed76f1-4bf6-4894-82c7-2814e432fe9a" />
    </td>
    <td>
      <img width="450" alt="Screenshot 2" src="https://github.com/user-attachments/assets/152b8d8e-9987-4dc0-8b51-52ab499a45e3" />
    </td>
  </tr>
  <tr>
    <td>
      <img width="425" alt="Screenshot 5" src="https://github.com/user-attachments/assets/1a76aa77-a12d-442d-89e1-bf1cf8d34184" />
    </td>
    <td>
      <img width="425" alt="Screenshot 6" src="https://github.com/user-attachments/assets/ea4e28aa-2de6-433a-b3ac-eb60dd147596" />
    </td>
  </tr>
  <tr>
    <td>
      <img width="425" alt="Screenshot 7" src="https://github.com/user-attachments/assets/73b295f0-98df-40dd-bf7f-3fd563408f81" />
    </td>
    <td>
       <img width="425" alt="Screenshot 2025-07-24 205215" src="https://github.com/user-attachments/assets/8df7554f-fb28-461e-8b2a-7698c989d975" />
    </td>
  </tr>
</table>

## 🌟 Features

### 🔐 Authentication & Authorization
- User registration and login with JWT-based authentication
- Role-based access control (Admin/User)
- HTTP-only cookie security for session management
- Protected routes and unauthorized access handling


### 💳 Payment Integration
- Stripe payment processing for donations and subscriptions
- Multiple donation tiers with predefined amounts
- Subscription management with recurring payments
- Payment status tracking and history
- Failed payment handling and retry mechanisms

### 👥 User interface
- User profile management
- Personal donation history
- Subscription tracking
- Event participation management

### 🎯 Admin Dashboard
- User management and oversight
- Donation analytics and reporting
- Subscription management
- Event creation and management
- Comprehensive admin interface

### 📅 Event Management
- Event creation and editing
- Event listing and details
- User event participation
- Event status management

### 🎨 UI
- Responsive design with Tailwind CSS
- Modern, clean interface
- Mobile-friendly navigation

## 🛠️ Tech Stack

### Backend
- **Framework**: Spring Boot 3.x
- **Language**: Java 17
- **Database**: H2 (file-based for persistence)
- **Security**: Spring Security with JWT
- **Payment**: Stripe API
- **Build Tool**: Maven
- **Architecture**: RESTful API

### Frontend
- **Framework**: React 18
- **Language**: JavaScript (ES6+)
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **HTTP Client**: Axios

### DevOps & Deployment
- **Containerization**: Docker & Docker Compose
- **Web Server**: Nginx (for serving React app)
- **Reverse Proxy**: Nginx (for API routing)
- **Orchestration**: Docker Compose with custom networks

## 🚀 Quick Start with Docker

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- Git for cloning the repository

### Installation Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Yae-sine/JourneeMondiale.git
   cd JourneeMondiale
   ```

2. **Set up environment variables:**
   
   Create a `.env` file in the project root:
   Edit the `.env` file and add your Stripe secret key:
   ```env
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
   ```

3. **Configure backend properties:**
   ```bash
   cp Backend/src/main/resources/application-docker.properties.example Backend/src/main/resources/application-docker.properties
   ```
   
   Edit the `application-docker.properties` file and update the Stripe secret key reference.

4. **Configure frontend environment:**
   
   Create a `.env.production` file in the `frontend` directory:
   ```env
   REACT_APP_API_BASE_URL=
   REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
   REACT_APP_PRODUCT_ID_1=price_your_product_id_1
   REACT_APP_PRODUCT_ID_2=price_your_product_id_2
   REACT_APP_PRODUCT_ID_3=price_your_product_id_3
   ```

5. **Build and run the application:**
   ```bash
   docker-compose up --build
   ```

6. **Access the application:**
   - **Frontend**: http://localhost
   - **Backend API**: http://localhost:8080
   - **H2 Database Console**: http://localhost:8080/h2-console


## 📁 Project Structure

```
JourneeMondiale/
├── Backend/                          # Spring Boot backend
│   ├── src/main/java/               # Java source code
│   ├── src/main/resources/          # Configuration files
│   ├── Dockerfile                   # Backend Docker configuration
│   └── pom.xml                      # Maven dependencies
├── frontend/                        # React frontend
│   ├── src/                         # React source code
│   ├── public/                      # Static assets
│   ├── Dockerfile                   # Frontend Docker configuration
│   ├── nginx.conf                   # Nginx configuration
│   └── package.json                 # NPM dependencies
├── docker-compose.yml               # Docker orchestration
├── .env.example                     # Environment variables template
└── README.md                        # This file
```

## 🔧 Configuration

### Backend Configuration
- **Database**: H2 file-based database with persistence
- **CORS**: Configured for localhost origins
- **Security**: JWT-based authentication with HTTP-only cookies
- **Stripe**: Secret key configuration for payment processing

### Frontend Configuration
- **API Base URL**: Configured to use Nginx proxy (`/api`)
- **Stripe**: Publishable key for client-side payment processing
- **Product IDs**: Stripe price IDs for different subscription tiers

### Docker Configuration
- **Networks**: Custom bridge network for container communication
- **Volumes**: Persistent storage for H2 database
- **Ports**: 80 (frontend), 8080 (backend)

## 🐳 Docker Architecture

### Services
1. **Backend Service**:
   - Built from `./Backend/Dockerfile`
   - Runs Spring Boot application on port 8080
   - Connects to H2 database with persistent volume
   - Uses custom network for inter-service communication

2. **Frontend Service**:
   - Multi-stage build: Node.js build + Nginx serving
   - Serves React app on port 80
   - Proxies API requests to backend service
   - Handles React Router with fallback to index.html

### Networking
- **Custom Bridge Network**: Enables service-to-service communication
- **DNS Resolution**: Services can reference each other by name
- **Port Mapping**: Exposes services to host machine


## 🧪 Development

### Local Development (without Docker)
1. **Backend**: Run Spring Boot application with H2 database
2. **Frontend**: Run React development server
3. **Configuration**: Use local environment variables

### Docker Development
1. **Build**: `docker-compose build`
2. **Run**: `docker-compose up`
3. **Logs**: `docker-compose logs -f`
4. **Shell Access**: `docker exec -it container_name bash`

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues:
1. Check that Docker Desktop is running
2. Ensure all environment variables are set correctly
3. Verify port 80 and 8080 are not in use by other applications
4. Check container logs: `docker-compose logs`

For additional support, please open an issue on GitHub.
