document.addEventListener('DOMContentLoaded', () => {
    // IMPORTANT: Replace with your Google Sheet public CSV URL
    // e.g., 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR_YOUR_SHEET_ID_HERE/pub?output=csv'
    const sheetUrl = 'YOUR_GOOGLE_SHEET_CSV_URL'; 
    const currentPath = window.location.pathname;
    const isHomePage = currentPath.includes('index.html') || currentPath === '/';
    const isDetailPage = currentPath.includes('detail.html');

    // Function to set the current year in the footer
    const setFooterYear = (elementId) => {
        const yearElement = document.getElementById(elementId);
        if (yearElement) {
            yearElement.textContent = new Date().getFullYear();
        }
    };

    if (isHomePage) {
        setFooterYear('current-year');
    } else if (isDetailPage) {
        setFooterYear('current-year-detail');
    }

    fetch(sheetUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        })
        .then(csvText => {
            const rows = csvText.trim().split('\n');
            const headers = rows[0].split(',').map(header => header.trim());
            const data = rows.slice(1).map(row => {
                const values = row.split(',');
                let item = {};
                headers.forEach((header, index) => {
                    item[header] = values[index] ? values[index].trim() : '';
                });
                return item;
            });

            if (isHomePage) {
                const contentDiv = document.getElementById('content');
                if (contentDiv) {
                    contentDiv.innerHTML = ''; // Clear "Loading treatments..."
                    data.forEach(item => {
                        const card = document.createElement('div');
                        card.className = 'service-card'; // Changed from item-card
                        card.innerHTML = `
                            ${item.ImageURL ? `<img src="${item.ImageURL}" alt="${item.Title}">` : ''}
                            <h3>${item.Title || 'No Title'}</h3>
                            <p>${item.Description || 'No description available.'}</p>
                            ${item.ID ? `<a href="detail.html#${item.ID}">View Treatment</a>` : ''}
                        `;
                        contentDiv.appendChild(card);
                    });
                }
            } else if (isDetailPage) {
                const detailContentDiv = document.getElementById('detail-content');
                const detailTitle = document.getElementById('detail-title');
                const itemId = window.location.hash.substring(1); // Get ID from hash
                
                if (detailContentDiv && detailTitle && itemId) {
                    const item = data.find(i => i.ID === itemId);

                    if (item) {
                        detailTitle.textContent = item.Title || 'Treatment Details';
                        detailContentDiv.innerHTML = `
                            ${item.ImageURL ? `<img src="${item.ImageURL}" alt="${item.Title}">` : ''}
                            <h2>${item.Title || 'No Title'}</h2>
                            <p><strong>Treatment ID:</strong> ${item.ID}</p>
                            <p>${item.Description || 'No description available.'}</p>
                            ${item.Link ? `<p><a href="${item.Link}" target="_blank">Learn More (External)</a></p>` : ''}
                            <!-- Add more detail fields here as needed -->
                        `;
                    } else {
                        detailTitle.textContent = 'Treatment Not Found';
                        detailContentDiv.innerHTML = '<p>The requested treatment could not be found.</p>';
                    }
                } else {
                     detailTitle.textContent = 'Error Loading Treatment';
                     detailContentDiv.innerHTML = '<p>Could not retrieve treatment ID from URL.</p>';
                }
            }
        })
        .catch(error => {
            console.error('Error fetching or parsing Google Sheet data:', error);
            if (isHomePage) {
                const contentDiv = document.getElementById('content');
                if (contentDiv) contentDiv.innerHTML = '<p>Failed to load treatments. Please check the Google Sheet URL and your internet connection.</p>';
            } else if (isDetailPage) {
                const detailContentDiv = document.getElementById('detail-content');
                if (detailContentDiv) detailContentDiv.innerHTML = '<p>Failed to load treatment details. Please check the Google Sheet URL and your internet connection.</p>';
            }
        });
});
