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
                .requestMatchers(HttpMethod.POST, "/api/auth/register").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/auth/logout").authenticated()

                //Получение аватарки пользователя(если есть)
                .requestMatchers(HttpMethod.GET, "/api/users/{id}/avatar").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/users/username/{username}/avatar").permitAll()

                //Загрузка аватарки пользователя
                .requestMatchers(HttpMethod.POST, "/api/users/{id}/avatar").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/users/username/{username}/avatar").authenticated()
                
                //Удаление аватарки пользователя
                .requestMatchers(HttpMethod.DELETE, "/api/users/{id}/avatar").authenticated()
                .requestMatchers(HttpMethod.DELETE, "/api/users/username/{username}/avatar").authenticated()


                //Получить вики
                .requestMatchers(HttpMethod.GET, "/api/wikis/{name}").permitAll()
                //Создать вики
                .requestMatchers(HttpMethod.POST, "/api/wikis/").authenticated()

                //Получить фон вики
                .requestMatchers(HttpMethod.GET, "/api/wikis/{name}/background").permitAll()
                //Удалить фон вики
                .requestMatchers(HttpMethod.DELETE, "/api/wikis/{name}/background").authenticated()
                //Загрузить карточку вики
                .requestMatchers(HttpMethod.POST, "/api/wikis/{name}/background").authenticated()

                //Получить карточки вики
                .requestMatchers(HttpMethod.GET, "/api/wikis/{name}/card").permitAll()
                //Удалить карточку вики
                .requestMatchers(HttpMethod.DELETE, "/api/wikis/{name}/card").authenticated()
                //Загрузить карточку вики
                .requestMatchers(HttpMethod.POST, "/api/wikis/{name}/card").authenticated()


                //Получить категорию вики
                .requestMatchers(HttpMethod.GET,"/api/wikis/{wikiName}/categories/{name}").permitAll()
                //Получить категории вики
                .requestMatchers(HttpMethod.GET,"/api/wikis/{wikiName}/categories").permitAll()
                //Удалить категорию вики
                .requestMatchers(HttpMethod.DELETE,"/api/wikis/{wikiName}/categories/{name}").authenticated()
                //Создать категорию вики
                .requestMatchers(HttpMethod.POST,"/api/wikis/{wikiName}/categories").authenticated()

                //Получить пост вики
                .requestMatchers(HttpMethod.GET,"/api/wikis/{wikiName}/posts").permitAll()
                .requestMatchers(HttpMethod.GET,"/api/wikis/{wikiName}/posts/{postId}").permitAll()
                //Получить пост вики
                .requestMatchers(HttpMethod.GET,"/api/wikis/{wikiName}/posts").permitAll()
                //Удалить пост вики
                .requestMatchers(HttpMethod.DELETE,"/api/wikis/{wikiName}/posts/{postId}").authenticated()
                //Создать пост вики
                .requestMatchers(HttpMethod.POST,"/api/wikis/{wikiName}/posts").authenticated()
                //Изменить пост вики
                .requestMatchers(HttpMethod.PUT,"/api/wikis/{wikiName}/posts/{postId}").authenticated()

                //Получить статью вики  
                .requestMatchers(HttpMethod.GET,"/api/wikis/{wikiName}/categories/{categoryName}/articles/{name}").permitAll()
                //Получить статьи вики
                .requestMatchers(HttpMethod.GET,"/api/wikis/{wikiName}/categories/{categoryName}/articles").permitAll()
                //Удалить статью вики
                .requestMatchers(HttpMethod.DELETE,"/api/wikis/{wikiName}/categories/{categoryName}/articles/{name}").authenticated()
                //Создать статью вики
                .requestMatchers(HttpMethod.POST,"/api/wikis/{wikiName}/categories/{categoryName}/articles").authenticated()


                //Получить пользователя по айди
                .requestMatchers(HttpMethod.GET, "/api/users/{id}").permitAll()
                // .requestMatchers(HttpMethod.POST, "/api/users/{id}").authenticated()
                // .requestMatchers(HttpMethod.PUT, "/api/users/{id}").authenticated()
                // .requestMatchers(HttpMethod.DELETE, "/api/users/{id}").authenticated()

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

                //Права 
                .requestMatchers(HttpMethod.GET,"/api/wikis/{wikiName}/staffs").authenticated()
                .requestMatchers(HttpMethod.GET,"/api/wikis/{wikiName}/staffs/{userId}").authenticated()
                .requestMatchers(HttpMethod.DELETE,"/api/wikis/{wikiName}/staffs/{userId}").authenticated()
                .requestMatchers(HttpMethod.PUT,"/api/wikis/{wikiName}/staffs/{userId}").authenticated()
                .requestMatchers(HttpMethod.POST,"/api/wikis/{wikiName}/staffs").authenticated()

                //Переводы
                //Вики
                .requestMatchers(HttpMethod.GET,"/api/wikis/{wikiName}/translations").permitAll()
                .requestMatchers(HttpMethod.GET,"/api/wikis/{wikiName}/translations/{locale}").permitAll()
                .requestMatchers(HttpMethod.DELETE,"/api/wikis/{wikiName}/translations/{locale}").authenticated()
                .requestMatchers(HttpMethod.PUT,"/api/wikis/{wikiName}/translations/{locale}").authenticated()
                .requestMatchers(HttpMethod.POST,"/api/wikis/{wikiName}/translations").authenticated()
                //Категории
                .requestMatchers(HttpMethod.GET,"/api/wikis/{wikiName}/categories/{categoryName}/translations").permitAll()
                .requestMatchers(HttpMethod.GET,"/api/wikis/{wikiName}/categories/{categoryName}/translations/{locale}").permitAll()
                .requestMatchers(HttpMethod.DELETE,"/api/wikis/{wikiName}/categories/{categoryName}/translations/{locale}").authenticated()
                .requestMatchers(HttpMethod.PUT,"/api/wikis/{wikiName}/categories/{categoryName}/translations/{locale}").authenticated()
                .requestMatchers(HttpMethod.POST,"/api/wikis/{wikiName}/categories/{categoryName}/translations").authenticated()
                //Статьи
                .requestMatchers(HttpMethod.GET,"/api/wikis/{wikiName}/categories/{categoryName}/articles/{articleName}/translations").permitAll()
                .requestMatchers(HttpMethod.GET,"/api/wikis/{wikiName}/categories/{categoryName}/articles/{articleName}/translations/{locale}").permitAll()
                .requestMatchers(HttpMethod.DELETE,"/api/wikis/{wikiName}/categories/{categoryName}/articles/{articleName}/translations/{locale}").authenticated()
                .requestMatchers(HttpMethod.PUT,"/api/wikis/{wikiName}/categories/{categoryName}/articles/{articleName}/translations/{locale}").authenticated()
                .requestMatchers(HttpMethod.POST,"/api/wikis/{wikiName}/categories/{categoryName}/articles/{articleName}/translations").authenticated()

                //Сообщения под вики
                .requestMatchers(HttpMethod.GET,"/api/wikis/{wikiName}/messages").permitAll()
                .requestMatchers(HttpMethod.POST,"/api/wikis/{wikiName}/messages").authenticated()
                //Сообщения под постами
                .requestMatchers(HttpMethod.GET,"/api/wikis/{wikiName}/posts/{postId}/messages").permitAll()
                .requestMatchers(HttpMethod.POST,"/api/wikis/{wikiName}/posts/{postId}/messages").authenticated()
                //категории
                .requestMatchers(HttpMethod.GET,"/api/wikis/{wikiName}/categories/{categoryName}/messages").permitAll()
                .requestMatchers(HttpMethod.POST,"/api/wikis/{wikiName}/categories/{categoryName}/messages").authenticated()
                //статьи
                .requestMatchers(HttpMethod.GET,"/api/wikis/{wikiName}/categories/{categoryName}/articles/{articleName}/messages").permitAll()
                .requestMatchers(HttpMethod.POST,"/api/wikis/{wikiName}/categories/{categoryName}/articles/{articleName}/messages").authenticated()

                //Удалить сообщение
                .requestMatchers(HttpMethod.DELETE,"/api/messages/{messageId}").authenticated()

                .requestMatchers(HttpMethod.DELETE,"/api/users/{userId}/staffs").authenticated()

                .requestMatchers(HttpMethod.GET,"/api/messages/{messageId}/messages").permitAll()


                .requestMatchers(HttpMethod.GET,"/api/wikis").permitAll()

                .requestMatchers(HttpMethod.GET,"/api/wikis/{wikiName}/search").permitAll()

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
        config.setAllowedOriginPatterns(List.of("*"));
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