# MediTrack - Hospital Management System

## Overview

MediTrack is a full-stack Hospital Management System developed using a Microservices Architecture. The system enables patients, doctors, and administrators to manage appointments, prescriptions, payments, notifications, and medical records through a secure and scalable platform.

The project follows modern enterprise architecture principles using Spring Boot Microservices, React, JWT Authentication, API Gateway, Eureka Service Discovery, Apache Kafka, OpenFeign, and MySQL.

---

## Key Features

### Authentication & Authorization

* JWT-based authentication
* Role-based access control
* User registration and login
* Secure API access

### Patient Management

* Patient profile management
* View appointments
* View prescriptions
* Receive notifications

### Doctor Management

* Doctor profile management
* View appointments
* Manage patient consultations
* Generate prescriptions

### Appointment Management

* Book appointments
* Cancel appointments
* Complete appointments
* Slot management

### Prescription Management

* Create prescriptions
* View prescription history
* Associate prescriptions with appointments

### Payment Management

* Razorpay payment integration
* Payment verification
* Payment status tracking

### Notification System

* Kafka-based event notifications
* Appointment notifications
* Payment notifications
* Prescription notifications

---

# Architecture

The project consists of 9 microservices:

| Service              | Port |
| -------------------- | ---- |
| Eureka Server        | 8761 |
| API Gateway          | 8080 |
| Auth Service         | 8081 |
| Patient Service      | 8082 |
| Doctor Service       | 8083 |
| Appointment Service  | 8084 |
| Prescription Service | 8085 |
| Payment Service      | 8086 |
| Notification Service | 8087 |

### Communication

* Service Discovery: Eureka Server
* API Routing: Spring Cloud Gateway
* Inter-Service Communication: OpenFeign
* Event Driven Communication: Apache Kafka
* Authentication: JWT
* Payment Gateway: Razorpay

---

# Technology Stack

## Backend

* Java 17
* Spring Boot 3.2.5
* Spring Cloud 2023.0.1
* Spring Security
* JWT
* Spring Data JPA
* OpenFeign
* Eureka Discovery Server
* Spring Cloud Gateway
* Apache Kafka
* Razorpay SDK
* Maven

## Frontend

* React JS
* React Router DOM
* Axios
* Context API
* SweetAlert2
* jsPDF
* html2canvas
* Lucide React

## Database

* MySQL

---

# Databases Used

Each microservice has its own dedicated database.

```sql
meditrack_auth
meditrack_patient
meditrack_doctor
meditrack_appointment
meditrack_prescription
meditrack_payment
meditrack_notification
```



---

# Project Structure

```text
MediTrack
│
├── eureka-server
├── api-gateway
├── auth-service
├── patient-service
├── doctor-service
├── appointment-service
├── prescription-service
├── payment-service
├── notification-service
│
└── c_meditrack-frontend
```

---

# Prerequisites

Before running the project install:

* Java 17
* Maven
* MySQL Server
* Apache Kafka
* Zookeeper
* Node.js
* npm
* Git

---

# How To Run The Project

## Step 1: Start MySQL

Ensure MySQL is running.

Verify databases:

```sql
SHOW DATABASES;
```

---

## Step 2: Start Zookeeper

```bash
zookeeper-server-start.bat config\zookeeper.properties
```

---

## Step 3: Start Kafka

```bash
kafka-server-start.bat config\server.properties
```

---

## Step 4: Run Eureka Server

```bash
mvn spring-boot:run
```

Open:

http://localhost:8761

---

## Step 5: Run API Gateway

```bash
mvn spring-boot:run
```

Runs on:

```text
http://localhost:8080
```

---

## Step 6: Start Microservices

Run the services in the following order:

1. Auth Service (8081)
2. Patient Service (8082)
3. Doctor Service (8083)
4. Appointment Service (8084)
5. Prescription Service (8085)
6. Payment Service (8086)
7. Notification Service (8087)

Each service can be started using:

```bash
mvn spring-boot:run
```

---

## Step 7: Run Frontend

Navigate to frontend folder:

```bash
cd c_meditrack-frontend
```

Install dependencies:

```bash
npm install
```

Start application:

```bash
npm start
```

Frontend URL:

```text
http://localhost:3000
```

---

# Kafka Events

Kafka is used for asynchronous communication.

Examples:

* Appointment Booked
* Appointment Cancelled
* Payment Completed
* Prescription Created
* Notification Generation

---

# Security

* JWT Authentication
* Password Encryption using BCrypt
* Spring Security
* Role-Based Authorization

Roles:

* Admin
* Doctor
* Patient

---

# Future Enhancements

* Email Notifications
* Video Consultation
* Medical Reports Upload
* Analytics Dashboard
* Mobile Application
* Docker & Kubernetes Deployment

---

# Author

**Aishwarya Prabhu P**


