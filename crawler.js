// crawler.js
// Automatic Continuous Crawler for News & Events

const Parser = require('rss-parser');
const parser = new Parser();

// Multi-Source News Feeds Directory (Loaded from news_sources_directory.xlsx)
const RSS_FEEDS = [
    // 1. Prothom Alo (Bangla & English)
    'https://www.prothomalo.com/feed',
    'https://en.prothomalo.com/feed',

    // 2. The Daily Star (English)
    'https://www.thedailystar.net/frontpage/rss.xml',
    'https://news.google.com/rss/search?q=site:thedailystar.net&hl=en-US&gl=US&ceid=US:en',

    // 3. bdnews24.com (Bilingual)
    'https://bdnews24.com/rss.xml',
    'https://bangla.bdnews24.com/rss.xml',

    // 4. Dhaka Tribune (English)
    'https://www.dhakatribune.com/feed',
    'https://news.google.com/rss/search?q=site:dhakatribune.com&hl=en-US&gl=US&ceid=US:en',

    // 5. Bangladesh Pratidin (Highest print-circulated daily)
    'https://news.google.com/rss/search?q=site:bd-pratidin.com&hl=bn&gl=BD&ceid=BD:bn',

    // 6. Kaler Kantho
    'https://news.google.com/rss/search?q=site:kalerkantho.com&hl=bn&gl=BD&ceid=BD:bn',

    // 7. Jugantor
    'https://news.google.com/rss/search?q=site:jugantor.com&hl=bn&gl=BD&ceid=BD:bn',

    // 8. Ittefaq
    'https://news.google.com/rss/search?q=site:ittefaq.com.bd&hl=bn&gl=BD&ceid=BD:bn',

    // 9. Samakal
    'https://news.google.com/rss/search?q=site:samakal.com&hl=bn&gl=BD&ceid=BD:bn',

    // 10. Bangla Tribune
    'https://news.google.com/rss/search?q=site:banglatribune.com&hl=bn&gl=BD&ceid=BD:bn',

    // 11. Jago News 24
    'https://news.google.com/rss/search?q=site:jagonews24.com&hl=bn&gl=BD&ceid=BD:bn',

    // 12. Banglanews24
    'https://news.google.com/rss/search?q=site:banglanews24.com&hl=bn&gl=BD&ceid=BD:bn',

    // 13. Daily Inqilab
    'https://news.google.com/rss/search?q=site:dailyinqilab.com&hl=bn&gl=BD&ceid=BD:bn',

    // 14. Manab Zamin
    'https://news.google.com/rss/search?q=site:mzamin.com&hl=bn&gl=BD&ceid=BD:bn',

    // 15. Naya Diganta
    'https://news.google.com/rss/search?q=site:dailynayadiganta.com&hl=bn&gl=BD&ceid=BD:bn',

    // 16. Amader Shomoy
    'https://news.google.com/rss/search?q=site:dainikamadershomoy.com&hl=bn&gl=BD&ceid=BD:bn',

    // 17. RTV Online
    'https://news.google.com/rss/search?q=site:rtvonline.com&hl=bn&gl=BD&ceid=BD:bn',

    // 18. Somoy News
    'https://news.google.com/rss/search?q=site:somoynews.tv&hl=bn&gl=BD&ceid=BD:bn',

    // 19. New Age
    'https://news.google.com/rss/search?q=site:newagebd.net&hl=en-US&gl=US&ceid=US:en',

    // 20. The Financial Express (BD) - Economy & Business
    'https://news.google.com/rss/search?q=site:thefinancialexpress.com.bd&hl=en-US&gl=US&ceid=US:en',

    // 21. BBC Bangla & Global Outlets
    'https://www.bbc.com/bengali/index.xml',
    'https://feeds.bbci.co.uk/news/world/rss.xml',
    'https://www.aljazeera.com/xml/rss/all.xml'
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

