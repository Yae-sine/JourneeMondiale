package com._com.JourneeMondiale.security.oauth2;

import java.time.LocalDateTime;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import com._com.JourneeMondiale.model.User;
import com._com.JourneeMondiale.repository.UserRepository;
import com._com.JourneeMondiale.security.services.UserDetailsImpl;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {
    private static final Logger logger = LoggerFactory.getLogger(CustomOAuth2UserService.class);

    @Autowired
    private UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oauth2User = null;
        try {
            oauth2User = super.loadUser(userRequest);
            logger.info("Loaded OAuth2User attributes: {}", oauth2User.getAttributes());
            return processOAuth2User(userRequest, oauth2User);
        } catch (OAuth2AuthenticationException e) {
            logger.error("OAuth2AuthenticationException during loadUser: {}", e.getMessage(), e);
            throw e;
        } catch (Exception e) {
            logger.error("Unexpected exception during loadUser: {}", e.getMessage(), e);
            throw new OAuth2AuthenticationException(new OAuth2Error("Unexpected error during OAuth2 login"), e);
        }
    }

    private OAuth2User processOAuth2User(OAuth2UserRequest userRequest, OAuth2User oauth2User) {
        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        String accessToken = userRequest.getAccessToken().getTokenValue();
        logger.info("Processing OAuth2 user for provider: {}", registrationId);
        if ("linkedin".equals(registrationId)) {
            try {
                return processLinkedInUser(oauth2User, accessToken);
            } catch (Exception e) {
                logger.error("Exception in processLinkedInUser: {}", e.getMessage(), e);
                throw new OAuth2AuthenticationException(new OAuth2Error("Error processing LinkedIn user: " + e.getMessage()), e);
            }
        }
        logger.error("Unsupported OAuth2 provider: {}", registrationId);
        throw new OAuth2AuthenticationException(new OAuth2Error("Unsupported OAuth2 provider: " + registrationId));
    }

    private OAuth2User processLinkedInUser(OAuth2User oauth2User, String accessToken) {
        try {
            logger.info("LinkedIn OAuth2User attributes: {}", oauth2User.getAttributes());
            String linkedinId = oauth2User.getAttribute("id");
            String firstName = extractLinkedInLocalizedName(oauth2User, "firstName");
            String lastName = extractLinkedInLocalizedName(oauth2User, "lastName");
            String email = extractLinkedInEmail(oauth2User);
            logger.info("Extracted LinkedIn user info: id={}, firstName={}, lastName={}, email={}", linkedinId, firstName, lastName, email);
            // Generate a username from email or name
            String username = email != null ? email.split("@")[0] : (firstName + lastName).toLowerCase();
            Optional<User> userOptional = userRepository.findByLinkedinId(linkedinId);
            User user;
            if (userOptional.isPresent()) {
                // Update existing user
                user = userOptional.get();
                user.setLinkedinAccessToken(accessToken);
                user.setLinkedinTokenExpiry(LocalDateTime.now().plusHours(2)); // LinkedIn tokens typically expire in 2 hours
                logger.info("Updated existing user with LinkedIn ID: {}", linkedinId);
            } else {
                // Check if user exists by email
                Optional<User> existingUser = userRepository.findByEmail(email);
                if (existingUser.isPresent()) {
                    // Link LinkedIn account to existing user
                    user = existingUser.get();
                    user.setLinkedinId(linkedinId);
                    user.setLinkedinAccessToken(accessToken);
                    user.setLinkedinTokenExpiry(LocalDateTime.now().plusHours(2));
                    user.setProvider("linkedin");
                    logger.info("Linked LinkedIn account to existing user with email: {}", email);
                } else {
                    // Create new user
                    user = new User(linkedinId, username, email, firstName, lastName, "USER", accessToken);
                    user.setLinkedinTokenExpiry(LocalDateTime.now().plusHours(2));
                    logger.info("Created new user for LinkedIn ID: {}", linkedinId);
                }
            }
            userRepository.save(user);
            logger.info("Saved user to repository: id={}, username={}, email={}", user.getId(), user.getUsername(), user.getEmail());
            return new CustomOAuth2User(UserDetailsImpl.build(user), oauth2User.getAttributes());
        } catch (Exception e) {
            logger.error("Exception in processLinkedInUser: {}", e.getMessage(), e);
            throw new OAuth2AuthenticationException(new OAuth2Error("Error processing LinkedIn user: " + e.getMessage()), e);
        }
    }

    private String extractLinkedInLocalizedName(OAuth2User oauth2User, String field) {
        try {
            Object nameObj = oauth2User.getAttributes().get(field);
            if (nameObj instanceof java.util.Map) {
                @SuppressWarnings("unchecked")
                java.util.Map<String, Object> nameMap = (java.util.Map<String, Object>) nameObj;
                Object localizedObj = nameMap.get("localized");
                if (localizedObj instanceof java.util.Map) {
                    @SuppressWarnings("unchecked")
                    java.util.Map<String, String> localizedMap = (java.util.Map<String, String>) localizedObj;
                    // Get the first available localized name
                    return localizedMap.values().iterator().next();
                }
            }
        } catch (Exception e) {
            logger.warn("Error extracting LinkedIn localized name for field '{}': {}", field, e.getMessage());
        }
        return "";
    }

    private String extractLinkedInEmail(OAuth2User oauth2User) {
        try {
            // Try direct emailAddress field first
            Object emailObj = oauth2User.getAttributes().get("emailAddress");
            if (emailObj instanceof String) {
                return (String) emailObj;
            }
            // Try elements array structure
            Object elementsObj = oauth2User.getAttributes().get("elements");
            if (elementsObj instanceof java.util.List) {
                @SuppressWarnings("unchecked")
                java.util.List<Object> elementsList = (java.util.List<Object>) elementsObj;
                if (!elementsList.isEmpty()) {
                    Object firstElement = elementsList.get(0);
                    if (firstElement instanceof java.util.Map) {
                        @SuppressWarnings("unchecked")
                        java.util.Map<String, Object> elementMap = (java.util.Map<String, Object>) firstElement;
                        Object handleObj = elementMap.get("handle~");
                        if (handleObj instanceof java.util.Map) {
                            @SuppressWarnings("unchecked")
                            java.util.Map<String, Object> handleMap = (java.util.Map<String, Object>) handleObj;
                            return (String) handleMap.get("emailAddress");
                        }
                    }
                }
            }
        } catch (Exception e) {
            logger.warn("Error extracting LinkedIn email: {}", e.getMessage());
        }
        return null;
    }
}
