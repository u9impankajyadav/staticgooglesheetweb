document.addEventListener('DOMContentLoaded', () => {
    const sheetUrl = 'https://docs.google.com/spreadsheets/d/15pt5tvz_L2RU8y674v1RKOOAiwJ3wTg9GveLsEr5y00/edit?gid=0#gid=0'; // Replace with your Google Sheet public CSV URL
    const contentDiv = document.getElementById('content');

    // Function to set the current year in the footer
    document.getElementById('current-year').textContent = new Date().getFullYear();

    fetch(sheetUrl)
        .then(response => response.text())
        .then(csvText => {
            // Parse CSV data (simple parsing for demonstration)
            const rows = csvText.trim().split('\n');
            const headers = rows[0].split(',');
            const data = rows.slice(1).map(row => {
                const values = row.split(',');
                let item = {};
                headers.forEach((header, index) => {
                    item[header.trim()] = values[index].trim();
                });
                return item;
            });

            contentDiv.innerHTML = ''; // Clear "Loading content..."

            data.forEach(item => {
                const card = document.createElement('div');
                card.className = 'item-card';
                card.innerHTML = `
                    ${item.ImageURL ? `<img src="${item.ImageURL}" alt="${item.Title}">` : ''}
                    <div>
                        <h2>${item.Title || 'No Title'}</h2>
                        <p>${item.Description || 'No description available.'}</p>
                        ${item.Link ? `<a href="${item.Link}" target="_blank">Read More</a>` : ''}
                    </div>
                `;
                contentDiv.appendChild(card);
            });
        })
        .catch(error => {
            console.error('Error fetching or parsing Google Sheet data:', error);
            contentDiv.innerHTML = '<p>Failed to load content. Please check the Google Sheet URL and your internet connection.</p>';
        });
});
