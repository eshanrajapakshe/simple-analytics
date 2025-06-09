# News Analytics Tracker

A comprehensive, vanilla JavaScript tracking solution for news publishers to monitor user behavior and engagement. Track page views, article clicks, scroll depth, time spent, and device information with seamless Supabase integration.

## ✨ Features

### 📊 Core Tracking Capabilities
- **Page Views & Sessions**: Track unique visitors, sessions, and page views
- **Article Engagement**: Monitor link clicks and article reading behavior  
- **Scroll Depth Tracking**: Measure how much of each article users read
- **Time Spent**: Accurate time tracking with page visibility detection
- **Device Analytics**: Browser, device, screen resolution, and network information
- **Referrer Tracking**: Understand traffic sources and user paths

### 🚀 Technical Features
- **Vanilla JavaScript**: No dependencies, works with any website technology
- **Async Loading**: Non-blocking script loading for optimal performance
- **Failed Event Recovery**: Automatic retry of failed tracking events
- **Real-time Data**: Heartbeat mechanism for live engagement tracking
- **Privacy Focused**: GDPR-compliant with configurable data collection
- **Cross-platform**: Works on WordPress, React, plain HTML, and more

### 🔧 Developer Features  
- **Easy Integration**: Simple script tag integration
- **Configurable**: Extensive customization options
- **Debug Mode**: Built-in debugging for development
- **Custom Events**: Track custom interactions and conversions
- **Public API**: Programmatic access to tracking functions

## 📋 Prerequisites

