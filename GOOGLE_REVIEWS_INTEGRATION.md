# Google Reviews Integration Guide

This guide explains how to integrate real Google reviews into your Regal Party Rentals website.

## Current Implementation

The website currently has a **Reviews section** with placeholder content and a link to your Google Business listing. The section is fully styled and ready to display real reviews.

## Integration Options

### Option 1: Manual Updates (Simplest - Recommended for Start)

**Steps:**
1. Visit your Google Business Profile: https://www.google.com/search?q=regal+party+rentals
2. Copy your best reviews (customer name, rating, review text, date)
3. Edit `index.html` and replace the placeholder review cards in the Reviews section
4. Update the aggregate rating and review count

**Pros:**
- No technical setup required
- Full control over which reviews to display
- No API costs

**Cons:**
- Manual updates required
- Reviews won't auto-update

### Option 2: Google My Business API (Advanced)

**Requirements:**
- Google Cloud Project
- Google My Business API enabled
- API Key with proper permissions
- Server-side code (cannot be done purely in browser due to CORS)

**Steps:**
1. Create a Google Cloud Project
2. Enable the Google My Business API
3. Create API credentials
4. Get your Place ID from Google My Business
5. Uncomment and configure the JavaScript code in `js/script.js`
6. Set up a backend service to fetch reviews (required due to API restrictions)

**Note:** This method requires backend server code as Google's API doesn't allow direct browser calls for security reasons.

### Option 3: Third-Party Widget Services (Easiest Auto-Update)

These services handle the API integration and provide simple embed codes:

#### **ReviewsOnMyWebsite** (Recommended)
- **Website:** https://reviewsonmywebsite.com
- **Cost:** Free plan available
- **Features:** Auto-updates, multiple platforms, customizable
- **Setup:** Sign up, connect your Google Business, copy embed code

#### **EmbedSocial**
- **Website:** https://embedsocial.com
- **Cost:** Free and paid plans
- **Features:** Social media widgets, review widgets
- **Setup:** Create account, add Google Business, get embed code

#### **Elfsight Google Reviews Widget**
- **Website:** https://elfsight.com/google-reviews-widget/
- **Cost:** Free and paid plans
- **Features:** Easy setup, customizable design
- **Setup:** Configure widget, copy embed code

**Implementation Steps for Third-Party Widget:**

1. Sign up for your chosen service
2. Connect your Google Business Profile
3. Customize the widget appearance to match your site
4. Copy the embed code provided
5. Replace the placeholder reviews container in `index.html` with the embed code

**Example Integration:**
```html
<!-- Replace the #googleReviewsContainer div with: -->
<div class="row g-4">
    <div class="col-12">
        <!-- Paste your widget embed code here -->
        <div id="reviews-widget">
            <!-- Third-party widget code will go here -->
        </div>
    </div>
</div>
```

### Option 4: Screenshots/Manual Curation

**Steps:**
1. Take screenshots of your best Google reviews
2. Optimize images for web
3. Replace placeholder cards with review images
4. Link images to your Google Business profile

**Pros:**
- Simple to implement
- No API setup needed

**Cons:**
- Not SEO-friendly
- Manual updates required

## Recommended Approach

**For Immediate Use:**
1. Use **Option 1 (Manual Updates)** to get real reviews displayed quickly
2. Later, migrate to **Option 3 (Third-Party Widget)** for automatic updates

**For Long-Term:**
- Set up **ReviewsOnMyWebsite** or similar service for automatic review updates
- This ensures reviews stay current without manual work

## Current Setup

The reviews section includes:
- ✅ Styled review cards ready for content
- ✅ Aggregate rating display
- ✅ Link to Google Business listing
- ✅ Responsive design for all devices
- ✅ SEO-friendly structure

## Updating Aggregate Rating

To update the overall rating displayed:

1. Find your current Google rating and review count
2. Edit `index.html`:
   - Update the number in the aggregate rating: `<div class="display-1 fw-bold text-primary mb-2">4.9</div>`
   - Update review count: `<strong id="reviewCount">87</strong>`

## Getting Your Google Place ID

If you need your Google Place ID for API integration:

1. Visit: https://developers.google.com/maps/documentation/places/web-service/place-id
2. Use the Place ID Finder tool
3. Search for "Regal Party Rentals"
4. Copy the Place ID

## Need Help?

For questions about:
- **Manual updates:** Simply edit the HTML file
- **Third-party widgets:** Contact the widget provider's support
- **API integration:** Consult with a web developer familiar with Google APIs

## Important Notes

- Always respect Google's Terms of Service when displaying reviews
- Don't modify review content (keep reviews as-is)
- Link back to your Google Business listing
- Update reviews regularly to show fresh content
- Respond to reviews on Google to encourage more reviews
