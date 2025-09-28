# Google Forms Integration Setup

This document explains how to set up automated integration between your Google Form and the Ayuda CRM.

## What's Already Done ✅

- ✅ API endpoint created at `/api/webhooks/google-forms`
- ✅ Webhook tested and working
- ✅ Automatic lead creation from form submissions
- ✅ Duplicate prevention (checks existing emails)
- ✅ Activity tracking for form submissions

## Setup Instructions

### Step 1: Deploy Your Application

Your webhook endpoint needs to be publicly accessible. Deploy your Next.js app to Vercel, Netlify, or your preferred hosting platform.

**Webhook URL:** `https://your-domain.com/api/webhooks/google-forms`

### Step 2: Configure Google Forms Webhook

Since Google Forms doesn't have built-in webhook support, you have a few options:

#### Option A: Use Google Apps Script (Recommended)

1. Open your Google Form
2. Click the three dots menu → "Script editor"
3. Replace the default code with:

```javascript
function onSubmit(e) {
  const formResponse = e.response;
  const itemResponses = formResponse.getItemResponses();
  
  // Extract form data
  let formData = {};
  itemResponses.forEach(function(itemResponse) {
    const item = itemResponse.getItem();
    const response = itemResponse.getResponse();
    
    // Map form fields to our expected format
    if (item.getTitle() === 'Email') {
      formData.email = response;
    } else if (item.getTitle() === 'Your Name') {
      formData.name = response;
    } else if (item.getTitle() === 'Your WhatsApp Number') {
      formData.whatsapp = response;
    }
  });
  
  // Add metadata
  formData.timestamp = new Date().toISOString();
  formData.form_id = '1fBTbjjJXjd6cUqE6AsKSclejhEXjWgZ8qf0OGp3UsOI';
  formData.response_id = formResponse.getId();
  
  // Send to your webhook
  const webhookUrl = 'https://your-domain.com/api/webhooks/google-forms';
  
  const options = {
    'method': 'POST',
    'headers': {
      'Content-Type': 'application/json',
    },
    'payload': JSON.stringify(formData)
  };
  
  try {
    const response = UrlFetchApp.fetch(webhookUrl, options);
    console.log('Webhook response:', response.getContentText());
  } catch (error) {
    console.error('Webhook error:', error);
  }
}
```

4. Save the script
5. Go to "Triggers" (clock icon) → "Add Trigger"
6. Set up the trigger:
   - Function: `onSubmit`
   - Event source: "From form"
   - Event type: "On form submit"
   - Click "Save"

#### Option B: Use Zapier Integration

1. Go to [Zapier.com](https://zapier.com)
2. Create a new Zap
3. Choose "Google Forms" as trigger
4. Choose "Webhooks" as action
5. Configure the webhook to POST to your endpoint

#### Option C: Use Make.com (formerly Integromat)

1. Go to [Make.com](https://make.com)
2. Create a new scenario
3. Add "Google Forms" module as trigger
4. Add "HTTP" module to POST to your webhook

### Step 3: Test the Integration

1. Submit a test form response
2. Check your CRM dashboard for the new lead
3. Verify the lead appears in the leads list
4. Check that an activity was created

## Webhook Endpoint Details

**URL:** `POST /api/webhooks/google-forms`

**Expected Payload:**
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "whatsapp": "+91-9876543210",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "form_id": "1fBTbjjJXjd6cUqE6AsKSclejhEXjWgZ8qf0OGp3UsOI",
  "response_id": "response-123"
}
```

**Response:**
```json
{
  "message": "Lead created successfully",
  "lead_id": "uuid-here",
  "lead": {
    "id": "uuid-here",
    "name": "John Doe",
    "email": "user@example.com",
    "phone": "+91-9876543210",
    "source": "Google Forms",
    "stage": "Lead",
    "created_at": "2024-01-01T12:00:00.000Z"
  }
}
```

## Features

- **Automatic Lead Creation**: New form submissions automatically create leads
- **Duplicate Prevention**: Checks for existing emails to avoid duplicates
- **Activity Tracking**: Creates activity records for form submissions
- **Error Handling**: Comprehensive error handling and logging
- **Source Tracking**: Marks leads as coming from "Google Forms"

## Troubleshooting

### Common Issues

1. **Webhook not receiving data**
   - Check if your app is deployed and accessible
   - Verify the webhook URL is correct
   - Check Google Apps Script execution logs

2. **Leads not appearing in CRM**
   - Check the webhook response for errors
   - Verify database connection
   - Check browser console for errors

3. **Duplicate leads**
   - The system checks for existing emails
   - If duplicates appear, check the email matching logic

### Debugging

- Check the webhook endpoint: `GET /api/webhooks/google-forms`
- Review server logs for error messages
- Test with the provided test script

## Security Considerations

- The webhook endpoint is public - consider adding authentication
- Validate all incoming data
- Rate limiting may be needed for high-volume forms
- Consider IP whitelisting for Google's servers

## Next Steps

1. Deploy your application
2. Set up the Google Apps Script
3. Test with a real form submission
4. Monitor the integration for any issues
5. Consider adding authentication to the webhook endpoint
