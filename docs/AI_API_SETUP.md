# AI API Key Setup Guide

## OpenAI API Configuration

1. **Get an API Key**:
   - Sign up at [OpenAI Platform](https://platform.openai.com/)
   - Navigate to "API Keys" and create a new key

2. **Add to Environment Variables**:
   Create/modify your `.env.local` file:
   ```
   OPENAI_API_KEY=your-api-key-here
   ```

3. **Security Best Practices**:
   - Never commit API keys to version control
   - Use environment variables only
   - Restrict key permissions if possible

## Usage in Application

The AI Calendar Service provides:
- Natural language processing for calendar requests
- Availability summary generation
- Structured responses for calendar operations

## Rate Limiting

- Default limit is 60 requests per minute
- Implement client-side rate limiting if needed
- Add error handling for 429 responses

## Troubleshooting

**Error: Missing API Key**
- Verify `.env.local` exists
- Restart development server after changes
- Check for typos in variable name

**Error: API Request Failed**
- Check network connectivity
- Verify API key is valid and has credits
- Review OpenAI status page for outages
