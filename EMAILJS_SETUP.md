# EmailJS Setup Guide

The contact form is now configured to send emails using EmailJS. Follow these steps to complete the setup:

## Step 1: Create EmailJS Account

1. Go to [https://www.emailjs.com/](https://www.emailjs.com/)
2. Sign up for a free account (free tier includes 200 emails/month)
3. Verify your email address

## Step 2: Create an Email Service

1. In the EmailJS dashboard, go to **Email Services**
2. Click **Add New Service**
3. Choose your email provider (Gmail, Outlook, etc.) or use **EmailJS** for testing
4. Follow the setup instructions for your provider
5. **Copy your Service ID** (you'll need this later)

## Step 3: Create an Email Template

1. In the EmailJS dashboard, go to **Email Templates**
2. Click **Create New Template**
3. Use this template structure:

**Subject:**
```
New Quote Request from {{from_name}}
```

**Content (HTML format):**
```html
<div style="font-family: system-ui, sans-serif, Arial; font-size: 12px">
  <div>A message by {{from_name}} has been received. Kindly respond at your earliest convenience.</div>

  <div
    style="
      margin-top: 20px;
      padding: 15px 0;
      border-width: 1px 0;
      border-style: dashed;
      border-color: lightgrey;
    "
  >
    <table role="presentation" style="width: 100%">
      <tr>
        <td style="vertical-align: top; width: 60px">
          <div
            style="
              padding: 6px 10px;
              margin: 0 10px;
              background-color: aliceblue;
              border-radius: 5px;
              font-size: 26px;
              text-align: center;
            "
            role="img"
          >
            👤
          </div>
        </td>
        <td style="vertical-align: top">
          <div style="color: #2c3e50; font-size: 16px; margin-bottom: 10px">
            <strong>{{from_name}}</strong>
          </div>
          
          <div style="color: #666; font-size: 13px; margin-bottom: 15px">
            <div><strong>Email:</strong> {{from_email}}</div>
            <div><strong>Phone:</strong> {{phone}}</div>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 12px; border-radius: 5px; margin-bottom: 15px">
            <div style="color: #2c3e50; font-size: 14px; font-weight: bold; margin-bottom: 8px">Event Details:</div>
            <div style="color: #555; font-size: 13px; line-height: 1.6">
              <div><strong>Location:</strong> {{location}}</div>
              <div><strong>Date:</strong> {{event_date}}</div>
              <div><strong>Event Type:</strong> {{event_type}}</div>
              <div><strong>Guest Count:</strong> {{guest_count}}</div>
            </div>
          </div>
          
          <div style="color: #2c3e50; font-size: 14px; font-weight: bold; margin-bottom: 8px">Message:</div>
          <p style="font-size: 14px; color: #333; line-height: 1.6; margin: 0; white-space: pre-wrap">{{message}}</p>
        </td>
      </tr>
    </table>
  </div>
  
  <div style="margin-top: 20px; padding-top: 15px; border-top: 1px dashed lightgrey; font-size: 11px; color: #999; text-align: center">
    This email was sent from the Regal Party Rentals contact form.
  </div>
</div>
```

**Important:** Make sure your EmailJS template uses these exact variable names:
- `{{from_name}}` - The sender's name
- `{{from_email}}` - The sender's email address
- `{{phone}}` - The sender's phone number
- `{{location}}` - Event location (Victoria, Vancouver, etc.)
- `{{event_date}}` - Event date (or "Not specified" if not provided)
- `{{event_type}}` - Type of event (Wedding, Corporate, etc. or "Not specified")
- `{{guest_count}}` - Estimated number of guests (or "Not specified")
- `{{message}}` - The message content

These match the variables being sent from the form in `index.html`.

**Note:** In EmailJS, you can use either:
- **Plain Text** format (simpler, works everywhere)
- **HTML** format (better formatting, as shown above)

For HTML format, paste the HTML code above into the template editor. EmailJS will automatically detect HTML formatting.

4. **Copy your Template ID** (you'll need this later)

## Step 4: Get Your Public Key

1. In the EmailJS dashboard, go to **Account** → **General**
2. Find your **Public Key** (also called API Key)
3. **Copy your Public Key**

## Step 5: Update the JavaScript File

1. Open `js/script.js`
2. Find these lines near the top of the Contact Form Handling section:

```javascript
const EMAILJS_SERVICE_ID = 'YOUR_SERVICE_ID';
const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';
const EMAILJS_PUBLIC_KEY = 'YOUR_PUBLIC_KEY';
```

3. Replace the placeholder values with your actual credentials:
   - Replace `'YOUR_SERVICE_ID'` with your Service ID
   - Replace `'YOUR_TEMPLATE_ID'` with your Template ID
   - Replace `'YOUR_PUBLIC_KEY'` with your Public Key

Example:
```javascript
const EMAILJS_SERVICE_ID = 'service_abc123';
const EMAILJS_TEMPLATE_ID = 'template_xyz789';
const EMAILJS_PUBLIC_KEY = 'abcdefghijklmnop';
```

## Step 6: Test the Form

1. Open your website in a browser
2. Fill out the contact form
3. Submit the form
4. Check your email inbox for the test message

## Troubleshooting

### Form shows "Email service is not configured"
- Make sure you've updated all three constants in `js/script.js`
- Check that EmailJS library is loading (check browser console)

### Emails not being received
- Check your EmailJS dashboard for error logs
- Verify your email service is properly connected
- Check spam/junk folder
- Make sure your template variables match exactly (case-sensitive)

### "Email sending failed" error
- Check browser console for detailed error messages
- Verify your Public Key is correct
- Make sure your Service ID and Template ID are correct
- Check EmailJS dashboard for service status

## Security Note

The Public Key is safe to use in client-side code. However, for production use, consider:
- Setting up rate limiting in EmailJS dashboard
- Using EmailJS's built-in spam protection
- Monitoring your email usage

## Free Tier Limits

EmailJS free tier includes:
- 200 emails per month
- Basic email templates
- Standard support

For higher volumes, consider upgrading to a paid plan.

## Alternative: Server-Side Solution

If you prefer a server-side solution, you can:
- Set up a Node.js/Express backend
- Use Nodemailer or similar library
- Create an API endpoint for form submissions
- Update the form handler to POST to your endpoint

