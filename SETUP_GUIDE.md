# 🚀 News Analytics Tracker - Complete Setup Guide

This guide will walk you through setting up the News Analytics Tracker from scratch, including Supabase configuration and testing.

## 📋 Prerequisites

- A modern web browser
- A text editor
- Internet connection
- Basic understanding of HTML/JavaScript (helpful but not required)

## 🔧 Step 1: Set Up Supabase Database

### 1.1 Create a Supabase Account

1. Go to [supabase.com](https://supabase.com)
2. Click "Sign up" and create an account
3. Verify your email address

### 1.2 Create a New Project

1. Click "New Project" in your Supabase dashboard
2. Choose your organization
3. Fill in project details:
   - **Name**: `news-analytics` (or any name you prefer)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose the region closest to your users
4. Click "Create new project"
5. Wait for the project to be set up (takes 1-2 minutes)

### 1.3 Set Up the Database Schema

1. In your Supabase dashboard, go to the **SQL Editor** (left sidebar)
2. Click "New query"
3. Copy the entire contents of `supabase-schema.sql` and paste it into the editor
4. Click "Run" to execute the SQL
5. You should see "Success. No rows returned" - this means the tables were created successfully

### 1.4 Get Your API Credentials

1. Go to **Settings** > **API** in your Supabase dashboard
2. Find these two values:
   - **Project URL**: Something like `https://abcxyzdef.supabase.co`
   - **Anon public key**: A long string starting with `eyJ...`
3. **IMPORTANT**: Copy these values - you'll need them in the next step

## 📁 Step 2: Set Up Your Files

### 2.1 Download the Files

Ensure you have these files in the same directory:
- `news-analytics-tracker.js` (the main tracking script)
- `demo.html` (the test page)
- `supabase-schema.sql` (database schema - already used above)

### 2.2 Configure the Demo Page

1. Open `demo.html` in your text editor
2. Find this section around line 190:
   ```javascript
   window.NewsAnalytics = {
       supabaseUrl: 'YOUR_SUPABASE_URL',           // ← Replace this
       supabaseKey: 'YOUR_SUPABASE_ANON_KEY',      // ← Replace this
       websiteId: 'demo-test-site',
       debug: true,
       scrollThreshold: 75,
       timeInterval: 3000
   };
   ```

3. Replace the placeholder values:
   - Replace `'YOUR_SUPABASE_URL'` with your Project URL from step 1.4
   - Replace `'YOUR_SUPABASE_ANON_KEY'` with your Anon public key from step 1.4

4. Example of what it should look like:
   ```javascript
   window.NewsAnalytics = {
       supabaseUrl: 'https://abcxyzdef.supabase.co',
       supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',  // (your actual key will be much longer)
       websiteId: 'demo-test-site',
       debug: true,
       scrollThreshold: 75,
       timeInterval: 3000
   };
   ```

5. Save the file

## 🧪 Step 3: Test the System

### 3.1 Open the Demo Page

1. Open `demo.html` in your web browser (double-click the file)
2. You should see a test page with:
   - A green "✅ Analytics Active" indicator in the top-right
   - No configuration warning (if you see a warning, check your credentials)
   - A debug panel in the bottom-right showing analytics data

### 3.2 Test Different Features

**Test Link Clicking:**
1. Click on any of the test links in the "Link Click Tracking" section
2. You should see the "Events" counter in the debug panel increase

**Test Custom Events:**
1. Click the social share buttons
2. Click "Newsletter Signup" and "Comment Submit" buttons
3. Click the "Test Event" button in the debug panel
4. Each click should increase the events counter

**Test Scroll Tracking:**
1. Scroll down the page slowly
2. Watch the scroll indicator at the top of the page
3. Watch the "Scroll" and "Max Scroll" values in the debug panel
4. When you reach 75% scroll depth, a milestone event is triggered

**Test Time Tracking:**
1. Leave the page open and watch the "Time" counter in the debug panel
2. Switch to another tab and back - time should only count when the page is visible

### 3.3 Verify Data in Supabase

1. Go back to your Supabase dashboard
2. Click **Table Editor** in the left sidebar
3. Select the `analytics_events` table
4. You should see rows of data corresponding to your test actions
5. Each row contains:
   - Event type (page_view, link_click, heartbeat, etc.)
   - Timestamp
   - User and session IDs
   - Page URL and metadata
   - Device information

## 🔍 Step 4: Understanding the Data

### 4.1 Event Types You'll See

| Event Type | When It's Triggered | Key Data |
|------------|-------------------|----------|
| `page_view` | When page loads | URL, title, referrer, device info |
| `link_click` | When user clicks any link | Clicked URL, link text, scroll position |
| `heartbeat` | Every 3 seconds (configurable) | Time spent, scroll depth, visibility |
| `scroll_milestone` | When user scrolls past threshold | Scroll percentage, time to reach |
| `page_exit` | When user leaves page | Total time, max scroll depth |
| `social_share` | Custom event from buttons | Platform, share URL |
| `newsletter_signup` | Custom event from button | Form location, article info |

### 4.2 Useful Database Queries

**View all events for your test:**
```sql
SELECT * FROM analytics_events 
WHERE website_id = 'demo-test-site' 
ORDER BY timestamp DESC 
LIMIT 20;
```

**Get page view summary:**
```sql
SELECT 
    page_url,
    COUNT(*) as page_views,
    COUNT(DISTINCT user_id) as unique_users
FROM analytics_events 
WHERE event_type = 'page_view' 
    AND website_id = 'demo-test-site'
GROUP BY page_url;
```

**Average time spent per session:**
```sql
SELECT 
    session_id,
    MAX((metadata->>'timeSpent')::integer) as max_time_spent
FROM analytics_events 
WHERE event_type = 'heartbeat' 
    AND website_id = 'demo-test-site'
GROUP BY session_id;
```

## 🌐 Step 5: Deploy to Your Website

### 5.1 For Plain HTML Websites

1. Upload `news-analytics-tracker.js` to your website
2. Add this code before the closing `</body>` tag of your pages:

```html
<script>
  window.NewsAnalytics = {
    supabaseUrl: 'https://your-project.supabase.co',
    supabaseKey: 'your-anon-key',
    websiteId: 'your-website-name',
    debug: false  // Set to true for testing
  };
</script>
<script src="news-analytics-tracker.js"></script>
```

### 5.2 For WordPress Sites

See the `integration-examples.html` file for detailed WordPress integration instructions.

### 5.3 For React/Next.js Apps

See the `integration-examples.html` file for React and Next.js integration examples.

## 🔧 Step 6: Production Configuration

### 6.1 Security Settings

1. In your Supabase dashboard, go to **Authentication** > **Settings**
2. Add your domain to "Site URL" and "Additional URLs"
3. Consider setting up Row Level Security policies for your specific use case

### 6.2 Performance Optimization

For high-traffic sites, consider:
- Increasing `timeInterval` to reduce database writes
- Implementing data sampling for very high-traffic pages
- Setting up automated data cleanup using the provided SQL function

### 6.3 Privacy Compliance

- The system is GDPR-compliant by default (no PII collected)
- Consider adding an opt-out mechanism for your users
- Review the privacy settings in your Supabase project

## 🛠️ Troubleshooting

### Common Issues

**"Analytics Not Configured" message:**
- Check that your Supabase URL and API key are correctly set
- Ensure there are no typos in the credentials
- Verify your Supabase project is active

**No data appearing in database:**
- Check browser console for error messages
- Verify your Supabase API key has the correct permissions
- Ensure the `analytics_events` table was created properly

**JavaScript errors:**
- Make sure `news-analytics-tracker.js` is loading correctly
- Check that the file path in your script tag is correct
- Ensure no other scripts are conflicting

### Debug Mode

Enable debug mode to see detailed logging:
```javascript
window.NewsAnalytics = {
  // ... your other settings
  debug: true  // This will log all events to the browser console
};
```

### Getting Help

1. Check the browser console for error messages
2. Verify all files are in the correct locations
3. Test with the demo page first to ensure basic setup works
4. Review the `integration-examples.html` for platform-specific guidance

## 🎉 You're All Set!

Your news analytics tracker is now ready to collect valuable insights about your audience. The system will automatically track:

- ✅ Page views and unique visitors
- ✅ Time spent reading articles  
- ✅ Scroll depth and reading completion
- ✅ Link clicks and navigation patterns
- ✅ Device and browser information
- ✅ Custom events you define

Check your Supabase dashboard regularly to analyze the data and gain insights into your audience behavior!

---

**Next Steps:**
- Explore the pre-built database views for common analytics queries
- Set up automated reports using the provided SQL examples
- Consider building a dashboard to visualize your analytics data
- Review the advanced integration examples for custom event tracking 