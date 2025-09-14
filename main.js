let allJobs = [];

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

async function loadJobs() {
    const res = await fetch('/jobs');
    allJobs = await res.json();
    const container = document.getElementById('jobsContainer');
    container.innerHTML = '';
    allJobs.forEach(job => {
        const card = document.createElement('div');
        // ADDED: Hover effects and transition
        card.className = 'bg-white shadow p-4 rounded transition-shadow hover:shadow-xl';
        // ADDED: Icon to the title
        card.innerHTML = `<h3 class="font-bold text-lg"><i class="fas fa-briefcase mr-2 text-blue-500"></i>${job.title}</h3>
                          <p class="mt-2 text-gray-700">${job.description}</p>
                          <p class="mt-2 text-sm text-gray-600"><b>Requirements:</b> ${job.requirements}</p>`;
        container.appendChild(card);
    });
}

async function loadResumes() {
    const res = await fetch('/resumes');
    const resumes = await res.json();
    const container = document.getElementById('resumesContainer');
    container.innerHTML = '';

    resumes.forEach(resume => {
        const card = document.createElement('div');
        // ADDED: Hover effects and transition
        card.className = 'bg-white shadow p-4 rounded transition-shadow hover:shadow-xl';

        // Job select dropdown
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

        // Match button
        const btn = document.createElement('button');
        btn.innerText = 'Match Resume';
        btn.className = 'bg-indigo-500 text-white px-3 py-1 rounded hover:bg-indigo-600 w-full'; // Made button full-width
        btn.disabled = true;

        // Enable button on selection
        select.onchange = () => {
            btn.disabled = !select.value;
        };

        // --- UPDATED: Match function with Loading State ---
        btn.onclick = async () => {
            if (!select.value) return;

            const originalButtonText = btn.innerText;
            btn.innerText = 'Matching...';
            btn.disabled = true;

            try {
                const response = await fetch('/match', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({job_id: parseInt(select.value), resume_id: resume.id})
                });
                const match = await response.json();
                
                if (response.ok) {
                    const resultsHTML = `<strong>Score:</strong> ${match.match_score || 'N/A'}<br>
                                         <strong>Strengths:</strong> ${match.strengths || 'N/A'}<br>
                                         <strong>Gaps:</strong> ${match.gaps || 'N/A'}`;
                    
                    document.getElementById('resultsContent').innerHTML = resultsHTML;
                    document.getElementById('matchResults').classList.remove('hidden');
                } else {
                    alert('Match error: ' + (match.error || 'Unknown'));
                }
            } finally {
                // This block runs whether the request succeeds or fails
                btn.innerText = originalButtonText;
                // Re-enable the button if a job is still selected
                btn.disabled = !select.value; 
            }
        };

        // ADDED: Icon to the title
        card.innerHTML = `<h3 class="font-bold text-lg"><i class="fas fa-file-alt mr-2 text-green-500"></i>${resume.name}</h3>
                          <p class="text-sm text-gray-600 my-2">${resume.content.substring(0, 150)}...</p>`;
        card.appendChild(select);
        card.appendChild(btn);
        container.appendChild(card);
    });
}

window.onload = () => {
    loadJobs();
    loadResumes();
};
