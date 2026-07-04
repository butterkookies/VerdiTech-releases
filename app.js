document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('releases-container');

    // Fetch releases data
    fetch('releases.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(releases => {
            container.innerHTML = ''; // Clear loader
            
            if (releases.length === 0) {
                container.innerHTML = '<p>No releases found yet.</p>';
                return;
            }

            releases.forEach(release => {
                const card = document.createElement('article');
                card.className = 'release-card';
                
                // Construct release notes HTML
                const notesHtml = release.notes.map(note => `<li>${note}</li>`).join('');
                


                card.innerHTML = `
                    <div class="release-header">
                        <h2 class="release-title">Version ${release.version}</h2>
                        <span class="release-date">Released on ${release.date}</span>
                    </div>
                    <div class="release-notes">
                        <h3>Release Notes</h3>
                        <ul>
                            ${notesHtml}
                        </ul>
                    </div>
                    <a href="${release.downloadUrl}" class="download-btn" target="_blank">Download APK</a>
                `;
                
                container.appendChild(card);
            });


        })
        .catch(error => {
            console.error('Error fetching releases:', error);
            container.innerHTML = '<p style="color: red; text-align: center;">Failed to load releases. Please try again later.</p>';
        });
});


