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
        card.className = 'bg-white shadow p-4 rounded';
        card.innerHTML = `<h3 class="font-bold">${job.title}</h3>
                          <p>${job.description}</p>
                          <p class="text-gray-600">Requirements: ${job.requirements}</p>`;
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
        card.className = 'bg-white shadow p-4 rounded';

        // Job select dropdown
        const select = document.createElement('select');
        select.className = 'border p-2 rounded mb-2 w-full';
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Select a Job';
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
        btn.className = 'bg-indigo-500 text-white px-3 py-1 rounded hover:bg-indigo-600';
        btn.disabled = true; // Enable only if job selected

        // Enable button on selection
        select.onchange = () => {
            btn.disabled = !select.value;
        };

        // Match function
        btn.onclick = async () => {
            if (!select.value) return;
            const response = await fetch('/match', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({job_id: parseInt(select.value), resume_id: resume.id})
            });
            const match = await response.json();
            
            if (response.ok) {
                // Define the HTML content for the results
                const resultsHTML = `<strong>Score:</strong> ${match.match_score || 'N/A'}<br>
                                     <strong>Strengths:</strong> ${match.strengths || 'N/A'}<br>
                                     <strong>Gaps:</strong> ${match.gaps || 'N/A'}`;
                
                // Show results ONLY in the global results section at the bottom
                document.getElementById('resultsContent').innerHTML = resultsHTML;
                document.getElementById('matchResults').classList.remove('hidden');
            } else {
                alert('Match error: ' + (match.error || 'Unknown'));
            }
        };

        card.innerHTML = `<h3 class="font-bold">${resume.name}</h3>
                          <p class="text-sm text-gray-600">${resume.content.substring(0, 150)}...</p>`;
        card.appendChild(select);
        card.appendChild(btn);
        // The individual result box is no longer appended to the card
        container.appendChild(card);
    });
}

window.onload = () => {
    loadJobs();
    loadResumes();
};