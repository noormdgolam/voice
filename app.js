// app.js
// Frontend logic for Voice - Citizen Reporting Platform

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const issuesContainer = document.getElementById('issues-container');
    const openModalBtn = document.getElementById('open-report-modal');
    const closeModalBtn = document.getElementById('close-modal');
    const reportModal = document.getElementById('report-modal');
    const reportForm = document.getElementById('report-form');

    const mockIssues = [];



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



