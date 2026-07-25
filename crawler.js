// crawler.js
// Automatic Continuous Crawler for News & Events

const Parser = require('rss-parser');
const parser = new Parser();

// Authentic Verified RSS News Feeds (BBC, Reuters, Al Jazeera, Daily Star, etc.)
const RSS_FEEDS = [
    'https://feeds.bbci.co.uk/news/world/asia/rss.xml',
    'https://www.aljazeera.com/xml/rss/all.xml',
    'https://www.thedailystar.net/news/bangladesh/rss.xml',
    'https://news.google.com/rss/search?q=bangladesh+protest+corruption+rights&hl=en-US&gl=US&ceid=US:en'
];



// In-memory cache of crawled issues (used when DB connection is not configured yet)
let crawledIssues = [
    {
        id: "crawl-1",
        title: "Anti-Corruption Commission Investigates High-Level Money Laundering",
        description: "Official inquiries opened into multiple offshore bank accounts linked to high-profile infrastructure projects.",
        category: "Corruption",
        location: "Dhaka",
        upvotes: 412,
        created_at: new Date().toISOString()
    },
    {
        id: "crawl-2",
        title: "Electoral Reform Advocates Demand Independent Election Commission",
        description: "Civil society groups submit formal demands for complete oversight and biometric polling transparency in upcoming elections.",
        category: "Electoral Fraud",
        location: "National",
        upvotes: 890,
        created_at: new Date().toISOString()
    }
];

// Categorization helper based on keywords
function categorizeArticle(title = '', snippet = '') {
    const text = (title + ' ' + snippet).toLowerCase();
    
    if (text.includes('corruption') || text.includes('bribe') || text.includes('embezzl') || text.includes('fund') || text.includes('money')) {
        return "Corruption";
    }
    if (text.includes('election') || text.includes('vote') || text.includes('ballot') || text.includes('fraud') || text.includes('poll')) {
        return "Electoral Fraud";
    }
    if (text.includes('protest') || text.includes('rights') || text.includes('police') || text.includes('detain') || text.includes('arrest') || text.includes('student')) {
        return "Human Rights";
    }
    if (text.includes('media') || text.includes('press') || text.includes('censor') || text.includes('journal') || text.includes('ban')) {
        return "Media Suppression";
    }
    return "Human Rights"; // Default fallthrough category
}

// Perform a single crawl cycle
async function fetchNews() {
    console.log(`[Crawler] Starting news feed crawl at ${new Date().toLocaleTimeString()}...`);
    let newItemsFound = 0;

    for (const feedUrl of RSS_FEEDS) {
        try {
            const feed = await parser.parseURL(feedUrl);
            for (const item of feed.items) {
                // Check if already exists in cache
                const exists = crawledIssues.some(existing => existing.title === item.title);
                if (!exists) {
                    const category = categorizeArticle(item.title, item.contentSnippet);
                    
                    // Extract publisher domain for authenticity badge
                    let publisher = "Verified News";
                    if (item.link) {
                        try {
                            const urlObj = new URL(item.link);
                            publisher = urlObj.hostname.replace('www.', '').replace('feeds.', '');
                        } catch (e) {}
                    }

                    const newIssue = {
                        id: `crawl-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                        title: item.title,
                        description: item.contentSnippet || item.title,
                        category: category,
                        location: `Verified by ${publisher}`,
                        upvotes: Math.floor(Math.random() * 50) + 10,
                        created_at: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
                        sourceUrl: item.link,
                        publisher: publisher
                    };
                    crawledIssues.unshift(newIssue);
                    newItemsFound++;
                }

            }
        } catch (err) {
            console.error(`[Crawler Error] Failed to parse feed ${feedUrl}:`, err.message);
        }
    }

    // Keep cache at a maximum size of 50 items
    if (crawledIssues.length > 50) {
        crawledIssues = crawledIssues.slice(0, 50);
    }

    console.log(`[Crawler] Crawl complete. Added ${newItemsFound} new articles. Total stored: ${crawledIssues.length}`);
    return crawledIssues;
}

// Start continuous background crawling (default 2 minutes)
function startAutoCrawler(intervalMinutes = 2) {
    // Initial fetch
    fetchNews();

    // Set recurring timer
    const intervalMs = intervalMinutes * 60 * 1000;
    setInterval(() => {
        fetchNews();
    }, intervalMs);
    console.log(`[Crawler] Continuous background crawler active (Runs every ${intervalMinutes} mins).`);
}


function getCrawledIssues() {
    return crawledIssues;
}

module.exports = {
    startAutoCrawler,
    fetchNews,
    getCrawledIssues
};
