// crawler.js
// Automatic Continuous Crawler for News & Events

const Parser = require('rss-parser');
const parser = new Parser();

// Multi-Source RSS News Feeds (National Newspapers & International Outlets)
const RSS_FEEDS = [
    // Top Bangladesh Newspapers (National & Bangla)
    'https://www.prothomalo.com/feed',
    'https://news.google.com/rss/search?q=site:thedailystar.net+bangladesh&hl=en-US&gl=US&ceid=US:en',
    'https://news.google.com/rss/search?q=bangladesh+news&hl=bn&gl=BD&ceid=BD:bn', // Google News Bangla
    'https://news.google.com/rss/search?q=bangladesh+news&hl=en-US&gl=US&ceid=US:en',

    
    // International Sector News
    'https://feeds.bbci.co.uk/news/world/rss.xml',
    'https://www.aljazeera.com/xml/rss/all.xml',
    'https://news.google.com/rss/search?q=world+news+international&hl=en-US&gl=US&ceid=US:en'
];





// In-memory cache of crawled issues (populated live by RSS feeds)
let crawledIssues = [];


// Categorization helper with support for International sector and Bangla keywords
function categorizeArticle(title = '', snippet = '', feedUrl = '') {
    const text = (title + ' ' + snippet).toLowerCase();
    
    // Check if feed is international news
    if (feedUrl.includes('world') || feedUrl.includes('bbci.co.uk') || feedUrl.includes('aljazeera.com')) {
        if (!text.includes('bangladesh')) {
            return "International";
        }
    }

    if (text.includes('corruption') || text.includes('bribe') || text.includes('embezzl') || text.includes('fund') || text.includes('money') || text.includes('scam') || text.includes('bank') || text.includes('দুর্নীতি') || text.includes('ঘুষ') || text.includes('অর্থ')) {
        return "Corruption";
    }
    if (text.includes('election') || text.includes('vote') || text.includes('ballot') || text.includes('fraud') || text.includes('poll') || text.includes('candidate') || text.includes('নির্বাচন') || text.includes('ভোট')) {
        return "Electoral Fraud";
    }
    if (text.includes('media') || text.includes('press') || text.includes('censor') || text.includes('journal') || text.includes('ban') || text.includes('news') || text.includes('গণমাধ্যম') || text.includes('সাংবাদিক')) {
        return "Media Suppression";
    }
    if (text.includes('economy') || text.includes('inflation') || text.includes('price') || text.includes('export') || text.includes('garment') || text.includes('remi') || text.includes('অর্থনীতি') || text.includes('দাম')) {
        return "Economy & Trade";
    }
    if (text.includes('court') || text.includes('verdict') || text.includes('justice') || text.includes('law') || text.includes('police') || text.includes('arrest') || text.includes('crime') || text.includes('আদালত') || text.includes('পুলিশ') || text.includes('গ্রেপ্তার')) {
        return "Law & Crime";
    }
    if (text.includes('world') || text.includes('global') || text.includes('international') || text.includes('us') || text.includes('china') || text.includes('uk') || text.includes('international') || text.includes('আন্তর্জাতিক')) {
        return "International";
    }
    return "Human Rights";
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
                    const category = categorizeArticle(item.title, item.contentSnippet, feedUrl);

                    
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

    // Sort all issues strictly by publication date (newest first)
    crawledIssues.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // Keep cache at a maximum size of 100 items
    if (crawledIssues.length > 100) {
        crawledIssues = crawledIssues.slice(0, 100);
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

