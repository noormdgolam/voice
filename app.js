// app.js
// Frontend logic for Voice - Citizen Reporting Platform

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const issuesContainer = document.getElementById('issues-container');
    const openModalBtn = document.getElementById('open-report-modal');
    const closeModalBtn = document.getElementById('close-modal');
    const reportModal = document.getElementById('report-modal');
    const reportForm = document.getElementById('report-form');

    const mockIssues = [
        {
            id: 1,
            title: "Massive Embezzlement in Mega-Project Funds",
            description: "Investigations reveal that over 40% of the allocated budget for the new transit system has been siphoned off through ghost contractors. The structural integrity of the project is now compromised.",
            category: "Corruption",
            location: "Capital City",
            upvotes: 1405,
            created_at: new Date().toISOString()
        },
        {
            id: 2,
            title: "Midnight Ballot Stuffing Caught on Camera",
            description: "CCTV footage from polling center #42 clearly shows ruling party affiliates stuffing ballot boxes hours before the official voting commenced. The presiding officer was complicit.",
            category: "Electoral Fraud",
            location: "District 9",
            upvotes: 3892,
            created_at: new Date().toISOString()
        },
        {
            id: 3,
            title: "Student Protesters Detained Without Trial",
            description: "Over 50 university students who participated in the peaceful quota reform protests have been held in undisclosed locations for the past 72 hours without legal representation.",
            category: "Human Rights",
            location: "University Campus Area",
            upvotes: 5210,
            created_at: new Date().toISOString()
        },
        {
            id: 4,
            title: "Independent Newspaper Website Blocked Nationally",
            description: "Telecommunication regulators have blacklisted three independent digital investigative news portals without issuing any formal legal notice or court order.",
            category: "Media Suppression",
            location: "National",
            upvotes: 2740,
            created_at: new Date().toISOString()
        },
        {
            id: 5,
            title: "Healthcare Equipment Procurement Price Inflation Scam",
            description: "Hospital ICU ventilators bought at 500% market price markup through non-existent shell companies directly tied to regional health administrators.",
            category: "Corruption",
            location: "Chittagong",
            upvotes: 1980,
            created_at: new Date().toISOString()
        },
        {
            id: 6,
            title: "Voter Roll Tampering Discovered in Municipal Election",
            description: "Over 12,000 legitimate resident voters were erased from local electoral rolls while deceased individuals were registered under active voting IDs.",
            category: "Electoral Fraud",
            location: "Sylhet",
            upvotes: 3110,
            created_at: new Date().toISOString()
        },
        {
            id: 7,
            title: "Police Crackdown on Peaceful Labor Rights March",
            description: "Security forces deployed teargas and rubber bullets against garment factory workers striking for unpaid minimum wage bonuses.",
            category: "Human Rights",
            location: "Gazipur Industrial Zone",
            upvotes: 4520,
            created_at: new Date().toISOString()
        },
        {
            id: 8,
            title: "Investigative Journalist Arrested Under Cyber Security Act",
            description: "Award-winning reporter taken into custody after publishing report exposing illegal sand mining operations controlled by political elites.",
            category: "Media Suppression",
            location: "Rajshahi",
            upvotes: 3870,
            created_at: new Date().toISOString()
        },
        {
            id: 9,
            title: "Bridge Construction Collapses 3 Months After Inauguration",
            description: "Substandard cement and missing steel rebar lead to structural collapse of newly built river bridge, isolating 15 villages.",
            category: "Corruption",
            location: "Barisal",
            upvotes: 2490,
            created_at: new Date().toISOString()
        },
        {
            id: 10,
            title: "Broadband Internet Blackout Imposed During Anti-Government Rally",
            description: "Mobile 4G and home broadband connections throttled to sub-dialup speeds across major urban centers to prevent live streaming of protests.",
            category: "Media Suppression",
            location: "Dhaka Central",
            upvotes: 6100,
            created_at: new Date().toISOString()
        }
    ];


    // Colors mapping for tags (Revolutionary Theme)
    const categoryColors = {
        "Corruption": "#ff0055", // Magenta
        "Electoral Fraud": "#ffaa00", // Warning Orange
        "Human Rights": "#00ffcc", // Neon Cyan
        "Media Suppression": "#bb00ff" // Deep Purple
    };

    // Cache of fetched issues
    let currentFetchedIssues = [];

    // Fetch live issues from API (with fallback to mock data)
    async function loadLiveIssues() {
        try {
            const res = await fetch('/api/issues');
            if (res.ok) {
                const liveData = await res.json();
                if (Array.isArray(liveData) && liveData.length > 0) {
                    // Check if new items arrived
                    const hasNewItems = liveData.length !== currentFetchedIssues.length || 
                                       (liveData[0] && currentFetchedIssues[0] && liveData[0].id !== currentFetchedIssues[0].id);
                    currentFetchedIssues = liveData;
                    renderIssues(liveData);
                    return;
                }
            }
        } catch (e) {
            console.log("Using local mock issues fallback");
        }
        if (currentFetchedIssues.length === 0) {
            currentFetchedIssues = mockIssues;
            renderIssues(mockIssues);
        }
    }


    // Render Issues
    function renderIssues(issuesList = mockIssues) {
        issuesContainer.innerHTML = '';
        if (issuesList.length === 0) {
            issuesContainer.innerHTML = `<div style="text-align: center; padding: 40px; color: #888;">No news or reports found matching your criteria.</div>`;
            return;
        }

        issuesList.forEach((issue, index) => {
            const delay = index * 0.03; // Staggered animation
            
            const card = document.createElement('div');
            card.className = 'issue-card glass-panel';
            card.style.animationDelay = `${delay}s`;
            
            const tagBg = categoryColors[issue.category] || "#00ffcc";
            
            // Build internal detail link URL with query params
            const detailParams = new URLSearchParams({
                title: issue.title || '',
                category: issue.category || 'Human Rights',
                location: issue.location || 'National',
                desc: issue.description || '',
                upvotes: issue.upvotes || 0,
                time: issue.created_at ? new Date(issue.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Live',
                sourceUrl: issue.sourceUrl || ''
            }).toString();

            const detailPageUrl = `detail.html?${detailParams}`;
            const titleHtml = `<a href="${detailPageUrl}" class="issue-title-link">${issue.title}</a>`;

            card.innerHTML = `
                <div class="upvote-col">
                    <button class="upvote-btn" data-id="${issue.id}">
                        <i class="fa-solid fa-chevron-up"></i>
                    </button>
                    <span class="vote-count">${(issue.upvotes || 0).toLocaleString()}</span>
                </div>
                <div class="issue-content">
                    <div class="issue-meta">
                        <span class="tag" style="background: ${tagBg}; box-shadow: 0 0 10px ${tagBg}80;">
                            ${issue.category || "General"}
                        </span>
                        <span class="location"><i class="fa-solid fa-location-dot"></i> ${issue.location || "National"}</span>
                        <span class="time"><i class="fa-solid fa-clock"></i> ${issue.created_at ? new Date(issue.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Live'}</span>
                    </div>
                    <h3 class="issue-title">${titleHtml}</h3>
                    <p class="issue-desc">${issue.description}</p>
                </div>
            `;
            issuesContainer.appendChild(card);
        });


        // Add Upvote Listeners
        document.querySelectorAll('.upvote-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                this.classList.toggle('voted');
                const countSpan = this.nextElementSibling;
                let currentCount = parseInt(countSpan.textContent.replace(/,/g, ''));
                if (this.classList.contains('voted')) {
                    countSpan.textContent = (currentCount + 1).toLocaleString();
                } else {
                    countSpan.textContent = (currentCount - 1).toLocaleString();
                }
            });
        });
    }

    // Live Search Functionality
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            if (!query) {
                renderIssues(currentFetchedIssues);
                return;
            }
            const filtered = currentFetchedIssues.filter(item => 
                (item.title && item.title.toLowerCase().includes(query)) ||
                (item.description && item.description.toLowerCase().includes(query)) ||
                (item.category && item.category.toLowerCase().includes(query)) ||
                (item.location && item.location.toLowerCase().includes(query))
            );
            renderIssues(filtered);
        });
    }

    // Navigation Sidebar & Filter Buttons
    const navFeed = document.getElementById('nav-feed');
    const navTrending = document.getElementById('nav-trending');
    const navCategories = document.getElementById('nav-categories');
    const filterBtns = document.querySelectorAll('.filter-btn');

    if (navTrending) {
        navTrending.addEventListener('click', () => {
            document.querySelectorAll('.nav-links li').forEach(el => el.classList.remove('active'));
            navTrending.classList.add('active');
            const sortedByUpvotes = [...currentFetchedIssues].sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
            renderIssues(sortedByUpvotes);
        });
    }

    if (navCategories) {
        navCategories.addEventListener('click', () => {
            document.querySelectorAll('.nav-links li').forEach(el => el.classList.remove('active'));
            navCategories.classList.add('active');
            // Quick prompt/filter by category
            const categories = ["Corruption", "Electoral Fraud", "Human Rights", "Media Suppression"];
            const selected = categories[Math.floor(Math.random() * categories.length)];
            const filtered = currentFetchedIssues.filter(i => i.category === selected);
            renderIssues(filtered);
        });
    }

    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            if (this.textContent.includes('Most Upvoted')) {
                const sorted = [...currentFetchedIssues].sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
                renderIssues(sorted);
            } else {
                renderIssues(currentFetchedIssues);
            }
        });
    });

    // Modal Logic
    openModalBtn.addEventListener('click', () => {
        reportModal.classList.add('active');
    });

    closeModalBtn.addEventListener('click', () => {
        reportModal.classList.remove('active');
    });

    reportModal.addEventListener('click', (e) => {
        if (e.target === reportModal) {
            reportModal.classList.remove('active');
        }
    });

    reportForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('issue-title').value;
        const catSelect = document.getElementById('issue-category');
        const category = catSelect.options[catSelect.selectedIndex].text;
        const location = document.getElementById('issue-location').value;
        const desc = document.getElementById('issue-desc').value;

        const newIssue = {
            id: 'local-' + Date.now(),
            title: title,
            description: desc,
            category: category,
            location: location,
            upvotes: 1,
            created_at: new Date().toISOString()
        };

        currentFetchedIssues.unshift(newIssue);
        renderIssues(currentFetchedIssues);
        reportModal.classList.remove('active');
        reportForm.reset();
    });

    // Initial Load
    loadLiveIssues();
    // Auto-update UI every 10 seconds to fetch newly crawled news continuously
    setInterval(loadLiveIssues, 10000);
});



