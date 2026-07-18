// VerdiTech Web Dashboard Script
document.addEventListener("DOMContentLoaded", () => {
    // API Configuration
    const apiInput = document.getElementById("api-url-input");
    const saveApiBtn = document.getElementById("btn-save-api");
    const apiStatus = document.getElementById("api-status");
    const refreshBtn = document.getElementById("btn-refresh");
    const generatePdfBtn = document.getElementById("btn-generate-pdf");
    const searchInput = document.getElementById("search-input");
    const tableBody = document.getElementById("table-body-content");

    // Stat card nodes
    const totalRespondentsTxt = document.getElementById("total-respondents");
    const studentCountTxt = document.getElementById("student-count");
    const gardenerCountTxt = document.getElementById("gardener-count");

    // Load API URL
    let apiUrl = localStorage.getItem("verditech_api_url") || "https://script.google.com/macros/s/AKfycbyEgBfDQ2Gxjl05vmfpXtHbNvLNU2cg5gNE5lmQhl8CsLYDGcLJ08Qlo65-UrjabHeD/exec";
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

    // Chart Palette (Tailored Greens & Slate for Light Theme)
    const emeraldPalette = {
        primary: '#10B981',
        secondary: '#34D399',
        accent1: '#3B82F6',
        accent2: '#F59E0B',
        accent3: '#EC4899',
        accent4: '#8B5CF6',
        slateLight: '#374151',
        gridLine: '#E5E7EB',
        text: '#374151'
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

    // PDF Generation
    if (generatePdfBtn) {
        generatePdfBtn.addEventListener("click", () => {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            // --- Helper: Draw Native Bar Chart ---
            const drawNativeBarChart = (doc, title, dataDict, x, y, primaryColor) => {
                doc.setFontSize(12);
                doc.setTextColor(30, 30, 30);
                doc.text(title, x, y);
                
                const entries = Object.entries(dataDict);
                if (entries.length === 0) return 10;
                
                const maxVal = Math.max(...entries.map(e => e[1])) || 1;
                const maxBarWidth = 35;
                const barHeight = 6;
                const gap = 4;
                let currentY = y + 8;
                
                doc.setFontSize(9);
                entries.forEach(([label, value]) => {
                    doc.setTextColor(80, 80, 80);
                    // Truncate long labels to fit left column
                    const shortLabel = label.length > 26 ? label.substring(0, 24) + "..." : label;
                    doc.text(shortLabel, x, currentY + 4);
                    
                    const barWidth = (value / maxVal) * maxBarWidth;
                    doc.setFillColor(...primaryColor);
                    doc.rect(x + 48, currentY, barWidth, barHeight, 'F');
                    
                    doc.setTextColor(30, 30, 30);
                    doc.text(String(value), x + 48 + barWidth + 2, currentY + 4);
                    
                    currentY += barHeight + gap;
                });
                return currentY - y;
            };
            
            // Add Title
            doc.setFontSize(22);
            doc.setTextColor(16, 185, 129); // VerdiTech Green
            doc.text("VerdiTech Research Summary", 14, 22);
            
            // Add Date
            doc.setFontSize(10);
            doc.setTextColor(120, 120, 120);
            doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);
            
            // Compute distributions
            const ageDist = getDistribution(activeData, "age_range");
            const genderDist = getDistribution(activeData, "sex");
            const occDist = getDistribution(activeData, "occupation");
            const expDist = getDistribution(activeData, "gardening_experience");
            const eduDist = getDistribution(activeData, "educational_attainment");

            // --- Draw Stat Cards ---
            let cardY = 35;
            
            // Card 1: Total
            doc.setFillColor(16, 185, 129); // Green
            doc.roundedRect(14, cardY, 55, 25, 3, 3, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(10);
            doc.text("Total Respondents", 18, cardY + 8);
            doc.setFontSize(16);
            doc.text(String(activeData.length), 18, cardY + 18);
            
            // Card 2: Students
            doc.setFillColor(59, 130, 246); // Blue
            doc.roundedRect(74, cardY, 55, 25, 3, 3, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(10);
            doc.text("Total Students", 78, cardY + 8);
            doc.setFontSize(16);
            doc.text(String(studentCountTxt.textContent), 78, cardY + 18);
            
            // Card 3: Experienced
            doc.setFillColor(245, 158, 11); // Yellow
            doc.roundedRect(134, cardY, 65, 25, 3, 3, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(10);
            doc.text("Experienced Gardeners", 138, cardY + 8);
            doc.setFontSize(16);
            doc.text(String(gardenerCountTxt.textContent), 138, cardY + 18);
            
            // --- Draw Native Charts ---
            let chartsY = cardY + 35;
            
            // Row 1
            let height1 = drawNativeBarChart(doc, "Age Distribution", ageDist, 14, chartsY, [16, 185, 129]);
            let height2 = drawNativeBarChart(doc, "Gender Distribution", genderDist, 115, chartsY, [236, 72, 153]);
            
            let nextY = chartsY + Math.max(height1, height2) + 10;
            
            // Row 2
            height1 = drawNativeBarChart(doc, "Occupation", occDist, 14, nextY, [59, 130, 246]);
            height2 = drawNativeBarChart(doc, "Gardening Experience", expDist, 115, nextY, [245, 158, 11]);
            
            nextY += Math.max(height1, height2) + 10;
            
            // Row 3
            let finalChartHeight = drawNativeBarChart(doc, "Educational Attainment", eduDist, 14, nextY, [139, 92, 246]);
            
            let tableStartY = nextY + finalChartHeight + 15;
            
            // Check if table fits on page, else autoTable will handle new page, but we must set startY correctly
            if (tableStartY > 260) {
                doc.addPage();
                tableStartY = 20;
            }
            
            // Add Table
            const tableData = activeData.map(row => [
                row.timestamp ? new Date(row.timestamp).toLocaleDateString() : "N/A",
                row.name || "Anonymous",
                row.age_range || "Unknown",
                row.sex || "Unknown",
                row.occupation || "Unknown",
                row.gardening_experience || "Unknown"
            ]);
            
            doc.autoTable({
                startY: tableStartY,
                head: [['Date', 'Name', 'Age', 'Sex', 'Occupation', 'Experience']],
                body: tableData,
                styles: { fontSize: 9 },
                headStyles: { fillColor: [16, 185, 129] }
            });
            
            doc.save("VerdiTech_Report.pdf");
        });
    }

    // Run first load
    loadData();
});
