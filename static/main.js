let allJobs = [];

// --- HELPER FUNCTION FOR TOGGLING DETAILS ---
function toggleDetails(button) {
    // The details div is now the next sibling instead of the previous one
    const details = button.nextElementSibling;
    if (details.style.maxHeight) {
        details.style.maxHeight = null;
        button.innerHTML = '<i class="fas fa-chevron-down mr-1"></i> Read More';
    } else {
        details.style.maxHeight = details.scrollHeight + "px";
        button.innerHTML = '<i class="fas fa-chevron-up mr-1"></i> Read Less';
    }
}


async function addJob() {
    const title = document.getElementById('jobTitle').value;
    const description = document.getElementById('jobDesc').value;
    const requirements = document.getElementById('jobReq').value;

    if (!title || !description || !requirements) return;

    const response = await fetch('/jobs', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({title, description, requirements})
    });

    if (response.ok) {
        document.getElementById('jobForm').reset();
        loadJobs();
    } else {
        alert('Error adding job');
    }
}

async function addResume() {
    const name = document.getElementById('resumeName').value;
    const content = document.getElementById('resumeContent').value;

    if (!name || !content) return;

    const response = await fetch('/resumes', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({name, content})
    });

    if (response.ok) {
        document.getElementById('resumeForm').reset();
        loadResumes();
    } else {
        alert('Error adding resume');
    }
}

// --- UPDATED loadJobs for more compact view ---
async function loadJobs() {
    const res = await fetch('/jobs');
    allJobs = await res.json();
    const container = document.getElementById('jobsContainer');
    container.innerHTML = '';
    allJobs.forEach(job => {
        const card = document.createElement('div');
        card.className = 'bg-white shadow p-4 rounded transition-shadow hover:shadow-xl';

        // Only the title is visible initially
        card.innerHTML = `
            <h3 class="font-bold text-lg"><i class="fas fa-briefcase mr-2 text-blue-500"></i>${job.title}</h3>
            
            <!-- Read More Button is now after the title -->
            <button onclick="toggleDetails(this)" class="text-indigo-500 hover:underline text-sm mt-2">
                <i class="fas fa-chevron-down mr-1"></i> Read More
            </button>

            <!-- Hidden container for all details -->
            <div class="details-content mt-2 text-sm text-gray-600">
                <p><b>Description:</b> ${job.description}</p>
                <p class="mt-2"><b>Requirements:</b> ${job.requirements}</p>
            </div>
        `;
        container.appendChild(card);
    });
}

// --- UPDATED loadResumes for more compact view and better results ---
async function loadResumes() {
    const res = await fetch('/resumes');
    const resumes = await res.json();
    const container = document.getElementById('resumesContainer');
    container.innerHTML = '';

    resumes.forEach(resume => {
        const card = document.createElement('div');
        card.className = 'bg-white shadow p-4 rounded transition-shadow hover:shadow-xl';
        
        // Only the name is visible initially
        let cardContent = `
            <h3 class="font-bold text-lg"><i class="fas fa-file-alt mr-2 text-green-500"></i>${resume.name}</h3>
            
            <button onclick="toggleDetails(this)" class="text-indigo-500 hover:underline text-sm my-2">
                <i class="fas fa-chevron-down mr-1"></i> View Resume
            </button>

            <!-- Hidden container for full resume text -->
            <div class="details-content text-sm text-gray-600">
                <p>${resume.content}</p>
            </div>
        `;
        card.innerHTML = cardContent;

        // --- Matcher UI (Dropdown and Button) ---
        const matcherDiv = document.createElement('div');
        matcherDiv.className = 'mt-3 border-t pt-3'; // Add separator

        const select = document.createElement('select');
        select.className = 'border p-2 rounded mb-2 w-full';
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Select a Job to Match';
        select.appendChild(defaultOption);
        allJobs.forEach(job => {
            const option = document.createElement('option');
            option.value = job.id;
            option.textContent = `${job.id}: ${job.title}`;
            select.appendChild(option);
        });

        const btn = document.createElement('button');
        btn.innerText = 'Match Resume';
        btn.className = 'bg-indigo-500 text-white px-3 py-1 rounded hover:bg-indigo-600 w-full';
        btn.disabled = true;

        select.onchange = () => {
            btn.disabled = !select.value;
        };

        // --- UPDATED onclick for detailed result display ---
        btn.onclick = async () => {
            const selectedJobId = parseInt(select.value);
            if (!selectedJobId) return;

            // Find the job title for the results display
            const job = allJobs.find(j => j.id === selectedJobId);
            const jobTitle = job ? job.title : 'Selected Job';

            const originalButtonText = btn.innerText;
            btn.innerText = 'Matching...';
            btn.disabled = true;

            try {
                const response = await fetch('/match', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({job_id: selectedJobId, resume_id: resume.id})
                });
                const match = await response.json();
                
                if (response.ok) {
                    // Create detailed HTML for the results
                    const resultsHTML = `
                        <h3 class="font-semibold text-lg mb-3 border-b pb-2">
                            Matching <strong>${resume.name}</strong> with <strong>${jobTitle}</strong>
                        </h3>
                        <div class="space-y-2">
                           <p><strong>Score:</strong> ${match.match_score || 'N/A'}</p>
                           <p><strong>Strengths:</strong> ${match.strengths || 'N/A'}</p>
                           <p><strong>Gaps:</strong> ${match.gaps || 'N/A'}</p>
                        </div>
                    `;
                    
                    document.getElementById('resultsContent').innerHTML = resultsHTML;
                    document.getElementById('matchResults').classList.remove('hidden');
                } else {
                    alert('Match error: ' + (match.error || 'Unknown'));
                }
            } finally {
                btn.innerText = originalButtonText;
                btn.disabled = !select.value; 
            }
        };
        
        matcherDiv.appendChild(select);
        matcherDiv.appendChild(btn);
        card.appendChild(matcherDiv); // Append the whole matcher UI
        container.appendChild(card);
    });
}

window.onload = () => {
    loadJobs().then(() => {
        loadResumes();
    });
};