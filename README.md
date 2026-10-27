# E-commerce Application

A full-stack Zylo e-commerce application with a React storefront and a Spring Boot microservice backend. The backend uses Eureka for service discovery and a Spring Cloud Gateway as the frontend's API entry point.

## What Is Included

- **Storefront:** product browsing, search and filtering, product details and feedback, cart and checkout, cash-on-delivery and online-payment flows, order tracking, account/profile and address management.
- **Administration:** product and user management, order administration, reports, and product-frequency charts.
- **Backend services:** authentication, users and addresses, products, cart, orders, and payments, registered with Eureka and routed through the API gateway.

## Repository Layout

```text
Ecom-App-master/
|-- Ecom frontend/       React application
|-- Ecom backend/
|   |-- EurekaServer/    Service registry
|   |-- apigateway/      Frontend-facing API gateway
|   |-- auth/            Authentication and JWT
|   |-- userservice/     User accounts and addresses
|   |-- Project2/        Product catalog and feedback
|   |-- cart/            Shopping cart
|   |-- orderservice3/   Order workflows
|   |-- paymentservice3/ Payment status and initiation
|   `-- (service modules each have their own pom.xml)
`-- README.md
```

Each backend service is an independent Maven/Spring Boot application. Use the `pom.xml` in each module root; the nested `bin/` directories are not the primary service projects.

## Prerequisites

- Node.js and npm (the frontend uses Create React App).
- JDK 21 recommended. The gateway POM targets Java 21; most other backend modules target Java 17.
- MySQL running locally.
- The checked-in Maven wrappers can build backend services without a separate Maven installation.

## Local Configuration

The checked-in backend properties currently expect a MySQL database named `product` on `localhost:3306`, with username `root` and password `root`. Create the database before starting the services:

```sql
CREATE DATABASE product;
```

Update the datasource settings in each service's `src/main/resources/application.properties` if your local MySQL credentials differ. Several services configure Hibernate with `ddl-auto=create`, which recreates their tables when they start and can erase persisted data. This is a development setup, not a production migration strategy.
Here you can modify the db details 

The gateway and some services also contain placeholder or shared JWT secrets in their properties. Replace these with a strong, consistent secret kept outside source control before using the application beyond local development. Do not expose the current configuration to an untrusted network.

## Run Locally

Start each backend service in its own PowerShell terminal, from the repository root. Start Eureka first, then the other services, and start the gateway after Eureka is available. For each row below, substitute the module directory in this command:

```powershell
Push-Location "Ecom backend\EurekaServer"; .\mvnw.cmd spring-boot:run; Pop-Location
```

| Module | Port | Eureka service name |
| --- | ---: | --- |
| `EurekaServer` | `8761` | Eureka registry |
| `Project2` | `8015` | `Project` |
| `auth` | `7004` | `authservice1` |
| `userservice` | `7003` | `user3` |
| `cart` | `9926` | `CartModule` |
| `orderservice3` | `9997` | `orderService` |
| `paymentservice3` | `9999` | `payment` |
| `apigateway` | `8003` | `apigateway3` |

For example, to start the product service, run:

```powershell
Push-Location "Ecom backend\Project2"; .\mvnw.cmd spring-boot:run; Pop-Location
```

Once the backend services are running, start the frontend in another terminal:

```powershell
Set-Location "Ecom frontend"
npm install
npm start
```

Open `http://localhost:3000`. The frontend currently sends API requests to `http://localhost:8003`; if the gateway address changes, update `src/api.js` in the frontend.

## Useful URLs

- Frontend: `http://localhost:3000`
- Eureka dashboard: `http://localhost:8761`
- API gateway: `http://localhost:8003`
- Aggregated API documentation: `http://localhost:8003/swagger-ui.html`

Individual Springdoc documentation is enabled on the services, typically at `http://localhost:<service-port>/swagger-ui.html`.

## Tests and Production Builds

Run frontend tests from `Ecom frontend`:

```powershell
npm test -- --watchAll=false
```

Build the frontend for deployment:

```powershell
npm run build
```

Run backend tests for a service from its module directory. For example:

```powershell
Push-Location "Ecom backend\Project2"; .\mvnw.cmd test; Pop-Location
```

## Notes

- Backend services share the local `product` MySQL database by default.
- Eureka registration and gateway discovery require dependent services to be reachable on their configured ports.
- There is no root-level orchestration file; start the backend services individually as described above.
- Frontend is built using React JS and its connected to backend via Axios 
