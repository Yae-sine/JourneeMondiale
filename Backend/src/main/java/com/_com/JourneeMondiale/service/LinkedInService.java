package com._com.JourneeMondiale.service;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;

import com.fasterxml.jackson.databind.JsonNode;

import reactor.core.publisher.Mono;

@Service
public class LinkedInService {

    private final WebClient webClient;

    public LinkedInService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.baseUrl("https://api.linkedin.com").build();
    }

    /**
     * Get LinkedIn user profile information
     */
    public Mono<JsonNode> getUserProfile(String accessToken) {
        return webClient.get()
                .uri("/v2/people/~:(id,firstName,lastName,emailAddress)")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                .retrieve()
                .bodyToMono(JsonNode.class);
    }

    /**
     * Get user's email address (requires separate API call)
     */
    public Mono<JsonNode> getUserEmail(String accessToken) {
        return webClient.get()
                .uri("/v2/emailAddress?q=members&projection=(elements*(handle~))")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                .retrieve()
                .bodyToMono(JsonNode.class);
    }

    /**
     * Share a text post on LinkedIn
     */
    public Mono<JsonNode> shareTextPost(String accessToken, String personId, String text) {
        Map<String, Object> shareRequest = createTextShareRequest(personId, text);
        
        return webClient.post()
                .uri("/v2/ugcPosts")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                .contentType(MediaType.APPLICATION_JSON)
                .body(BodyInserters.fromValue(shareRequest))
                .retrieve()
                .bodyToMono(JsonNode.class);
    }

    /**
     * Share a post with an image on LinkedIn
     */
    public Mono<JsonNode> shareImagePost(String accessToken, String personId, String text, String imageUrl) {
        // First register the image upload
        return registerImageUpload(accessToken, personId)
                .flatMap(uploadResponse -> {
                    String asset = uploadResponse.get("value").get("asset").asText();
                    String uploadUrl = uploadResponse.get("value").get("uploadMechanism")
                            .get("com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest")
                            .get("uploadUrl").asText();
                    
                    // Upload the image
                    return uploadImage(uploadUrl, imageUrl)
                            .then(shareImagePostWithAsset(accessToken, personId, text, asset));
                });
    }

    /**
     * Register image upload with LinkedIn
     */
    private Mono<JsonNode> registerImageUpload(String accessToken, String personId) {
        Map<String, Object> registerRequest = new HashMap<>();
        registerRequest.put("registerUploadRequest", Map.of(
                "recipes", new String[]{"urn:li:digitalmediaRecipe:feedshare-image"},
                "owner", "urn:li:person:" + personId,
                "serviceRelationships", new Object[]{
                        Map.of(
                                "relationshipType", "OWNER",
                                "identifier", "urn:li:userGeneratedContent"
                        )
                }
        ));

        return webClient.post()
                .uri("/v2/assets?action=registerUpload")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                .contentType(MediaType.APPLICATION_JSON)
                .body(BodyInserters.fromValue(registerRequest))
                .retrieve()
                .bodyToMono(JsonNode.class);
    }

    /**
     * Upload image to LinkedIn's upload URL
     */
    @SuppressWarnings("unused")
    private Mono<Void> uploadImage(String uploadUrl, String imageUrl) {
        // For simplicity, this assumes you have the image as bytes
        // In a real implementation, you would fetch the image from imageUrl first
        // TODO: Implement actual image fetching from imageUrl
        return webClient.post()
                .uri(uploadUrl)
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(BodyInserters.fromValue(new byte[0])) // Replace with actual image bytes
                .retrieve()
                .bodyToMono(Void.class);
    }

    /**
     * Share post with uploaded image asset
     */
    private Mono<JsonNode> shareImagePostWithAsset(String accessToken, String personId, String text, String asset) {
        Map<String, Object> shareRequest = createImageShareRequest(personId, text, asset);
        
        return webClient.post()
                .uri("/v2/ugcPosts")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                .contentType(MediaType.APPLICATION_JSON)
                .body(BodyInserters.fromValue(shareRequest))
                .retrieve()
                .bodyToMono(JsonNode.class);
    }

    /**
     * Create text share request payload
     */
    private Map<String, Object> createTextShareRequest(String personId, String text) {
        Map<String, Object> shareRequest = new HashMap<>();
        shareRequest.put("author", "urn:li:person:" + personId);
        shareRequest.put("lifecycleState", "PUBLISHED");
        
        Map<String, Object> specificContent = new HashMap<>();
        Map<String, Object> shareCommentary = new HashMap<>();
        shareCommentary.put("text", text);
        
        Map<String, Object> shareMediaCategory = new HashMap<>();
        shareMediaCategory.put("com.linkedin.ugc.ShareMediaCategory", "NONE");
        
        specificContent.put("com.linkedin.ugc.ShareContent", Map.of(
                "shareCommentary", shareCommentary,
                "shareMediaCategory", shareMediaCategory
        ));
        
        shareRequest.put("specificContent", specificContent);
        shareRequest.put("visibility", Map.of("com.linkedin.ugc.MemberNetworkVisibility", "PUBLIC"));
        
        return shareRequest;
    }

    /**
     * Create image share request payload
     */
    private Map<String, Object> createImageShareRequest(String personId, String text, String asset) {
        Map<String, Object> shareRequest = new HashMap<>();
        shareRequest.put("author", "urn:li:person:" + personId);
        shareRequest.put("lifecycleState", "PUBLISHED");
        
        Map<String, Object> specificContent = new HashMap<>();
        Map<String, Object> shareCommentary = new HashMap<>();
        shareCommentary.put("text", text);
        
        Map<String, Object> shareMediaCategory = new HashMap<>();
        shareMediaCategory.put("com.linkedin.ugc.ShareMediaCategory", "IMAGE");
        
        Map<String, Object> media = new HashMap<>();
        media.put("status", "READY");
        media.put("description", Map.of("text", "Shared image"));
        media.put("media", asset);
        media.put("title", Map.of("text", "Image Post"));
        
        specificContent.put("com.linkedin.ugc.ShareContent", Map.of(
                "shareCommentary", shareCommentary,
                "shareMediaCategory", shareMediaCategory,
                "media", new Object[]{media}
        ));
        
        shareRequest.put("specificContent", specificContent);
        shareRequest.put("visibility", Map.of("com.linkedin.ugc.MemberNetworkVisibility", "PUBLIC"));
        
        return shareRequest;
    }
}
