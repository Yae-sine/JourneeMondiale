# LinkedIn OAuth2.0 Integration Guide

## Backend Implementation

This implementation provides:

1. **OAuth2.0 Authentication with LinkedIn**
2. **LinkedIn API Integration for posting**
3. **User management with LinkedIn profile data**

## Configuration

### LinkedIn App Setup
1. Create a LinkedIn App at [LinkedIn Developer Portal](https://www.linkedin.com/developers/)
2. Add these redirect URIs:
   - `http://localhost:8080/login/oauth2/code/linkedin` (for local development)
   - `https://yourdomain.com/login/oauth2/code/linkedin` (for production)
3. Request permissions: `openid`, `profile`, `email`, `w_member_social`

### Application Properties
```properties
# LinkedIn OAuth2 Configuration
spring.security.oauth2.client.registration.linkedin.client-id=YOUR_CLIENT_ID
spring.security.oauth2.client.registration.linkedin.client-secret=YOUR_CLIENT_SECRET
spring.security.oauth2.client.registration.linkedin.scope=openid,profile,email,w_member_social
spring.security.oauth2.client.registration.linkedin.redirect-uri={baseUrl}/login/oauth2/code/{registrationId}
spring.security.oauth2.client.registration.linkedin.authorization-grant-type=authorization_code
spring.security.oauth2.client.registration.linkedin.client-name=LinkedIn

# LinkedIn Provider Configuration
spring.security.oauth2.client.provider.linkedin.authorization-uri=https://www.linkedin.com/oauth/v2/authorization
spring.security.oauth2.client.provider.linkedin.token-uri=https://www.linkedin.com/oauth/v2/accessToken
spring.security.oauth2.client.provider.linkedin.user-info-uri=https://api.linkedin.com/v2/people/~:(id,firstName,lastName,emailAddress,profilePicture(displayImage~:playableStreams))
spring.security.oauth2.client.provider.linkedin.user-name-attribute=id
```

## API Endpoints

### Authentication
- `GET /oauth2/authorization/linkedin` - Start LinkedIn OAuth2 flow
- `GET /api/auth/oauth2/success` - OAuth2 success callback
- `GET /api/auth/oauth2/failure` - OAuth2 failure callback
- `GET /api/auth/me` - Get current user info
- `GET /api/auth/linkedin/status` - Check LinkedIn connection status

### LinkedIn Integration
- `POST /api/auth/linkedin/share-text` - Share text post on LinkedIn
  - Parameters: `text` (string)
- `POST /api/auth/linkedin/share-image` - Share image post on LinkedIn
  - Parameters: `text` (string), `imageUrl` (string)

## Frontend Integration

### React Example

```javascript
// Start LinkedIn OAuth2 flow
const startLinkedInAuth = () => {
  window.location.href = 'http://localhost:8080/oauth2/authorization/linkedin';
};

// Check LinkedIn connection status
const checkLinkedInStatus = async () => {
  try {
    const response = await fetch('/api/auth/linkedin/status', {
      credentials: 'include'
    });
    const data = await response.json();
    return data.connected;
  } catch (error) {
    console.error('Failed to check LinkedIn status:', error);
    return false;
  }
};

// Share text post on LinkedIn
const shareTextPost = async (text) => {
  try {
    const response = await fetch('/api/auth/linkedin/share-text', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ text }),
      credentials: 'include'
    });
    return await response.json();
  } catch (error) {
    console.error('Failed to share post:', error);
    throw error;
  }
};

// Share image post on LinkedIn
const shareImagePost = async (text, imageUrl) => {
  try {
    const response = await fetch('/api/auth/linkedin/share-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ text, imageUrl }),
      credentials: 'include'
    });
    return await response.json();
  } catch (error) {
    console.error('Failed to share image post:', error);
    throw error;
  }
};
```

### Usage Example

```jsx
import React, { useState, useEffect } from 'react';

const LinkedInIntegration = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [postText, setPostText] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    checkLinkedInStatus().then(setIsConnected);
  }, []);

  const handleConnect = () => {
    startLinkedInAuth();
  };

  const handleShareText = async () => {
    try {
      await shareTextPost(postText);
      alert('Post shared successfully!');
      setPostText('');
    } catch (error) {
      alert('Failed to share post');
    }
  };

  const handleShareImage = async () => {
    try {
      await shareImagePost(postText, imageUrl);
      alert('Image post shared successfully!');
      setPostText('');
      setImageUrl('');
    } catch (error) {
      alert('Failed to share image post');
    }
  };

  return (
    <div>
      <h2>LinkedIn Integration</h2>
      
      {!isConnected ? (
        <button onClick={handleConnect}>
          Connect to LinkedIn
        </button>
      ) : (
        <div>
          <p>✅ Connected to LinkedIn</p>
          
          <div>
            <h3>Share Text Post</h3>
            <textarea
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              placeholder="What would you like to share?"
              rows={4}
              cols={50}
            />
            <br />
            <button onClick={handleShareText}>Share Text Post</button>
          </div>

          <div>
            <h3>Share Image Post</h3>
            <textarea
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              placeholder="Caption for your image"
              rows={4}
              cols={50}
            />
            <br />
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Image URL"
            />
            <br />
            <button onClick={handleShareImage}>Share Image Post</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LinkedInIntegration;
```

## Database Schema

The User table has been extended with these fields:
- `linkedin_id` - LinkedIn user ID
- `linkedin_access_token` - Access token for LinkedIn API
- `linkedin_refresh_token` - Refresh token (for future use)
- `linkedin_token_expiry` - Token expiration timestamp
- `provider` - Authentication provider ("local", "linkedin")

## Security Notes

1. **Token Storage**: LinkedIn access tokens are stored in the database. Consider encryption for production.
2. **Token Expiry**: LinkedIn access tokens typically expire in 2 hours. Implement refresh token logic as needed.
3. **Permissions**: The implementation requests `w_member_social` permission for posting. Ensure your LinkedIn app is approved for this.
4. **CORS**: Update CORS configuration for your frontend domain.

## Testing

1. Start your Spring Boot application
2. Navigate to `http://localhost:8080/oauth2/authorization/linkedin`
3. Complete LinkedIn authentication
4. Use the API endpoints to share posts

## Troubleshooting

1. **OAuth2 Callback Errors**: Ensure redirect URIs in LinkedIn app match your configuration
2. **Permission Errors**: Verify your LinkedIn app has the required permissions
3. **Token Errors**: Check token expiry and refresh if needed
4. **API Errors**: Verify LinkedIn API rate limits and user permissions

## Production Considerations

1. Use HTTPS for OAuth2 callbacks
2. Implement token refresh logic
3. Add error handling and logging
4. Consider rate limiting for LinkedIn API calls
5. Encrypt sensitive data in database
6. Implement proper error responses for frontend
