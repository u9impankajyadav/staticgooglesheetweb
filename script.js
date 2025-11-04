document.addEventListener('DOMContentLoaded', () => {
    // IMPORTANT: Replace with your Google Sheet public CSV URL
    // e.g., 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR_YOUR_SHEET_ID_HERE/pub?output=csv'
    const sheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSGq0M_1OoiPSLAXdNvePDWDimpn0dkHnzgpqo0JZH4sHfF-tWYe71MFHEputY6pak0HjcBAXimP3iP/pub?gid=0&single=true&output=csv';
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
                    contentDiv.innerHTML = ''; // Clear "Loading content..."
                    data.forEach(item => {
                        const card = document.createElement('div');
                        card.className = 'item-card';
                        card.innerHTML = `
                            ${item.ImageURL ? `<img src="${item.ImageURL}" alt="${item.Title}">` : ''}
                            <div>
                                <h2>${item.Title || 'No Title'}</h2>
                                <p>${item.Description || 'No description available.'}</p>
                                ${item.ID ? `<a href="detail.html#${item.ID}">View Details</a>` : ''}
                            </div>
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
                        detailTitle.textContent = item.Title || 'Item Details';
                        detailContentDiv.innerHTML = `
                            ${item.ImageURL ? `<img src="${item.ImageURL}" alt="${item.Title}" style="max-width: 100%; height: auto; display: block; margin-bottom: 20px;">` : ''}
                            <h2>${item.Title || 'No Title'}</h2>
                            <p><strong>ID:</strong> ${item.ID}</p>
                            <p>${item.Description || 'No description available.'}</p>
                            ${item.Link ? `<p><a href="${item.Link}" target="_blank">External Link</a></p>` : ''}
                            <!-- Add more detail fields here as needed -->
                        `;
                    } else {
                        detailTitle.textContent = 'Item Not Found';
                        detailContentDiv.innerHTML = '<p>The requested item could not be found.</p>';
                    }
                } else {
                     detailTitle.textContent = 'Error Loading Item';
                     detailContentDiv.innerHTML = '<p>Could not retrieve item ID from URL.</p>';
                }
            }
        })
        .catch(error => {
            console.error('Error fetching or parsing Google Sheet data:', error);
            if (isHomePage) {
                const contentDiv = document.getElementById('content');
                if (contentDiv) contentDiv.innerHTML = '<p>Failed to load content. Please check the Google Sheet URL and your internet connection.</p>';
            } else if (isDetailPage) {
                const detailContentDiv = document.getElementById('detail-content');
                if (detailContentDiv) detailContentDiv.innerHTML = '<p>Failed to load item details. Please check the Google Sheet URL and your internet connection.</p>';
            }
        });
});
