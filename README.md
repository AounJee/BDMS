# Blood Donation Management System (BDMS)

The Blood Donation Management System (BDMS) is a web-based application designed to streamline blood donation activities. It connects donors, hospitals, and recipients, facilitating donor registration, blood request management, appointment scheduling, and donation history tracking. Built with Spring Boot and MySQL, BDMS provides a robust platform for managing blood donation workflows efficiently.

## Features
- **User Management**: Register and authenticate users (donors, hospital admins).
- **Donor Profiles**: Donors can view and update their profiles, including blood type and donation history.
- **Blood Requests**: Hospitals can post blood requests, and donors can respond to them.
- **Appointment Scheduling**: Donors can schedule appointments with hospitals for blood donation.
- **Donation History**: Track all donations made by donors.
- **Hospital Management**: Hospitals (managed by admins) can oversee requests, appointments, and donations.
- **Role-Based Access**: Separate roles for donors (Role: DONOR) and hospital admins (Role: HOSPITAL_ADMIN).

## Technologies Used
- **Backend**: Spring Boot (Java)
- **Database**: MySQL
- **Frontend**: Basic HTML/CSS (or specify if you used a framework like Thymeleaf or React)
- **Build Tool**: Maven
- **Other Dependencies**: Spring Data JPA, Spring Security, MySQL Connector

## Setup Instructions
Follow these steps to set up and run the BDMS project locally.

### Prerequisites
- Java 17 or later
- MySQL 8.0 or later
- Maven
- Git
- An IDE (e.g., IntelliJ IDEA, Eclipse)

