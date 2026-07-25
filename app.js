// app.js
// Frontend logic for Voice - Citizen Reporting Platform

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const issuesContainer = document.getElementById('issues-container');
    const openModalBtn = document.getElementById('open-report-modal');
    const closeModalBtn = document.getElementById('close-modal');
    const reportModal = document.getElementById('report-modal');
    const reportForm = document.getElementById('report-form');

    // Mock Data for Initial UI Render
    const mockIssues = [
        {
            id: 1,
            title: "Massive Embezzlement in Mega-Project Funds",
            description: "Investigations reveal that over 40% of the allocated budget for the new transit system has been siphoned off through ghost contractors. The structural integrity of the project is now compromised.",
            category: "Corruption",
            location: "Capital City",
            upvotes: 1405,
            tagClass: "tag-corruption"
        },
        {
            id: 2,
            title: "Midnight Ballot Stuffing Caught on Camera",
            description: "CCTV footage from polling center #42 clearly shows ruling party affiliates stuffing ballot boxes hours before the official voting commenced. The presiding officer was complicit.",
            category: "Electoral Fraud",
            location: "District 9",
            upvotes: 3892,
            tagClass: "tag-fraud"
        },
        {
            id: 3,
            title: "Student Protesters Detained Without Trial",
            description: "Over 50 university students who participated in the peaceful quota reform protests have been held in undisclosed locations for the past 72 hours without legal representation.",
            category: "Human Rights",
            location: "University Campus Area",
            upvotes: 5210,
            tagClass: "tag-rights"
        }
    ];

    // Colors mapping for tags (Revolutionary Theme)
    const categoryColors = {
        "Corruption": "#ff0055", // Magenta
        "Electoral Fraud": "#ffaa00", // Warning Orange
        "Human Rights": "#00ffcc", // Neon Cyan
        "Media Suppression": "#bb00ff" // Deep Purple
    };

    // Render Issues
    function renderIssues() {
        issuesContainer.innerHTML = '';
        mockIssues.forEach((issue, index) => {
            const delay = index * 0.1; // Staggered animation
            
            const card = document.createElement('div');
            card.className = 'issue-card glass-panel';
            card.style.animationDelay = `${delay}s`;
            
            card.innerHTML = `
                <div class="upvote-col">
                    <button class="upvote-btn" data-id="${issue.id}">
                        <i class="fa-solid fa-chevron-up"></i>
                    </button>
                    <span class="vote-count">${issue.upvotes.toLocaleString()}</span>
                </div>
                <div class="issue-content">
                    <div class="issue-meta">
                        <span class="tag" style="background: ${categoryColors[issue.category]}; box-shadow: 0 0 10px ${categoryColors[issue.category]}80;">
                            ${issue.category}
                        </span>
                        <span class="location"><i class="fa-solid fa-location-dot"></i> ${issue.location}</span>
                        <span class="time"><i class="fa-solid fa-clock"></i> Just now</span>
                    </div>
                    <h3 class="issue-title">${issue.title}</h3>
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

    // Modal Logic
    openModalBtn.addEventListener('click', () => {
        reportModal.classList.add('active');
    });

    closeModalBtn.addEventListener('click', () => {
        reportModal.classList.remove('active');
    });

    // Close modal on outside click
    reportModal.addEventListener('click', (e) => {
        if (e.target === reportModal) {
            reportModal.classList.remove('active');
        }
    });

    // Form Submission
    reportForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // In a real app, this would be an API call to Node.js backend
        const title = document.getElementById('issue-title').value;
        const catSelect = document.getElementById('issue-category');
        const category = catSelect.options[catSelect.selectedIndex].text;
        const location = document.getElementById('issue-location').value;
        const desc = document.getElementById('issue-desc').value;

        const newIssue = {
            id: mockIssues.length + 1,
            title: title,
            description: desc,
            category: category,
            location: location,
            upvotes: 1, // Start with 1 upvote
        };

        mockIssues.unshift(newIssue); // Add to top
        renderIssues(); // Re-render
        
        // Close and reset
        reportModal.classList.remove('active');
        reportForm.reset();
        
        // Show success (simple alert for now, could be a premium toast)
        // alert("Report submitted successfully!");
    });

    // Initial Render
    renderIssues();
});
