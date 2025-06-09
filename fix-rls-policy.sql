-- Fix Row Level Security policy to allow dashboard access
-- Run this in your Supabase SQL Editor

-- Drop the existing restrictive SELECT policy
DROP POLICY IF EXISTS analytics_events_select_policy ON analytics_events;

-- Create a new policy that allows anon users to read analytics data
-- This enables dashboards to work while maintaining some security
CREATE POLICY analytics_events_select_policy ON analytics_events
    FOR SELECT 
    USING (
        -- Allow anon users to read analytics data (for dashboards)
        auth.role() = 'anon'
        OR 
        -- Allow authenticated users
        auth.uid() IS NOT NULL 
        OR 
        -- Allow service role (for admin dashboards)
        auth.role() = 'service_role'
    );

-- Alternative: More restrictive policy that only allows reading from specific website_ids
-- Uncomment this and comment the above if you want tighter control
/*
CREATE POLICY analytics_events_select_policy ON analytics_events
    FOR SELECT 
    USING (
        -- Allow anon users to read analytics data for specific websites only
        (auth.role() = 'anon' AND website_id IN ('demo-test-site', 'your-allowed-website-id'))
        OR 
        -- Allow authenticated users (full access)
        auth.uid() IS NOT NULL 
        OR 
        -- Allow service role (admin access)
        auth.role() = 'service_role'
    );
*/ 