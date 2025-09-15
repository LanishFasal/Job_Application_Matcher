let allJobs = [];
let allResumes = []; // Store resumes globally as well

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
        loadJobs().then(loadResumes); // Reload everything
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
        loadResumes(); // Just reload resumes
    } else {
        alert('Error adding resume');
    }
}

// --- REWRITTEN loadJobs to populate a dropdown ---
async function loadJobs() {
    const res = await fetch('/jobs');
    allJobs = await res.json();
    const dropdown = document.getElementById('jobsDropdown');
    const detailsContainer = document.getElementById('jobDetailsContainer');
    dropdown.innerHTML = '<option value="">-- Select a Job to View Details --</option>'; // Default option
    
    allJobs.forEach(job => {
        const option = document.createElement('option');
        option.value = job.id;
        option.textContent = job.title;
        dropdown.appendChild(option);
    });

    // Event listener to show details when a job is selected
    dropdown.onchange = () => {
        const selectedId = parseInt(dropdown.value);
        if (!selectedId) {
            detailsContainer.innerHTML = ''; // Clear details if default is selected
            return;
        }
        const job = allJobs.find(j => j.id === selectedId);
        if (job) {
            detailsContainer.innerHTML = `
                <h3 class="font-bold text-lg">${job.title}</h3>
                <p class="mt-2 text-gray-700"><strong>Description:</strong> ${job.description}</p>
                <p class="mt-2 text-sm text-gray-600"><strong>Requirements:</strong> ${job.requirements}</p>
            `;
        }
    };
    detailsContainer.innerHTML = ''; // Clear details on load
}

// --- REWRITTEN loadResumes to populate a dropdown and show matcher ---
async function loadResumes() {
    const res = await fetch('/resumes');
    allResumes = await res.json();
    const dropdown = document.getElementById('resumesDropdown');
    const detailsContainer = document.getElementById('resumeDetailsContainer');
    dropdown.innerHTML = '<option value="">-- Select a Resume to View & Match --</option>'; // Default option

    allResumes.forEach(resume => {
        const option = document.createElement('option');
        option.value = resume.id;
        option.textContent = resume.name;
        dropdown.appendChild(option);
    });

    // Event listener to show details and matcher UI
    dropdown.onchange = () => {
        const selectedId = parseInt(dropdown.value);
        if (!selectedId) {
            detailsContainer.innerHTML = ''; // Clear details
            return;
        }
        const resume = allResumes.find(r => r.id === selectedId);
        if (resume) {
            // Build the matcher UI dynamically
            let matcherHTML = `
                <h3 class="font-bold text-lg">${resume.name}</h3>
                <p class="text-sm text-gray-600 my-2">${resume.content}</p>
                <div class="mt-4 border-t pt-4">
                    <select id="matcherJobSelect_${resume.id}" class="w-full p-2 border rounded mb-2">
                        <option value="">Select a Job to Match</option>
            `;
            allJobs.forEach(job => {
                matcherHTML += `<option value="${job.id}">${job.title}</option>`;
            });
            matcherHTML += `
                    </select>
                    <button id="matcherBtn_${resume.id}" class="bg-indigo-500 text-white w-full px-3 py-1 rounded hover:bg-indigo-600" disabled>
                        Match Resume
                    </button>
                </div>
            `;
            detailsContainer.innerHTML = matcherHTML;

            // Add event listeners to the newly created elements
            const jobSelect = document.getElementById(`matcherJobSelect_${resume.id}`);
            const matchBtn = document.getElementById(`matcherBtn_${resume.id}`);

            jobSelect.onchange = () => {
                matchBtn.disabled = !jobSelect.value;
            };

            matchBtn.onclick = async () => {
                const jobId = parseInt(jobSelect.value);
                if (!jobId) return;

                const job = allJobs.find(j => j.id === jobId);
                const originalButtonText = matchBtn.innerText;
                matchBtn.innerText = 'Matching...';
                matchBtn.disabled = true;

                try {
                    const response = await fetch('/match', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({job_id: jobId, resume_id: resume.id})
                    });
                    const match = await response.json();
                    if (response.ok) {
                        document.getElementById('resultsContent').innerHTML = `
                            <h3 class="font-semibold text-lg mb-3 border-b pb-2">
                                Matching <strong>${resume.name}</strong> with <strong>${job.title}</strong>
                            </h3>
                            <div class="space-y-2">
                               <p><strong>Score:</strong> ${match.match_score || 'N/A'}</p>
                               <p><strong>Strengths:</strong> ${match.strengths || 'N/A'}</p>
                               <p><strong>Gaps:</strong> ${match.gaps || 'N/A'}</p>
                            </div>
                        `;
                        document.getElementById('matchResults').classList.remove('hidden');
                    } else {
                        alert('Match error: ' + (match.error || 'Unknown'));
                    }
                } finally {
                    matchBtn.innerText = originalButtonText;
                    matchBtn.disabled = !jobSelect.value;
                }
            };
        }
    };
    detailsContainer.innerHTML = ''; // Clear details on load
}

// --- UPDATED window.onload to chain loading ---
window.onload = () => {
    // Load jobs first, and once they are loaded, load the resumes.
    // This ensures the "Select a Job" dropdown is always populated correctly.
    loadJobs().then(() => {
        loadResumes();
    });
};
