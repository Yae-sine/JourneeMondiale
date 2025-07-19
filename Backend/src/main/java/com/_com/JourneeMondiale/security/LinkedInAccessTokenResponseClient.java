
package com._com.JourneeMondiale.security;

import java.util.Map;

import org.springframework.http.converter.FormHttpMessageConverter;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.security.oauth2.client.endpoint.OAuth2AccessTokenResponseClient;
import org.springframework.security.oauth2.client.endpoint.OAuth2AuthorizationCodeGrantRequest;
import org.springframework.security.oauth2.core.OAuth2AccessToken;
import org.springframework.security.oauth2.core.endpoint.OAuth2AccessTokenResponse;
import org.springframework.security.oauth2.core.endpoint.OAuth2ParameterNames;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

public class LinkedInAccessTokenResponseClient implements OAuth2AccessTokenResponseClient<OAuth2AuthorizationCodeGrantRequest> {
    private final RestTemplate restTemplate;

    public LinkedInAccessTokenResponseClient() {
        this.restTemplate = new RestTemplate();
        this.restTemplate.getMessageConverters().add(new FormHttpMessageConverter());
        this.restTemplate.getMessageConverters().add(new MappingJackson2HttpMessageConverter());
    }

    @Override
    public OAuth2AccessTokenResponse getTokenResponse(OAuth2AuthorizationCodeGrantRequest authorizationGrantRequest) {
        // Build the token request parameters as form data
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add(OAuth2ParameterNames.GRANT_TYPE, authorizationGrantRequest.getGrantType().getValue());
        params.add(OAuth2ParameterNames.CODE, authorizationGrantRequest.getAuthorizationExchange().getAuthorizationResponse().getCode());
        params.add(OAuth2ParameterNames.REDIRECT_URI, authorizationGrantRequest.getAuthorizationExchange().getAuthorizationRequest().getRedirectUri());
        params.add(OAuth2ParameterNames.CLIENT_ID, authorizationGrantRequest.getClientRegistration().getClientId());
        params.add(OAuth2ParameterNames.CLIENT_SECRET, authorizationGrantRequest.getClientRegistration().getClientSecret());

        String tokenUri = authorizationGrantRequest.getClientRegistration().getProviderDetails().getTokenUri();

        @SuppressWarnings("unchecked")
        Map<String, Object> response = restTemplate.postForObject(tokenUri, params, Map.class);

        if (response != null && !response.containsKey("token_type")) {
            response.put("token_type", "Bearer");
        }

        return OAuth2AccessTokenResponse.withToken((String) response.get("access_token"))
                .tokenType(OAuth2AccessToken.TokenType.BEARER)
                .expiresIn(response.containsKey("expires_in") ? Long.parseLong(response.get("expires_in").toString()) : 0)
                .scopes(authorizationGrantRequest.getClientRegistration().getScopes())
                .refreshToken((String) response.get("refresh_token"))
                .additionalParameters(response)
                .build();
    }
}
