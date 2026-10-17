package com.cts.config;
 
import org.springframework.beans.factory.annotation.Value; // Import for @Value
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.oauth2.jwt.JwtDecoder; // Import JwtDecoder
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder; // Import NimbusJwtDecoder
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
// Keep other imports if you still have your customHeaderAuthenticationFilter logic (commented out)
// Otherwise, you can remove unused imports
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
 
import javax.crypto.SecretKey; // Import SecretKey
import javax.crypto.spec.SecretKeySpec; // Import SecretKeySpec
import java.util.Arrays;
import java.util.Base64; // Import Base64
import java.util.List;
import java.util.stream.Collectors;
 
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
 
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {
 
    private static final Logger logger = LoggerFactory.getLogger(SecurityConfig.class);
 
    // Inject the base64-encoded secret from application.properties
    @Value("${spring.security.oauth2.resourceserver.jwt.base64-secret}")
    private String jwtBase64Secret;
 
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> {})
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(authorize -> authorize
                .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/webjars/**").permitAll()
                .requestMatchers(
                    "/api/v1/users/register",
                    "/api/v1/users/login",
								"/api/v1/users/forgot-password", "/api/v1/users/reset-password",
								"/api/v1/users/recover-account", "/api/v1/users/auth/**")
						.permitAll()

						.requestMatchers("/api/v1/orders/cash-on-delivery", "/api/v1/orders/online-payment/**",
								"/api/v1/orders/cart/**", "/api/v1/orders/track-order/**")
						.permitAll() // or tweak as needed
						.anyRequest().authenticated())
				.oauth2ResourceServer(
						oauth2 -> oauth2.jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter())
						// IMPORTANT: We no longer need to explicitly set a JwtDecoder here
						// because we are defining it as a @Bean below. Spring will find it.
						));
		return http.build();
	}
 
    // This is the NEWLY ADDED Bean for JwtDecoder
    @Bean
    public JwtDecoder jwtDecoder() {
        // Decode the Base64 secret key
        byte[] decodedKey = Base64.getDecoder().decode(jwtBase64Secret);
 
        // Create a SecretKeySpec. "HmacSHA256" should match the algorithm used by your Auth Service (e.g., HS256 for HMAC-SHA256)
        SecretKey originalKey = new SecretKeySpec(decodedKey, 0, decodedKey.length, "HmacSHA256");
 
        // Build and return the NimbusJwtDecoder using the secret key
        return NimbusJwtDecoder.withSecretKey(originalKey).build();
    }
 
    // Your existing JwtAuthenticationConverter bean
    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter grantedAuthoritiesConverter = new JwtGrantedAuthoritiesConverter();
        grantedAuthoritiesConverter.setAuthoritiesClaimName("roles");
        grantedAuthoritiesConverter.setAuthorityPrefix("ROLE_");
 
        JwtAuthenticationConverter jwtConverter = new JwtAuthenticationConverter();
        jwtConverter.setJwtGrantedAuthoritiesConverter(grantedAuthoritiesConverter);
        return jwtConverter;
    }
 
    @Bean
    public UserDetailsService userDetailsService() {
        return new InMemoryUserDetailsManager(User.withUsername("dummy")
                .password("{noop}password")
                .roles("USER")
                .build());

    }
}



