package com.operon.operon;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class OperonApplication {

	public static void main(String[] args) {
		SpringApplication.run(OperonApplication.class, args);
	}

}
