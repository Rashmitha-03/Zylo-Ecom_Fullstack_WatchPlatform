package com.cts;

import org.modelmapper.ModelMapper;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
//import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.context.annotation.Bean;
import org.springframework.web.client.RestTemplate;
@EnableDiscoveryClient
@SpringBootApplication
public class ECommercePaymentServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(ECommercePaymentServiceApplication.class, args);
	}

@Bean
public RestTemplate restTemplate() {
return new RestTemplate();
}
@Bean
public ModelMapper modelMapper() {
    return new ModelMapper();
}
}
