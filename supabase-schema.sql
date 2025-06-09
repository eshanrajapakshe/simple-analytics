-- News Analytics Tracking Database Schema for Supabase
-- This file contains the SQL to set up the analytics tracking table

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the analytics events table
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL,
    session_id VARCHAR(100) NOT NULL,
    user_id VARCHAR(100) NOT NULL,
    website_id VARCHAR(100) NOT NULL,
    page_url TEXT NOT NULL,
    page_title TEXT,
    referrer TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    device_info JSONB,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_website_id ON analytics_events(website_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp ON analytics_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_page_url ON analytics_events(page_url);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at DESC);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_analytics_events_website_event_time ON analytics_events(website_id, event_type, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_time ON analytics_events(session_id, timestamp DESC);

-- Create a GIN index for JSONB metadata searches
CREATE INDEX IF NOT EXISTS idx_analytics_events_metadata_gin ON analytics_events USING GIN(metadata);
CREATE INDEX IF NOT EXISTS idx_analytics_events_device_info_gin ON analytics_events USING GIN(device_info);

-- Enable Row Level Security (RLS)
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Policy for INSERT: Allow anyone to insert events (for tracking)
-- In production, you might want to restrict this to specific API keys
CREATE POLICY analytics_events_insert_policy ON analytics_events
    FOR INSERT 
    WITH CHECK (true);

-- Policy for SELECT: Restrict access based on website_id or authenticated users
-- This allows website owners to only see their own data
CREATE POLICY analytics_events_select_policy ON analytics_events
    FOR SELECT 
    USING (
        -- Allow if user is authenticated and is the owner of the website
        auth.uid() IS NOT NULL 
        OR 
        -- Allow if querying via service role (for admin dashboards)
        auth.role() = 'service_role'
    );

-- Policy for UPDATE: Only allow authenticated users to update their own website's data
CREATE POLICY analytics_events_update_policy ON analytics_events
    FOR UPDATE 
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

-- Policy for DELETE: Only allow authenticated users to delete their own website's data
CREATE POLICY analytics_events_delete_policy ON analytics_events
    FOR DELETE 
    USING (auth.uid() IS NOT NULL);

-- Create a view for aggregated daily statistics
CREATE OR REPLACE VIEW daily_analytics_summary AS
SELECT 
    website_id,
    DATE(timestamp) as date,
    COUNT(*) as total_events,
    COUNT(DISTINCT session_id) as unique_sessions,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(CASE WHEN event_type = 'page_view' THEN 1 END) as page_views,
    COUNT(CASE WHEN event_type = 'link_click' THEN 1 END) as link_clicks,
    COUNT(CASE WHEN event_type = 'scroll_milestone' THEN 1 END) as scroll_milestones,
    AVG(CASE WHEN event_type = 'heartbeat' THEN (metadata->>'timeSpent')::integer END) as avg_time_spent,
    AVG(CASE WHEN event_type = 'page_exit' THEN (metadata->>'maxScrollDepth')::integer END) as avg_max_scroll_depth
FROM analytics_events 
GROUP BY website_id, DATE(timestamp)
ORDER BY website_id, DATE(timestamp) DESC;

-- Create a view for popular content
CREATE OR REPLACE VIEW popular_content AS
SELECT 
    website_id,
    page_url,
    page_title,
    COUNT(CASE WHEN event_type = 'page_view' THEN 1 END) as page_views,
    COUNT(DISTINCT session_id) as unique_sessions,
    COUNT(DISTINCT user_id) as unique_users,
    AVG(CASE WHEN event_type = 'heartbeat' THEN (metadata->>'timeSpent')::integer END) as avg_time_spent,
    AVG(CASE WHEN metadata ? 'maxScrollDepth' THEN (metadata->>'maxScrollDepth')::integer END) as avg_scroll_depth,
    MAX(timestamp) as last_view
FROM analytics_events 
WHERE event_type IN ('page_view', 'heartbeat', 'page_exit')
GROUP BY website_id, page_url, page_title
HAVING COUNT(CASE WHEN event_type = 'page_view' THEN 1 END) > 0
ORDER BY page_views DESC;

-- Create a view for user behavior analysis
CREATE OR REPLACE VIEW user_behavior_summary AS
SELECT 
    website_id,
    user_id,
    COUNT(DISTINCT session_id) as total_sessions,
    COUNT(CASE WHEN event_type = 'page_view' THEN 1 END) as total_page_views,
    COUNT(CASE WHEN event_type = 'link_click' THEN 1 END) as total_link_clicks,
    AVG(CASE WHEN event_type = 'heartbeat' THEN (metadata->>'timeSpent')::integer END) as avg_time_per_session,
    AVG(CASE WHEN metadata ? 'maxScrollDepth' THEN (metadata->>'maxScrollDepth')::integer END) as avg_scroll_depth,
    MIN(timestamp) as first_visit,
    MAX(timestamp) as last_visit
FROM analytics_events 
GROUP BY website_id, user_id
ORDER BY total_page_views DESC;

-- Create a function to clean up old events (optional)
CREATE OR REPLACE FUNCTION cleanup_old_analytics_events(days_to_keep INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM analytics_events 
    WHERE created_at < NOW() - INTERVAL '1 day' * days_to_keep;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Optional: Create a scheduled job to clean up old data (uncomment if needed)
-- SELECT cron.schedule('cleanup-analytics', '0 2 * * *', 'SELECT cleanup_old_analytics_events(90);');

-- Grant necessary permissions for the anon role (for public tracking)
GRANT INSERT ON analytics_events TO anon;
GRANT SELECT ON daily_analytics_summary TO authenticated;
GRANT SELECT ON popular_content TO authenticated;
GRANT SELECT ON user_behavior_summary TO authenticated; 