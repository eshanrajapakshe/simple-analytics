# 🚀 Quick Deployment Guide

The News Analytics Tracker is now even easier to deploy! All database configuration is centralized in the JavaScript file.

## ⚡ Quick Setup (2 Steps)

### Step 1: Configure Database Credentials
Edit `news-analytics-tracker.js` and update the `DEFAULT_CONFIG` section:

```javascript
// Built-in database configuration - UPDATE THESE WITH YOUR CREDENTIALS
const DEFAULT_CONFIG = {
    supabaseUrl: 'https://your-project.supabase.co',           // ← Your Supabase URL
    supabaseKey: 'your-anon-key-here',                         // ← Your Supabase anon key
    trackingTable: 'analytics_events'
};
```

### Step 2: Add to Your Website
Simply include the script on any page:

```html
<script>
  window.NewsAnalytics = {
    websiteId: "your-website-name",  // Unique identifier for your site
    debug: false                     // Set to true for testing
  };
</script>
<script src="news-analytics-tracker.js"></script>
```

**That's it!** 🎉 No more credential management in HTML files.

## 🎯 Benefits of Centralized Config

✅ **One-time setup** - Configure credentials once in the JS file  
✅ **No credential leaks** - No sensitive data in HTML files  
✅ **Easy deployment** - Just include the script and go  
✅ **Version control friendly** - Credentials stay out of your templates  

## 📝 Configuration Options

You can still customize behavior per page:

```html
<script>
  window.NewsAnalytics = {
    websiteId: "my-news-site",
    debug: true,                    // Enable debug logging
    scrollThreshold: 80,            // "Read" threshold (default: 80%)
    timeInterval: 5000,             // Heartbeat interval (default: 5000ms)
    
    // Optional: Override database config per page (advanced)
    supabaseUrl: "different-database.supabase.co",
    supabaseKey: "different-key"
  };
</script>
```

## 🔄 Migration from Old Setup

If you're updating from the previous version:

1. **Update `news-analytics-tracker.js`** with your credentials in `DEFAULT_CONFIG`
2. **Remove credentials** from all your HTML files
3. **Keep only** `websiteId` and other options in HTML configurations

## 🧪 Testing

Use the provided test pages:

- **`test-page.html`** - Complete article simulation with all tracking features
- **`demo.html`** - Interactive testing with debug panel
- **`analytics-dashboard.html`** - View your collected data

## 🛡️ Security Notes

- **Anon key is safe** to include in client-side code (it's designed for public use)
- **Service role key** should never be in client-side code
- **Row Level Security** in Supabase protects your data
- Consider **domain restrictions** in your Supabase project settings

## 📊 What Gets Tracked

- ✅ Page views and unique visitors
- ✅ Time spent reading
- ✅ Scroll depth and reading completion
- ✅ Link clicks and navigation
- ✅ Custom events (social shares, form submissions, etc.)
- ✅ Device and browser information
- ✅ Failed event recovery

## 🚧 Troubleshooting

**Script not working?**
1. Check browser console for error messages
2. Verify Supabase credentials are correct
3. Ensure your Supabase project allows anon access
4. Check network tab for failed requests

**No data in dashboard?**
1. Run the RLS policy fix from `fix-rls-policy.sql`
2. Verify events are being sent (check browser network tab)
3. Test with `debug: true` to see console logs

## 🔗 Related Files

- `news-analytics-tracker.js` - Main tracking script (configure here)
- `analytics-dashboard.html` - View your data
- `test-page.html` - Test the tracking
- `fix-rls-policy.sql` - Database permissions fix
- `SETUP_GUIDE.md` - Detailed setup instructions
- `DASHBOARD_GUIDE.md` - Dashboard usage guide

---

**Ready to go live?** Just update the credentials in `news-analytics-tracker.js` and include it on your pages! 🎯 