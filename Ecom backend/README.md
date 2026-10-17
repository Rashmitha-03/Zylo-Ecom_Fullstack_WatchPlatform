# E-commerce Backend

The backend is a set of independent Spring Boot services. Eureka provides service discovery, and the Spring Cloud Gateway exposes the service APIs to the React frontend. Each service is built from its own Maven project; there is no root Maven aggregator.

## Services

| Module | Responsibility | Port | Eureka name |
| --- | --- | ---: | --- |
| `EurekaServer` | Service registry | `8761` | Eureka registry |
| `apigateway` | Routes client requests and aggregates API documentation | `8003` | `apigateway3` |
| `auth` | Registration, login, and JWT authentication | `7004` | `authservice1` |
| `userservice` | User accounts, profiles, roles, and addresses | `7003` | `user3` |
| `Project2` | Product catalog, stock, and product feedback | `8015` | `Project` |
| `cart` | Shopping cart operations | `9926` | `CartModule` |
| `orderservice3` | Checkout, order lifecycle, and tracking | `9997` | `orderService` |
| `paymentservice3` | Payment initiation and status | `9999` | `payment` |

The frontend calls the gateway at `http://localhost:8003`. The gateway routes requests to services registered with Eureka.

## Requirements

- JDK 21 recommended. The gateway module targets Java 21; most other modules target Java 17.
- MySQL running locally.
- The Maven wrapper (`mvnw.cmd`) is included in each service, so a separate Maven installation is not required.

## Database and Configuration

By default, the data services connect to MySQL at `localhost:3306` and use the database `product`. Create it before starting the services:

```sql
CREATE DATABASE product;
```

The checked-in properties use the local credentials `root` / `root`. Change the datasource settings in each applicable module's `src/main/resources/application.properties` to match your local MySQL setup.

Several services set Hibernate `ddl-auto=create`, which recreates their tables on startup and may delete existing data. Keep disposable local data only with this configuration; use a migration-based schema strategy before deploying or preserving data.

JWT secrets in the checked-in configuration are placeholders or shared development values. Configure a strong secret consistently across services and keep it out of source control for any non-local environment.

## Start the Services

Open a separate PowerShell terminal for each service. Run these commands from the `Ecom backend` directory, starting Eureka first. Start the gateway after the registry and backend services are running.

```powershell
Push-Location "EurekaServer"; .\mvnw.cmd spring-boot:run; Pop-Location
```

Use the same command with each module name from this list, in a separate terminal:

```text
Project2
auth
userservice
cart
orderservice3
paymentservice3
apigateway
```

For example, to start the product catalog:

```powershell
Push-Location "Project2"; .\mvnw.cmd spring-boot:run; Pop-Location
```

`spring-boot:run` keeps the service process attached to the terminal. Keep each terminal open while using the application. Check `http://localhost:8761` to see registered services.

## Build and Test

Run Maven commands from a module directory. For example, from `Ecom backend`:

```powershell
Push-Location "Project2"; .\mvnw.cmd test; Pop-Location
```

To package a service:

```powershell
Push-Location "Project2"; .\mvnw.cmd clean package; Pop-Location
```

Repeat with the desired module directory. The application gateway's aggregated Swagger UI is configured at `http://localhost:8003/swagger-ui.html`.