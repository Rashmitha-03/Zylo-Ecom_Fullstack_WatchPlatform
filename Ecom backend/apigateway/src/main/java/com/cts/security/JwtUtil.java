package com.cts.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;

@Component
public class JwtUtil {

 @Value("${jwt.secret}")
 private String secret;

 @Value("${jwt.expiration}")
 private long expirationTime;

 private SecretKey getSigningKey() {
     return Keys.hmacShaKeyFor(secret.getBytes());
 }

 public String generateToken(int userId, String email, List<String> roles) {
     Map<String, Object> claims = new HashMap<>();
     claims.put("userId", userId);
     claims.put("roles", roles); // Store roles in the token
     return createToken(claims, email);
 }

 private String createToken(Map<String, Object> claims, String subject) {
     return Jwts.builder()
             .setClaims(claims)
             .setSubject(subject)
             .setIssuedAt(new Date(System.currentTimeMillis()))
             .setExpiration(new Date(System.currentTimeMillis() + expirationTime))
             .signWith(getSigningKey(), SignatureAlgorithm.HS256)
             .compact();
 }

 // You will need these methods in your API Gateway or other services for validation
 public Boolean validateToken(String token) {
     try {
         return !isTokenExpired(token);
     } catch (Exception e) {
         // Log exception, e.g., SignatureException, MalformedJwtException, ExpiredJwtException
         return false;
     }
 }

 public Date extractExpiration(String token) {
     return extractClaim(token, Claims::getExpiration);
 }

 public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
     final Claims claims = extractAllClaims(token);
     return claimsResolver.apply(claims);
 }

 private Claims extractAllClaims(String token) {
     return Jwts.parserBuilder()
             .setSigningKey(getSigningKey())
             .build()
             .parseClaimsJws(token)
             .getBody();
 }

 private Boolean isTokenExpired(String token) {
     return extractExpiration(token).before(new Date());
 }

 public String extractEmail(String token) {
     return extractClaim(token, Claims::getSubject);
 }

 public List<String> extractRoles(String token) {
     return (List<String>) extractAllClaims(token).get("roles");
 }

 public Integer extractUserId(String token) {
     return (Integer) extractAllClaims(token).get("userId");
 }
}