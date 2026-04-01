package com.multiwiki.common.configs;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.multiwiki.auth.filters.JwtAuthenticationFilter;

import lombok.RequiredArgsConstructor;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    private final JwtAuthenticationFilter jwtAuthFilter;
    private final UserDetailsService userDetailsService;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .authorizeHttpRequests(auth -> auth
                //Авторизация
                .requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/auth/me").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/auth/refresh").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/auth/register/initiate").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/auth/register/confirm").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/auth/logout").authenticated()

                //Получение аватарки пользователя(если есть)
                .requestMatchers(HttpMethod.GET, "/api/users/{id}/avatar").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/users/username/{username}/avatar").permitAll()

                //Загрузка аватарки пользователя
                .requestMatchers(HttpMethod.POST, "/api/users/{id}/avatar").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/users/username/{username}/avatar").authenticated()
                
                //Удаление аватарки пользователя
                .requestMatchers(HttpMethod.DELETE, "/api/users/{id}/avatar").authenticated()
                .requestMatchers(HttpMethod.DELETE, "/api/users/username/{username}/avatar").authenticated()

                //Получить пользователя по айди
                .requestMatchers(HttpMethod.GET, "/api/users/{id}").permitAll()

                //Получение информации о изображении
                .requestMatchers(HttpMethod.GET, "/api/images/{id}").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/images/url/{url}").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/images/filename/{filename}").permitAll()
                //Загрузка изображения
                .requestMatchers(HttpMethod.POST, "/api/images/upload").authenticated()
                //Удаление изображения
                .requestMatchers(HttpMethod.DELETE, "/api/images/{id}").authenticated()
                .requestMatchers(HttpMethod.DELETE, "/api/images/url/{url}").authenticated()
                .requestMatchers(HttpMethod.DELETE, "/api/images/filename/{filename}").authenticated()

                //Языки
                .requestMatchers(HttpMethod.GET, "/api/locale").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/locale/{locale}").permitAll()

                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers("/api/uploads/**").permitAll()
                .anyRequest().authenticated()
            )
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .authenticationProvider(authenticationProvider())
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:5173"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }
    
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}