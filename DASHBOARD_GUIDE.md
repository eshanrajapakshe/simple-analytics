# 📊 Analytics Dashboard Guide

This guide explains how to use the News Analytics Dashboard to visualize your website tracking data.

## 🚀 Quick Start

1. **Open the Dashboard**: Open `analytics-dashboard.html` in your web browser
2. **Configure Credentials**: If needed, update the Supabase credentials in the script section
3. **View Your Data**: The dashboard will automatically load and display your analytics data

## 📈 Dashboard Features

### Real-time Metrics Cards

The dashboard displays four key metrics at the top:

- **Total Page Views**: Complete count of page visits
- **Unique Users**: Number of distinct visitors  
- **Average Time Spent**: How long users spend on your site
- **Average Scroll Depth**: How far down users scroll (as a percentage)

### Interactive Charts

#### 📈 Page Views Over Time
- **Type**: Line chart
- **Shows**: Page view trends by hour/day
- **Use**: Track traffic patterns and peak usage times

#### 📱 Device Types  
- **Type**: Doughnut chart
- **Shows**: Breakdown of Desktop vs Mobile vs Tablet users
- **Use**: Understand your audience's device preferences

#### 🔗 Top Pages
- **Type**: Horizontal bar chart  
- **Shows**: Most visited pages on your website
- **Use**: Identify your most popular content

#### 📊 Scroll Depth Distribution
- **Type**: Bar chart
- **Shows**: How many users scroll to different page depths (0-25%, 25-50%, 50-75%, 75-100%)
- **Use**: Measure content engagement and reading completion

#### ⏱️ Time Spent Distribution  
- **Type**: Bar chart
- **Shows**: Session duration buckets (0-30s, 30-60s, 1-3m, 3-5m, 5m+)
- **Use**: Understand user engagement levels

### 🕐 Recent Activity Table

Shows the latest 20 events with details:
- **Time**: When the event occurred
- **Event**: Type of user action (page view, link click, etc.)
- **Page**: Which page the event happened on
- **User**: Truncated user ID for privacy
- **Details**: Additional context like link text or scroll depth

## 🎛️ Dashboard Controls

### Time Range Filter
Choose from:
- **Last 24 Hours**: Recent activity and real-time insights
- **Last 7 Days**: Weekly trends and patterns  
- **Last 30 Days**: Monthly overview and growth
- **Last 90 Days**: Quarterly analysis and long-term trends

### Website Filter
- Filter data by specific website ID
- Useful if you're tracking multiple sites
- Leave blank to see all websites

### Refresh Button
- Manually refresh the dashboard data
- Auto-refresh happens every 30 seconds
- Use when you want immediate updates

## 🔍 Understanding Your Data

### Event Types Explained

| Event Type | Description | When It Triggers |
|------------|-------------|------------------|
| `page_view` | User loads a page | On every page load |
| `link_click` | User clicks a link | When any link is clicked |
| `heartbeat` | Time tracking ping | Every few seconds while page is active |
| `scroll_milestone` | Scroll depth reached | When user scrolls past threshold (75%) |
| `page_exit` | User leaves page | On page unload/navigation |
| `social_share` | Social sharing | Custom button clicks |
| `newsletter_signup` | Email signup | Custom form submissions |

### Key Insights to Look For

#### 📊 Traffic Patterns
- **Peak hours**: When do you get most visitors?
- **Day-of-week trends**: Which days are busiest?
- **Growth trends**: Is traffic increasing over time?

#### 👥 User Behavior
- **Bounce rate**: High percentage of 0-30s sessions indicates users leaving quickly
- **Engagement**: High scroll depths (75-100%) show users reading your content
- **Popular content**: Top pages reveal what resonates with your audience

#### 📱 Technical Insights
- **Device preferences**: Mobile-first design needed if mobile dominates
- **Performance issues**: Very short session times might indicate slow loading
- **Content length**: Low scroll depths might mean content is too long

## 🛠️ Troubleshooting

### Common Issues

