package com.example.food_delivery.security;

import com.nimbusds.jose.JOSEException;
import com.nimbusds.jwt.SignedJWT;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.text.ParseException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Component
@Slf4j
public class CustomJwtFilter extends OncePerRequestFilter {
    
    @Value("${jwt.privatekey:PA7ummSP4r0RY9AlAn1LfgNoNBjZsejBHoiQAF79HGE=}")
    private String SIGNER_KEY;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) 
            throws ServletException, IOException {

        String requestUri = request.getRequestURI();
        String requestMethod = request.getMethod();
        
        // Skip static resources - let them pass through without token processing
        if (isStaticResource(requestUri)) {
            filterChain.doFilter(request, response);
            return;
        }
        
        String token = getTokenFromHeader(request);
        
        // Log all order-related requests for debugging
        if (requestUri.startsWith("/order")) {
            log.info("🔍 CustomJwtFilter processing ORDER request: {} {} - Token present: {}", 
                requestMethod, requestUri, token != null);
        } else if (requestUri.contains("/forgot-password")) {
            log.info("🔍 CustomJwtFilter processing FORGOT-PASSWORD request: {} {} - Token present: {}", 
                requestMethod, requestUri, token != null);
        } else {
            log.debug("🔍 CustomJwtFilter processing request to {} - Token present: {}", requestUri, token != null);
        }
        
        if (requestUri.equals("/message")) {
            log.info("🔍 Processing /message endpoint - Token: {}", token != null ? "present" : "null");
        }
        
        if(token != null){
            try {
                // Parse token and extract authorities using Nimbus (same as AuthenticationService)
                // NOTE: Token is created with Nimbus JOSE, so we must verify with Nimbus, not JJWT
                SignedJWT signedJWT = SignedJWT.parse(token);
                com.nimbusds.jose.crypto.MACVerifier verifier = new com.nimbusds.jose.crypto.MACVerifier(SIGNER_KEY.getBytes());
                
                if (signedJWT.verify(verifier)) {
                    // Check expiration
                    if (signedJWT.getJWTClaimsSet().getExpirationTime() != null && 
                        signedJWT.getJWTClaimsSet().getExpirationTime().before(new java.util.Date())) {
                        log.warn("⚠️ Token expired for request to {}", request.getRequestURI());
                    } else {
                        String username = signedJWT.getJWTClaimsSet().getSubject();
                        Object scopeObj = signedJWT.getJWTClaimsSet().getClaim("scope");
                        
                        log.info("🔍 Parsing token for user: {} - Scope claim: {}", username, scopeObj);
                        
                        List<SimpleGrantedAuthority> authorities = new ArrayList<>();
                        if (scopeObj != null && !scopeObj.toString().trim().isEmpty()) {
                            String scope = scopeObj.toString();
                            log.info("✅ Scope string found: {}", scope);
                            authorities = Arrays.stream(scope.split(" "))
                                .filter(s -> !s.isEmpty() && s.trim().length() > 0)
                                .map(SimpleGrantedAuthority::new)
                                .collect(Collectors.toList());
                            log.info("✅ Parsed {} authorities from scope", authorities.size());
                        } else {
                            log.warn("⚠️ No scope claim found in token for user: {} - Token may be old or missing role", username);
                        }
                        
                        // Ensure we have at least one authority - if not, add a default one
                        if (authorities.isEmpty()) {
                            log.warn("⚠️ No authorities found for user: {} - Adding default ROLE_USER to allow access", username);
                            authorities.add(new SimpleGrantedAuthority("ROLE_USER"));
                            log.info("✅ Default ROLE_USER added for user: {}", username);
                        }
                        
                        log.info("Creating authentication token with {} authorities: {}", 
                            authorities.size(),
                            authorities.stream().map(a -> a.getAuthority()).collect(Collectors.joining(", ")));
                        
                        // Create authentication token with authorities
                        // Use the constructor that takes authorities - Spring Security automatically marks it as authenticated
                        // DO NOT call setAuthenticated(true) - it will throw IllegalArgumentException
                        try {
                            UsernamePasswordAuthenticationToken authentication = 
                                new UsernamePasswordAuthenticationToken(username, null, authorities);
                            
                            // NOTE: When using constructor with authorities, Spring Security automatically sets authenticated = true
                            // Calling setAuthenticated(true) will throw: "Cannot set this token to trusted - use constructor which takes a GrantedAuthority list instead"
                            
                            log.info("Authentication token created successfully");
                            
                            SecurityContext securityContext = SecurityContextHolder.getContext();
                            securityContext.setAuthentication(authentication);
                            
                            log.info("✅ Authentication set in SecurityContext for user {} with {} authorities: {}", 
                                username, 
                                authorities.size(),
                                authorities.stream().map(a -> a.getAuthority()).collect(Collectors.joining(", ")));
                            
                            // Verify authentication was set correctly
                            if (securityContext.getAuthentication() != null && 
                                securityContext.getAuthentication().isAuthenticated()) {
                                log.info("✅ Authentication verified: isAuthenticated = true");
                            } else {
                                log.warn("⚠️ Authentication set but isAuthenticated = false");
                            }
                        } catch (Exception e) {
                            log.error("❌ Error creating/setting authentication token: {}", e.getMessage(), e);
                            throw e; // Re-throw to be caught by outer catch
                        }
                    }
                } else {
                    log.warn("❌ Token signature verification failed for request to {}", request.getRequestURI());
                }
            } catch (ParseException e) {
                log.warn("⚠️ Token parsing error for request to {}: {}", request.getRequestURI(), e.getMessage());
            } catch (JOSEException e) {
                log.warn("⚠️ Token verification error for request to {}: {}", request.getRequestURI(), e.getMessage());
            } catch (Exception e) {
                log.error("❌ Unexpected error processing token for request to {}: {}", request.getRequestURI(), e.getMessage(), e);
                log.error("❌ Exception class: {}", e.getClass().getName());
                log.error("❌ Exception stack trace:", e);
            }
        } else {
            log.debug("No token found in request to {}", request.getRequestURI());
        }
        filterChain.doFilter(request, response);
    }
    
    // Check if request is for static resources
    private boolean isStaticResource(String requestUri) {
        // Skip static resources
        return requestUri.startsWith("/admin/") && (
            requestUri.endsWith(".css") ||
            requestUri.endsWith(".js") ||
            requestUri.endsWith(".png") ||
            requestUri.endsWith(".jpg") ||
            requestUri.endsWith(".jpeg") ||
            requestUri.endsWith(".gif") ||
            requestUri.endsWith(".svg") ||
            requestUri.endsWith(".ico") ||
            requestUri.endsWith(".woff") ||
            requestUri.endsWith(".woff2") ||
            requestUri.endsWith(".ttf") ||
            requestUri.endsWith(".eot") ||
            requestUri.contains("/vendor/") ||
            requestUri.contains("/css/") ||
            requestUri.contains("/js/") ||
            requestUri.contains("/img/") ||
            requestUri.contains("/assets/") ||
            requestUri.contains("/font/")
        ) || requestUri.startsWith("/theme/") || 
           requestUri.startsWith("/uploads/");
    }
    
    //get Bearer Token
    private String getTokenFromHeader(HttpServletRequest request){
        String header = request.getHeader("Authorization");
        if (header == null) {
            log.debug("No Authorization header found in request to {}", request.getRequestURI());
            return null;
        }
        
        log.debug("Authorization header found: {}", header.substring(0, Math.min(20, header.length())) + "...");
        
        String token = null;
        if(StringUtils.hasText(header) && header.startsWith("Bearer ")){
            token = header.substring(7);
            log.debug("Token extracted from header (length: {})", token.length());
        } else {
            log.warn("Authorization header does not start with 'Bearer ' for request to {}", request.getRequestURI());
        }
        return token;
    }
}
