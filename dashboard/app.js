// VerdiTech Web Dashboard Script
document.addEventListener("DOMContentLoaded", () => {
    // API Configuration
    const apiInput = document.getElementById("api-url-input");
    const saveApiBtn = document.getElementById("btn-save-api");
    const apiStatus = document.getElementById("api-status");
    const refreshBtn = document.getElementById("btn-refresh");
    const searchInput = document.getElementById("search-input");
    const tableBody = document.getElementById("table-body-content");

    // Stat card nodes
    const totalRespondentsTxt = document.getElementById("total-respondents");
    const studentCountTxt = document.getElementById("student-count");
    const gardenerCountTxt = document.getElementById("gardener-count");

    // Load API URL
    let apiUrl = localStorage.getItem("verditech_api_url") || "";
    apiInput.value = apiUrl;

    // Charts Reference List
    let charts = {};

    // Mock/Sample Demographic Data
    const mockData = [
        { timestamp: "2026-07-08T10:14:02Z", name: "Janil D.", age_range: "18-24", sex: "Female", occupation: "Student", gardening_experience: "Beginner (Under 1 year)", educational_attainment: "High School / SHS" },
        { timestamp: "2026-07-08T11:23:41Z", name: "Marc A.", age_range: "18-24", sex: "Male", occupation: "Student", gardening_experience: "None (Absolute Beginner)", educational_attainment: "College Undergraduate" },
        { timestamp: "2026-07-08T11:45:10Z", name: "Elena G.", age_range: "35-44", sex: "Female", occupation: "Gardening/Agriculture", gardening_experience: "Advanced (3+ years)", educational_attainment: "College Graduate (Bachelor's)" },
        { timestamp: "2026-07-08T12:02:15Z", name: "Carlos M.", age_range: "25-34", sex: "Male", occupation: "Corporate/Office", gardening_experience: "Intermediate (1-3 years)", educational_attainment: "College Graduate (Bachelor's)" },
        { timestamp: "2026-07-08T12:30:00Z", name: "Sophia L.", age_range: "18-24", sex: "Female", occupation: "Student", gardening_experience: "Beginner (Under 1 year)", educational_attainment: "High School / SHS" },
        { timestamp: "2026-07-08T13:12:05Z", name: "Lito S.", age_range: "55+", sex: "Male", occupation: "Retired", gardening_experience: "Advanced (3+ years)", educational_attainment: "Elementary" },
        { timestamp: "2026-07-08T14:24:19Z", name: "Maria C.", age_range: "45-54", sex: "Female", occupation: "Other", gardening_experience: "Intermediate (1-3 years)", educational_attainment: "High School / SHS" },
        { timestamp: "2026-07-08T14:48:50Z", name: "Kevin P.", age_range: "18-24", sex: "Male", occupation: "Student", gardening_experience: "None (Absolute Beginner)", educational_attainment: "High School / SHS" },
        { timestamp: "2026-07-08T15:10:33Z", name: "Juana V.", age_range: "55+", sex: "Female", occupation: "Gardening/Agriculture", gardening_experience: "Advanced (3+ years)", educational_attainment: "High School / SHS" },
        { timestamp: "2026-07-08T15:55:12Z", name: "Arthur K.", age_range: "25-34", sex: "Male", occupation: "Freelancer/Self-employed", gardening_experience: "Beginner (Under 1 year)", educational_attainment: "College Graduate (Bachelor's)" },
        { timestamp: "2026-07-08T16:11:45Z", name: "Jessica R.", age_range: "18-24", sex: "Female", occupation: "Student", gardening_experience: "None (Absolute Beginner)", educational_attainment: "College Undergraduate" },
        { timestamp: "2026-07-08T17:02:11Z", name: "Paul B.", age_range: "35-44", sex: "Male", occupation: "Education/Academic", gardening_experience: "Intermediate (1-3 years)", educational_attainment: "Post-Graduate (Master's/PhD)" }
    ];

    let activeData = [...mockData];

    // Chart Palette (Tailored Greens & Slate)
    const emeraldPalette = {
        primary: '#10B981',
        secondary: '#34D399',
        accent1: '#3B82F6',
        accent2: '#F59E0B',
        accent3: '#EC4899',
        accent4: '#8B5CF6',
        slateLight: '#374151',
        gridLine: 'rgba(255, 255, 255, 0.05)',
        text: '#9CA3AF'
    };

    // Save API Webhook URL
    saveApiBtn.addEventListener("click", () => {
        apiUrl = apiInput.value.trim();
        localStorage.setItem("verditech_api_url", apiUrl);
        loadData();
    });

    // Refresh button click
    refreshBtn.addEventListener("click", () => {
        loadData();
    });

    // Filter table content
    searchInput.addEventListener("input", (e) => {
        const query = e.target.value.toLowerCase();
        const filtered = activeData.filter(row => 
            (row.name && row.name.toLowerCase().includes(query)) ||
            (row.occupation && row.occupation.toLowerCase().includes(query)) ||
            (row.gardening_experience && row.gardening_experience.toLowerCase().includes(query)) ||
            (row.educational_attainment && row.educational_attainment.toLowerCase().includes(query))
        );
        renderTable(filtered);
    });

    // Fetch live data or fallback to mock
    async function loadData() {
        if (!apiUrl) {
            apiStatus.textContent = "Mock Data Mode";
            apiStatus.className = "status-badge status-offline";
            activeData = [...mockData];
            processAndRender(activeData);
            return;
        }

        apiStatus.textContent = "Loading...";
        apiStatus.className = "status-badge status-offline";

        try {
            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error("HTTP error " + response.status);
            const result = await response.json();
            
            if (result.status === "success" && Array.isArray(result.data)) {
                apiStatus.textContent = "Connected Live";
                apiStatus.className = "status-badge status-online";
                
                // Map API keys to local schema
                activeData = result.data.map(item => ({
                    timestamp: item.timestamp || new Date().toISOString(),
                    name: item.name || "Anonymous",
                    age_range: item.age_range || item.agerange || "Unknown",
                    sex: item.sex || "Unknown",
                    occupation: item.occupation || "Unknown",
                    gardening_experience: item.gardening_experience || item.experience || "Unknown",
                    educational_attainment: item.educational_attainment || item.education || "Unknown"
                }));
                
                processAndRender(activeData);
            } else {
                throw new Error("Invalid API response format");
            }
        } catch (e) {
            console.error("Failed to fetch live data:", e);
            apiStatus.textContent = "Fetch Failed (Using Mock)";
            apiStatus.className = "status-badge status-offline";
            activeData = [...mockData];
            processAndRender(activeData);
        }
    }

    // Process variables and trigger renders
    function processAndRender(data) {
        // Compute aggregates
        const total = data.length;
        const students = data.filter(r => r.occupation && r.occupation.toLowerCase().includes("student")).length;
        const experienced = data.filter(r => r.gardening_experience && (
            r.gardening_experience.toLowerCase().includes("intermediate") || 
            r.gardening_experience.toLowerCase().includes("advanced")
        )).length;

        totalRespondentsTxt.textContent = total;
        studentCountTxt.textContent = students;
        gardenerCountTxt.textContent = experienced;

        renderTable(data);
        renderCharts(data);
    }

    // Render Raw Data Table
    function renderTable(data) {
        tableBody.innerHTML = "";
        
        if (data.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted);">No records found</td></tr>`;
            return;
        }

        data.forEach(row => {
            const tr = document.createElement("tr");
            
            // Format timestamp
            let formattedTime = "N/A";
            if (row.timestamp) {
                try {
                    const date = new Date(row.timestamp);
                    formattedTime = date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                } catch (_) {}
            }

            tr.innerHTML = `
                <td>${formattedTime}</td>
                <td>${escapeHtml(row.name)}</td>
                <td>${escapeHtml(row.age_range)}</td>
                <td>${escapeHtml(row.sex)}</td>
                <td>${escapeHtml(row.occupation)}</td>
                <td>${escapeHtml(row.gardening_experience)}</td>
                <td>${escapeHtml(row.educational_attainment)}</td>
            `;
            tableBody.appendChild(tr);
        });
    }

    // Render all charts
    function renderCharts(data) {
        // Destroy existing charts to reload them
        Object.keys(charts).forEach(key => charts[key].destroy());

        // Extract distributions
        const ageDist = getDistribution(data, "age_range");
        const genderDist = getDistribution(data, "sex");
        const occDist = getDistribution(data, "occupation");
        const expDist = getDistribution(data, "gardening_experience");
        const eduDist = getDistribution(data, "educational_attainment");

        // 1. Age Chart (Bar)
        charts.age = new Chart(document.getElementById('ageChart'), {
            type: 'bar',
            data: {
                labels: Object.keys(ageDist),
                datasets: [{
                    label: 'Respondents',
                    data: Object.values(ageDist),
                    backgroundColor: emeraldPalette.primary,
                    borderRadius: 8
                }]
            },
            options: getBarOptions()
        });

        // 2. Gender Chart (Doughnut)
        charts.gender = new Chart(document.getElementById('genderChart'), {
            type: 'doughnut',
            data: {
                labels: Object.keys(genderDist),
                datasets: [{
                    data: Object.values(genderDist),
                    backgroundColor: [emeraldPalette.primary, emeraldPalette.accent1, emeraldPalette.accent2],
                    borderWidth: 0
                }]
            },
            options: getDoughnutOptions()
        });

        // 3. Occupation Chart (Horizontal Bar)
        charts.occupation = new Chart(document.getElementById('occupationChart'), {
            type: 'bar',
            data: {
                labels: Object.keys(occDist),
                datasets: [{
                    label: 'Respondents',
                    data: Object.values(occDist),
                    backgroundColor: emeraldPalette.secondary,
                    borderRadius: 8
                }]
            },
            options: getBarOptions(true) // Horizontal
        });

        // 4. Experience Chart (Doughnut)
        charts.experience = new Chart(document.getElementById('experienceChart'), {
            type: 'doughnut',
            data: {
                labels: Object.keys(expDist),
                datasets: [{
                    data: Object.values(expDist),
                    backgroundColor: [emeraldPalette.primary, emeraldPalette.secondary, emeraldPalette.accent4, emeraldPalette.slateLight],
                    borderWidth: 0
                }]
            },
            options: getDoughnutOptions()
        });

        // 5. Education Chart (Bar)
        charts.education = new Chart(document.getElementById('educationChart'), {
            type: 'bar',
            data: {
                labels: Object.keys(eduDist),
                datasets: [{
                    label: 'Respondents',
                    data: Object.values(eduDist),
                    backgroundColor: emeraldPalette.accent1,
                    borderRadius: 8
                }]
            },
            options: getBarOptions()
        });
    }

    // Helper to calculate distributions
    function getDistribution(data, key) {
        const dist = {};
        data.forEach(item => {
            const val = item[key] || "Unknown";
            dist[val] = (dist[val] || 0) + 1;
        });
        return dist;
    }

    // Base Chart Options
    function getBarOptions(horizontal = false) {
        return {
            indexAxis: horizontal ? 'y' : 'x',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    grid: { color: emeraldPalette.gridLine },
                    ticks: { color: emeraldPalette.text }
                },
                y: {
                    grid: { color: emeraldPalette.gridLine },
                    ticks: { color: emeraldPalette.text, stepSize: 1 }
                }
            }
        };
    }

    function getDoughnutOptions() {
        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: emeraldPalette.text, boxWidth: 12 }
                }
            }
        };
    }

    function escapeHtml(str) {
        if (!str) return "";
        return str.replace(/&/g, "&amp;")
                  .replace(/</g, "&lt;")
                  .replace(/>/g, "&gt;")
                  .replace(/"/g, "&quot;")
                  .replace(/'/g, "&#039;");
    }

    // Run first load
    loadData();
});