**Dashboard shows "Not Configured"**
- Check that your Supabase URL and API key are correct
- Ensure credentials match those used in your tracking script

**No data appearing**
- Verify your tracking script is active on your website
- Check that events are being recorded in your Supabase database
- Try refreshing the dashboard or changing the time range

**Charts not updating**
- Check browser console for JavaScript errors
- Ensure you have internet connection for Chart.js CDN
- Try hard refreshing the page (Ctrl+F5)

**API errors**
- Verify your Supabase project is active and accessible
- Check that the `analytics_events` table exists
- Ensure your API key has proper permissions

### Debug Mode

Enable debug mode by opening browser developer tools and checking the console for:
- Data loading status
- API response details  
- Chart update confirmations
- Error messages

## 🎨 Customization

### Changing Time Ranges
You can modify the time range options by editing the `timeRange` select element:

```html
<select id="timeRange">
    <option value="1h">Last Hour</option>     <!-- Add custom ranges -->
    <option value="24h">Last 24 Hours</option>
    <option value="7d">Last 7 Days</option>
    <!-- Add more options as needed -->
</select>
```

### Adding Custom Metrics
To add new metric cards, follow this pattern:

```html
<div class="stat-card">
    <div class="stat-value" id="customMetric">-</div>
    <div class="stat-label">Custom Metric</div>
    <div class="stat-change" id="customChange"></div>
</div>
```

Then update the JavaScript to calculate and display your custom metric.

### Styling Changes
The dashboard uses CSS custom properties for easy theme changes:

```css
:root {
    --primary-color: #667eea;      /* Change main accent color */
    --background-color: #f8fafc;   /* Change background */
    --text-color: #334155;         /* Change text color */
}
```

## 📊 Advanced Analytics

### Export Data
Use the browser console to export data:

```javascript
// Export current data as JSON
console.log(JSON.stringify(currentData, null, 2));

// Export specific metrics
console.log('Page views by hour:', currentData.pageViewsByHour);
console.log('Top pages:', currentData.topPages);
```

### Custom Queries
For advanced analysis, you can query your Supabase database directly:

```sql
-- Most active users
SELECT user_id, COUNT(*) as event_count 
FROM analytics_events 
WHERE timestamp > NOW() - INTERVAL '7 days'
GROUP BY user_id 
ORDER BY event_count DESC 
LIMIT 10;

-- Average session duration by page
SELECT 
    page_url,
    AVG((metadata->>'timeSpent')::integer) as avg_time_spent
FROM analytics_events 
WHERE event_type = 'heartbeat'
GROUP BY page_url;
```

## 🔐 Privacy & Security

### Data Privacy
- User IDs are randomly generated, not personally identifiable
- No personal information (names, emails, etc.) is collected
- IP addresses are not stored
- Device info is aggregate-level only

### Security Best Practices
- Keep your Supabase API keys secure
- Use Row Level Security policies in Supabase for access control
- Consider HTTPS for your dashboard in production
- Regularly rotate API keys

## 🚀 Performance Tips

### For High Traffic Sites
- Increase the `timeInterval` in your tracking script to reduce database writes
- Implement data sampling for very high-traffic pages
- Consider aggregating old data into summary tables
- Set up proper database indexes for common queries

### Dashboard Optimization
- Use shorter time ranges for faster loading
- Limit the number of data points in charts (current limit: 1000 events)
- Consider caching dashboard data for multiple viewers
- Implement progressive loading for large datasets

## 📞 Support

For technical issues or questions:

1. **Check the browser console** for error messages
2. **Verify your setup** using the demo page first
3. **Test your database connection** using Supabase dashboard
4. **Review the setup guide** for configuration issues

---

**Related Files:**
- `news-analytics-tracker.js` - The tracking script
- `demo.html` - Test page for tracking
- `SETUP_GUIDE.md` - Initial setup instructions
- `analytics-dashboard.html` - This dashboard

The dashboard provides powerful insights into your website's performance and user behavior. Use it to make data-driven decisions about content, design, and user experience improvements! 