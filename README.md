# BloodLink — Blood Bank Management System

BloodLink is a responsive HTML/CSS/JavaScript frontend backed by a Java 17 Spring Boot API. It provides a clean starting point for donor registration, hospital workflows, inventory visibility, and role-based BBMS expansion.

## Stack

- Java 17+, Spring Boot 3, Spring MVC, Spring Security, Maven
- PostgreSQL (configured through environment variables)
- HTML5, CSS3, and vanilla JavaScript

## Run in VS Code

1. Install JDK 17+, Maven, and PostgreSQL.
2. Create a PostgreSQL database named `bbms`.
3. Set `DB_USERNAME` and `DB_PASSWORD` (and optionally `DB_URL`).
4. From this folder run `mvn spring-boot:run`.
5. Open `http://localhost:8080`.

The initial API includes `GET /api/blood-inventory`, `POST /api/auth/login`, and `POST /api/auth/register/donor`. The UI uses the inventory endpoint when the server is running and keeps a clearly labelled presentation fallback for offline preview.

## Structure

`src/main/java/com/bbms` contains the Spring Boot entry point and REST controllers. `src/main/resources/static` contains the responsive frontend. Expand the controller layer with JPA entities/repositories for donors, hospitals, camps, appointments, requests, screening, cross-matching, notifications, audit logs, and reports as the project evolves.
