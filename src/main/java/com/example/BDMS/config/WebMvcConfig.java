package com.example.BDMS.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.web.servlet.config.annotation.ContentNegotiationConfigurer;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {
    
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/js/**")
               .addResourceLocations("classpath:/static/js/")
               .setCachePeriod(3600)
               .resourceChain(true);
        
        registry.addResourceHandler("/css/**")
               .addResourceLocations("classpath:/static/css/")
               .setCachePeriod(3600)
               .resourceChain(true);
        
        registry.addResourceHandler("/images/**")
               .addResourceLocations("classpath:/static/images/")
               .setCachePeriod(3600)
               .resourceChain(true);
    }
    
    @Override
    public void configureContentNegotiation(ContentNegotiationConfigurer configurer) {
        configurer
            .defaultContentType(MediaType.APPLICATION_JSON)
            .mediaType("js", MediaType.valueOf("application/javascript"))
            .mediaType("css", MediaType.valueOf("text/css"))
            .mediaType("html", MediaType.TEXT_HTML);
    }
}