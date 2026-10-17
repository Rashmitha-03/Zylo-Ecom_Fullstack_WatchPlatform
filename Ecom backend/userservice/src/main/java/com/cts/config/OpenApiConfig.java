package com.cts.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
    info = @Info(
        title = "CTS Microservices API",
        version = "1.0",
        description = "API documentation for CTS Microservices"
    )
)
@SecurityScheme(
    name = "bearerAuth", // This is the name you'll see in Swagger UI
    type = SecuritySchemeType.HTTP,
    bearerFormat = "JWT",
    scheme = "bearer",
    description = "Provide the JWT token in the format: Bearer <token>"
)
public class OpenApiConfig {
    // This class primarily holds annotations for OpenAPI configuration
    // No specific methods are usually needed here for basic setup
}