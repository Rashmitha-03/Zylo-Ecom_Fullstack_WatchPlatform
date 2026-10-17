package com.cts.client;
 
 
import feign.RequestInterceptor;
import feign.RequestTemplate;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
 
@Configuration
public class FeignClientConfig {
 
    @Bean
    public RequestInterceptor requestInterceptor() {
        return new RequestInterceptor() {
            @Override
            public void apply(RequestTemplate template) {
                var attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
                if (attributes != null) {
                    String token = attributes.getRequest().getHeader("Authorization");
                    if (token != null && !token.isBlank()) {
                        System.out.println("Forwarding token to Feign: " + token); // optional debug
                        template.header("Authorization", token);
                    }
                }
            }
        };
    }
}