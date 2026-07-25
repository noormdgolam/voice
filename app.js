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
            id: 101,
            title: "হাইকোর্টের নির্দেশে দুর্নীতির মামলার পুনস্তদন্ত শুরু করেছে দুদক",
            description: "অবৈধ সম্পদ অর্জন ও পাচারের অভিযোগে গঠিত তদন্ত কমিটিকে চার সপ্তাহের মধ্যে বিবরণী জমা দেওয়ার আদেশ নির্দেশ প্রদান করেছে বিজ্ঞ আদালত।",
            category: "Corruption",
            location: "ঢাকা, বাংলাদেশ",
            upvotes: 2450,
            created_at: new Date().toISOString()
        },
        {
            id: 102,
            title: "নির্বাচন ব্যবস্থার সার্বিক সংস্কার ও ভোটার তালিকা হালনাগাদের ঘোষণা",
            description: "স্বচ্ছতা সুনিশ্চিত করতে সকল আসনে ইলেকট্রনিক ভোটার ভেরিফিকেশন ও বায়োমেট্রিক নজরদারি চালুর দাবি জানিয়েছেন সুশীল সমাজের প্রতিনিধিরা।",
            category: "Electoral Fraud",
            location: "জাতীয়",
            upvotes: 3890,
            created_at: new Date().toISOString()
        },
        {
            id: 103,
            title: "ডিজিটাল নিরাপত্তা আইনের মামলায় গ্রেফতার সাংবাদিকদের মুক্তির দাবী",
            description: "সংবাদপত্রের স্বাধীনতা ও বাকস্বাধীনতা রক্ষার দাবিতে আন্তর্জাতিক মানবাধিকার সংস্থাগুলো যৌথ বিবৃতি প্রদান করেছে।",
            category: "Media Suppression",
            location: "ঢাকা",
            upvotes: 4120,
            created_at: new Date().toISOString()
        },
        {
            id: 104,
            title: "মূল্যস্ফীতি নিয়ন্ত্রণে কেন্দ্রীয় ব্যাংকের নতুন নীতি ঘোষণা",
            description: "নিত্যপ্রয়োজনীয় পণ্যের বাজার স্থিতিশীল রাখতে আমদানি শুল্ক ছাড় ও বাণিজ্যিক ব্যাংকগুলোর জন্য বিশেষ নির্দেশিকা জারি।",
            category: "Economy & Trade",
            location: "চট্টগ্রাম",
            upvotes: 1850,
            created_at: new Date().toISOString()
        },
        {
            id: 1,
            title: "Massive Embezzlement in Mega-Project Funds",
            description: "Investigations reveal that over 40% of the allocated budget for the new transit system has been siphoned off through ghost contractors.",
            category: "Corruption",
            location: "Capital City",
            upvotes: 1405,
            created_at: new Date().toISOString()
        },
        {
            id: 2,
            title: "Student Protesters Detained Without Trial",
            description: "Over 50 university students who participated in peaceful protests have been held without legal representation.",
            category: "Human Rights",
            location: "University Area",
            upvotes: 5210,
            created_at: new Date().toISOString()
        }
    ];



    // Colors mapping for tags (Revolutionary Theme)
    const categoryColors = {
        "Corruption": "#ff0055", // Magenta
        "Electoral Fraud": "#ffaa00", // Warning Orange
        "Human Rights": "#00ffcc", // Neon Cyan
        "Media Suppression": "#bb00ff", // Deep Purple
        "Economy & Trade": "#0099ff", // Electric Blue
        "Law & Crime": "#ff3300", // Bright Red
        "International": "#33cc33" // Global Emerald Green
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
            
            // Preserve exact original publication date and time
            let displayTime = 'Just Now';
            if (issue.created_at) {
                const dateObj = new Date(issue.created_at);
                if (!isNaN(dateObj.getTime())) {
                    displayTime = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' ' + dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                } else {
                    displayTime = issue.created_at;
                }
            }

            // Build dedicated internal detail link URL with query params
            const detailParams = new URLSearchParams({
                id: issue.id || '',
                title: issue.title || '',
                category: issue.category || 'Human Rights',
                location: issue.location || 'National',
                desc: issue.description || '',
                upvotes: issue.upvotes || 0,
                time: displayTime,
                created_at: issue.created_at || new Date().toISOString()
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
                        <span class="time"><i class="fa-solid fa-clock"></i> ${displayTime}</span>
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