1. **Supabase Account**: Create a free account at [supabase.com](https://supabase.com)
2. **Website Access**: Ability to add JavaScript to your website
3. **Basic Knowledge**: Understanding of HTML/JavaScript (for customization)

## 🚀 Quick Start

### Step 1: Set up Supabase Database

1. Create a new Supabase project
2. Go to the SQL Editor in your Supabase dashboard
3. Copy and paste the contents of `supabase-schema.sql`
4. Run the SQL to create the analytics table and views

### Step 2: Get Your Credentials

From your Supabase project dashboard:
- **Project URL**: Found in Settings > API
- **Anon Key**: Found in Settings > API

### Step 3: Basic Integration

Add this code to your website just before the closing `</body>` tag:

```html
<!-- News Analytics Tracking Script -->
<script>
  window.NewsAnalytics = {
    supabaseUrl: 'YOUR_SUPABASE_URL',
    supabaseKey: 'YOUR_SUPABASE_ANON_KEY',
    websiteId: 'your-website-name',
    debug: false // Set to true for development
  };
</script>
<script src="news-analytics-tracker.js"></script>
```

That's it! Your website is now tracking user behavior.

## 📊 What Gets Tracked

### Automatic Events

| Event Type | Description | Data Collected |
|------------|-------------|----------------|
| `page_view` | User visits a page | URL, title, referrer, device info |
| `link_click` | User clicks any link | Clicked URL, link text, scroll position |
| `heartbeat` | Periodic time tracking | Time spent, scroll depth, visibility |
| `page_exit` | User leaves page | Total time, max scroll depth |
| `scroll_milestone` | User scrolls threshold | Scroll percentage, time to reach |

### Device Information Collected

- User agent string
- Browser language
- Platform/OS
- Screen resolution
- Viewport size
- Timezone
- Online status
- Cookie support

## ⚙️ Configuration Options

```javascript
window.NewsAnalytics = {
  // Required
  supabaseUrl: 'YOUR_SUPABASE_URL',
  supabaseKey: 'YOUR_SUPABASE_ANON_KEY',
  
  // Optional
  websiteId: 'default', // Unique identifier for your site
  trackingTable: 'analytics_events', // Custom table name
  debug: false, // Enable console logging
  scrollThreshold: 80, // Percentage to consider "read"
  timeInterval: 5000, // Heartbeat interval (milliseconds)
  
  // Advanced options
  enableScrollTracking: true,
  enableLinkTracking: true,
  enableTimeTracking: true,
  enableDeviceTracking: true
};
```

## 🔧 Integration Examples

### WordPress Integration

Add to your theme's `functions.php`:

```php
function add_news_analytics_tracking() {
    ?>
    <script>
    window.NewsAnalytics = {
        supabaseUrl: 'YOUR_SUPABASE_URL', 
        supabaseKey: 'YOUR_SUPABASE_ANON_KEY',
        websiteId: '<?php echo esc_js(get_bloginfo('name')); ?>',
        debug: <?php echo (WP_DEBUG ? 'true' : 'false'); ?>
    };
    </script>
    <script src="<?php echo get_template_directory_uri(); ?>/js/news-analytics-tracker.js"></script>
    <?php
}
add_action('wp_footer', 'add_news_analytics_tracking');
```

### React/Next.js Integration

```jsx
import { useEffect } from 'react';

function App() {
  useEffect(() => {
    window.NewsAnalytics = {
      supabaseUrl: process.env.REACT_APP_SUPABASE_URL,
      supabaseKey: process.env.REACT_APP_SUPABASE_ANON_KEY,
      websiteId: 'my-react-news-app',
      debug: process.env.NODE_ENV === 'development'
    };

    const script = document.createElement('script');
    script.src = '/news-analytics-tracker.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return <div>Your app content</div>;
}
```

For more integration examples, see `integration-examples.html`.

## 🎯 Custom Event Tracking

Track custom events like newsletter signups, social shares, or comments:

```javascript
// Track newsletter signup
NewsAnalytics.track('newsletter_signup', {
  location: 'article_bottom',
  articleTitle: document.title
});

// Track social share
NewsAnalytics.track('social_share', {
  platform: 'twitter',
  articleUrl: window.location.href
});

// Track comment submission
NewsAnalytics.track('comment_submit', {
  articleId: 'article-123',
  commentLength: commentText.length
});
```

## 📈 Data Analysis

### Supabase Dashboard Queries

**Top performing articles:**
```sql
SELECT 
  page_title,
  page_url,
  COUNT(*) as page_views,
  COUNT(DISTINCT user_id) as unique_users,
  AVG((metadata->>'maxScrollDepth')::int) as avg_scroll_depth
FROM analytics_events 
WHERE event_type = 'page_view'
  AND website_id = 'your-website-id'
  AND timestamp >= NOW() - INTERVAL '7 days'
GROUP BY page_title, page_url
ORDER BY page_views DESC
LIMIT 10;
```

**User engagement metrics:**
```sql
SELECT 
  DATE(timestamp) as date,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(DISTINCT session_id) as sessions,
  COUNT(*) filter (WHERE event_type = 'page_view') as page_views,
  AVG((metadata->>'timeSpent')::int) as avg_time_spent
FROM analytics_events 
WHERE website_id = 'your-website-id'
  AND timestamp >= NOW() - INTERVAL '30 days'
GROUP BY DATE(timestamp)
ORDER BY date DESC;
```

### Pre-built Views

The schema includes helpful views:
- `daily_analytics_summary`: Daily aggregated statistics
- `popular_content`: Most viewed articles with engagement metrics
- `user_behavior_summary`: User-level behavior analysis

## 🔒 Privacy & Compliance

### GDPR Compliance Features

- **Anonymous by Default**: No personally identifiable information collected
- **User-generated IDs**: Random identifiers, not linked to personal data
- **Configurable Tracking**: Disable specific tracking features
- **Data Retention**: Built-in cleanup functions for old data

### Opt-out Implementation

```javascript
// Check if user has opted out
if (localStorage.getItem('analytics_opt_out') === 'true') {
  // Don't load tracking script
  return;
}

// Provide opt-out mechanism
function optOutUser() {
  localStorage.setItem('analytics_opt_out', 'true');
  // Stop current tracking
  NewsAnalytics = null;
}
```

## 🛠️ Development & Testing

### Debug Mode

Enable detailed logging:

```javascript
window.NewsAnalytics = {
  // ... your config
  debug: true
};
```

### Manual Testing

Test events from browser console:

```javascript
// Check current status
console.log('User ID:', NewsAnalytics.getUserId());
console.log('Session ID:', NewsAnalytics.getSessionId());
console.log('Time Spent:', NewsAnalytics.getTimeSpent());

// Send test event
NewsAnalytics.track('test_event', { test: 'data' });

// Retry failed events
NewsAnalytics.retryFailedEvents();
```

## 📊 Performance Considerations

### Optimization Features

- **Async Loading**: Non-blocking script loading
- **Debounced Events**: Scroll events throttled to prevent spam
- **Local Storage**: Failed events stored and retried automatically
- **Minimal Payload**: Efficient data structure for fast transmission
- **Database Indexing**: Optimized queries with proper indexes

### Best Practices

1. **Heartbeat Interval**: Adjust based on your audience (default: 5 seconds)
2. **Scroll Threshold**: Set appropriate reading completion percentage
3. **Data Retention**: Clean up old events regularly
4. **Error Handling**: Monitor failed events and retry mechanisms

## 🔧 Troubleshooting

### Common Issues

**Events not appearing in database:**
- Check Supabase credentials
- Verify RLS policies allow anonymous inserts
- Enable debug mode to see error messages
- Check browser network tab for failed requests

**High data volume:**
- Increase heartbeat interval
- Implement data sampling for high-traffic sites
- Set up automated cleanup procedures

**Integration problems:**
- Ensure script loads after DOM is ready
- Check for JavaScript errors in console  
- Verify Supabase URL format (no trailing slash)

### Support

1. Check the `integration-examples.html` file for detailed examples
2. Enable debug mode for detailed error logging
3. Review Supabase logs for API errors
4. Verify database schema is properly installed

## 📄 File Structure

```
news-analytics-tracker/
├── news-analytics-tracker.js     # Main tracking script
├── supabase-schema.sql          # Database schema
├── integration-examples.html    # Integration examples  
├── README.md                    # This documentation
└── examples/                    # Additional examples
    ├── wordpress-plugin.php     # WordPress plugin
    ├── react-component.jsx      # React integration
    └── advanced-tracking.js     # Custom event examples
```

## 🔄 Updates & Maintenance

### Regular Maintenance

1. **Data Cleanup**: Run the cleanup function monthly
```sql
SELECT cleanup_old_analytics_events(90); -- Keep 90 days
```

2. **Index Monitoring**: Check query performance
3. **Schema Updates**: Update tracking script when schema changes
4. **Error Monitoring**: Review failed events in local storage

### Version Updates

When updating the tracking script:
1. Test in development environment first
2. Update all sites simultaneously to maintain data consistency
3. Monitor for any breaking changes in data structure

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For support and questions:
- Check the troubleshooting section above
- Review integration examples
- Open an issue on GitHub

---

**Made with ❤️ for news publishers who want to understand their audience better** 