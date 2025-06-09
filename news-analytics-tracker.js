/**
 * News Analytics Tracker
 * A vanilla JavaScript tracking script for news publishers
 * Tracks user behavior including page views, article clicks, scroll depth, and time spent
 */

(function() {
    'use strict';
    
    // Configuration object - publishers can override these
    window.NewsAnalytics = window.NewsAnalytics || {};
    
    // Built-in database configuration
    const DEFAULT_CONFIG = {
        supabaseUrl: 'https://dnwlwkmeeetwbvfwnefw.supabase.co',
        supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRud2x3a21lZWV0d2J2ZnduZWZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0MzMyNjUsImV4cCI6MjA2NTAwOTI2NX0.Jijf_cRKBFhCj2AIyMm9q7WGPNqR0hEyIZvxHASrF58',
        trackingTable: 'analytics_events'
    };
    
    const config = {
        supabaseUrl: window.NewsAnalytics.supabaseUrl || DEFAULT_CONFIG.supabaseUrl,
        supabaseKey: window.NewsAnalytics.supabaseKey || DEFAULT_CONFIG.supabaseKey,
        websiteId: window.NewsAnalytics.websiteId || 'default',
        trackingTable: window.NewsAnalytics.trackingTable || DEFAULT_CONFIG.trackingTable,
        debug: window.NewsAnalytics.debug || false,
        scrollThreshold: window.NewsAnalytics.scrollThreshold || 80, // Percentage of page to consider "read"
        timeInterval: window.NewsAnalytics.timeInterval || 5000, // Time tracking interval in ms
        ...window.NewsAnalytics
    };

    // Tracking state
    let sessionId = generateSessionId();
    let userId = getUserId();
    let pageLoadTime = Date.now();
    let lastActiveTime = Date.now();
    let scrollDepth = 0;
    let maxScrollDepth = 0;
    let timeSpent = 0;
    let isPageVisible = true;
    let heartbeatInterval;
    let clickedLinks = new Set();

    // User agent and device info
    const deviceInfo = getDeviceInfo();

    /**
     * Initialize the tracking script
     */
    function init() {
        if (!config.supabaseUrl || !config.supabaseKey) {
            console.warn('News Analytics: Supabase URL and API key are required. Please update DEFAULT_CONFIG in news-analytics-tracker.js');
            return;
        }

        if (config.supabaseUrl.includes('YOUR_SUPABASE') || config.supabaseKey.includes('YOUR_SUPABASE')) {
            console.warn('News Analytics: Please replace placeholder credentials in DEFAULT_CONFIG with your actual Supabase credentials');
            return;
        }

        log('News Analytics Tracker initialized with built-in database configuration');
        
        // Track initial page view
        trackPageView();
        
        // Set up event listeners
        setupEventListeners();
        
        // Start heartbeat for time tracking
        startHeartbeat();
    }

    /**
     * Generate unique session ID
     */
    function generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).slice(2, 11);
    }

    /**
     * Get or generate user ID
     */
    function getUserId() {
        let userId = localStorage.getItem('news_analytics_user_id');
        if (!userId) {
            userId = 'user_' + Date.now() + '_' + Math.random().toString(36).slice(2, 11);
            localStorage.setItem('news_analytics_user_id', userId);
        }
        return userId;
    }

    /**
     * Get device and browser information
     */
    function getDeviceInfo() {
        const ua = navigator.userAgent;
        const screen = window.screen;
        
        return {
            userAgent: ua,
            language: navigator.language,
            platform: navigator.userAgentData?.platform || 'unknown',
            screenResolution: `${screen.width}x${screen.height}`,
            viewportSize: `${window.innerWidth}x${window.innerHeight}`,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            cookieEnabled: navigator.cookieEnabled,
            onLine: navigator.onLine
        };
    }

    /**
     * Set up all event listeners
     */
    function setupEventListeners() {
        // Scroll tracking
        let scrollTimeout;
        window.addEventListener('scroll', function() {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(updateScrollDepth, 100);
        });

        // Click tracking for links
        document.addEventListener('click', function(event) {
            const link = event.target.closest('a');
            if (link && link.href) {
                trackLinkClick(link);
            }
        });

        // Page visibility changes
        document.addEventListener('visibilitychange', function() {
            isPageVisible = !document.hidden;
            if (isPageVisible) {
                lastActiveTime = Date.now();
            }
        });

        // Before page unload
        window.addEventListener('beforeunload', function() {
            trackPageExit();
        });

        // Page focus/blur for more accurate time tracking
        window.addEventListener('focus', function() {
            lastActiveTime = Date.now();
        });

        window.addEventListener('blur', function() {
            // Page lost focus, user might not be actively reading
        });

        // Resize events for responsive tracking
        window.addEventListener('resize', function() {
            deviceInfo.viewportSize = `${window.innerWidth}x${window.innerHeight}`;
        });
    }

    /**
     * Update scroll depth tracking
     */
    function updateScrollDepth() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        
        if (scrollHeight > 0) {
            scrollDepth = Math.round((scrollTop / scrollHeight) * 100);
            maxScrollDepth = Math.max(maxScrollDepth, scrollDepth);
            
            // Track milestone scrolls
            if (scrollDepth >= config.scrollThreshold && maxScrollDepth < config.scrollThreshold) {
                trackEvent('scroll_milestone', {
                    scrollDepth: scrollDepth,
                    milestone: config.scrollThreshold
                });
            }
        }
    }

    /**
     * Start heartbeat for time tracking
     */
    function startHeartbeat() {
        heartbeatInterval = setInterval(function() {
            if (isPageVisible) {
                timeSpent += config.timeInterval;
                trackHeartbeat();
            }
        }, config.timeInterval);
    }

    /**
     * Track page view
     */
    function trackPageView() {
        const data = {
            event_type: 'page_view',
            session_id: sessionId,
            user_id: userId,
            website_id: config.websiteId,
            page_url: window.location.href,
            page_title: document.title,
            referrer: document.referrer,
            timestamp: new Date().toISOString(),
            device_info: deviceInfo,
            metadata: {
                pageLoadTime: pageLoadTime,
                documentReadyState: document.readyState
            }
        };

        sendToSupabase(data);
    }

    /**
     * Track link clicks
     */
    function trackLinkClick(link) {
        const linkId = link.href + '|' + (link.textContent || '').trim();
        
        // Avoid duplicate tracking of the same link in rapid succession
        if (clickedLinks.has(linkId)) {
            return;
        }
        clickedLinks.add(linkId);
        
        // Remove from set after 1 second to allow re-tracking
        setTimeout(() => clickedLinks.delete(linkId), 1000);

        const data = {
            event_type: 'link_click',
            session_id: sessionId,
            user_id: userId,
            website_id: config.websiteId,
            page_url: window.location.href,
            timestamp: new Date().toISOString(),
            metadata: {
                clickedUrl: link.href,
                linkText: (link.textContent || '').trim(),
                linkTarget: link.target || '_self',
                isExternal: link.hostname !== window.location.hostname,
                timeOnPageBeforeClick: Date.now() - pageLoadTime,
                scrollDepthAtClick: scrollDepth
            }
        };

        sendToSupabase(data);
    }

    /**
     * Track heartbeat (time spent)
     */
    function trackHeartbeat() {
        const data = {
            event_type: 'heartbeat',
            session_id: sessionId,
            user_id: userId,
            website_id: config.websiteId,
            page_url: window.location.href,
            timestamp: new Date().toISOString(),
            metadata: {
                timeSpent: timeSpent,
                scrollDepth: scrollDepth,
                maxScrollDepth: maxScrollDepth,
                isVisible: isPageVisible
            }
        };

        sendToSupabase(data);
    }

    /**
     * Track page exit
     */
    function trackPageExit() {
        const data = {
            event_type: 'page_exit',
            session_id: sessionId,
            user_id: userId,
            website_id: config.websiteId,
            page_url: window.location.href,
            timestamp: new Date().toISOString(),
            metadata: {
                totalTimeSpent: timeSpent + (Date.now() - lastActiveTime),
                maxScrollDepth: maxScrollDepth,
                finalScrollDepth: scrollDepth
            }
        };

        // Use sendBeacon for reliable exit tracking
        if (navigator.sendBeacon) {
            const blob = new Blob([JSON.stringify(data)], {type: 'application/json'});
            navigator.sendBeacon(config.supabaseUrl + '/rest/v1/' + config.trackingTable, blob);
        } else {
            sendToSupabase(data, true); // Synchronous fallback
        }
    }

    /**
     * Track custom events
     */
    function trackEvent(eventType, metadata = {}) {
        const data = {
            event_type: eventType,
            session_id: sessionId,
            user_id: userId,
            website_id: config.websiteId,
            page_url: window.location.href,
            timestamp: new Date().toISOString(),
            metadata: {
                ...metadata,
                scrollDepth: scrollDepth,
                timeSpent: timeSpent
            }
        };

        sendToSupabase(data);
    }

    /**
     * Send data to Supabase
     */
    function sendToSupabase(data, synchronous = false) {
        const headers = {
            'Content-Type': 'application/json',
            'apikey': config.supabaseKey,
            'Authorization': `Bearer ${config.supabaseKey}`,
            'Prefer': 'return=minimal'
        };

        const body = JSON.stringify(data);
        const url = `${config.supabaseUrl}/rest/v1/${config.trackingTable}`;

        if (synchronous) {
            // Synchronous request for critical events like page exit
            const xhr = new XMLHttpRequest();
            xhr.open('POST', url, false);
            Object.keys(headers).forEach(key => xhr.setRequestHeader(key, headers[key]));
            xhr.send(body);
        } else {
            // Asynchronous request for normal tracking
            fetch(url, {
                method: 'POST',
                headers: headers,
                body: body,
                keepalive: true
            }).then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                log('Event tracked successfully:', data.event_type);
            }).catch(error => {
                console.error('News Analytics tracking error:', error);
                // Store failed events in localStorage for retry
                storeFailedEvent(data);
            });
        }
    }

    /**
     * Store failed events for retry
     */
    function storeFailedEvent(data) {
        try {
            const failedEvents = JSON.parse(localStorage.getItem('news_analytics_failed_events') || '[]');
            failedEvents.push(data);
            // Keep only the last 50 failed events
            if (failedEvents.length > 50) {
                failedEvents.splice(0, failedEvents.length - 50);
            }
            localStorage.setItem('news_analytics_failed_events', JSON.stringify(failedEvents));
        } catch (e) {
            console.error('Failed to store failed event:', e);
        }
    }

    /**
     * Retry failed events
     */
    function retryFailedEvents() {
        try {
            const failedEvents = JSON.parse(localStorage.getItem('news_analytics_failed_events') || '[]');
            if (failedEvents.length === 0) return;

            failedEvents.forEach(data => {
                sendToSupabase(data);
            });

            localStorage.removeItem('news_analytics_failed_events');
            log('Retried', failedEvents.length, 'failed events');
        } catch (e) {
            console.error('Failed to retry events:', e);
        }
    }

    /**
     * Debug logging
     */
    function log(...args) {
        if (config.debug) {
            console.log('[News Analytics]', ...args);
        }
    }

    /**
     * Public API
     */
    window.NewsAnalytics = {
        ...window.NewsAnalytics,
        track: trackEvent,
        getUserId: () => userId,
        getSessionId: () => sessionId,
        getTimeSpent: () => timeSpent,
        getScrollDepth: () => scrollDepth,
        getMaxScrollDepth: () => maxScrollDepth,
        retryFailedEvents: retryFailedEvents
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Retry failed events on page load
    setTimeout(retryFailedEvents, 2000);

})(); 