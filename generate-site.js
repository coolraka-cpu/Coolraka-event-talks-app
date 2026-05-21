const talksData = require('./talks');
const fs = require('fs');
const path = require('path');

function generateSite() {
    let currentTime = new Date('2026-05-21T10:00:00'); // Start at 10:00 AM on a dummy date

    const schedule = [];
    const talkDuration = 60; // minutes
    const transitionDuration = 10; // minutes
    const lunchDuration = 60; // minutes

    // Helper to format time
    const formatTime = (date) => date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    talksData.forEach((talk, index) => {
        // Add talk
        const talkStartTime = new Date(currentTime);
        currentTime.setMinutes(currentTime.getMinutes() + talkDuration);
        const talkEndTime = new Date(currentTime);

        schedule.push({
            ...talk,
            startTime: formatTime(talkStartTime),
            endTime: formatTime(talkEndTime),
            type: 'talk'
        });

        // Add transition or lunch
        if (index < talksData.length - 1) {
            if (index === 2) { // After the 3rd talk, add lunch
                const lunchStartTime = new Date(currentTime);
                currentTime.setMinutes(currentTime.getMinutes() + lunchDuration);
                const lunchEndTime = new Date(currentTime);
                schedule.push({
                    title: "Lunch Break",
                    description: "Enjoy a delicious lunch and network with fellow attendees!",
                    startTime: formatTime(lunchStartTime),
                    endTime: formatTime(lunchEndTime),
                    type: 'break'
                });
            } else { // Add transition
                currentTime.setMinutes(currentTime.getMinutes() + transitionDuration);
            }
        }
    });

    // --- CSS Styles ---
    const css = `
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f4f4f4;
            color: #333;
        }
        .container {
            max-width: 900px;
            margin: 0 auto;
            background-color: #fff;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        h1 {
            color: #2c3e50;
            text-align: center;
            margin-bottom: 30px;
        }
        .search-container {
            margin-bottom: 20px;
            text-align: center;
        }
        .search-container input {
            width: 70%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 16px;
        }
        .schedule-item {
            background-color: #fdfdfd;
            border: 1px solid #eee;
            border-left: 5px solid #3498db;
            margin-bottom: 15px;
            padding: 15px;
            border-radius: 5px;
            transition: all 0.3s ease;
        }
        .schedule-item:hover {
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
            transform: translateY(-2px);
        }
        .schedule-item.break {
            border-left: 5px solid #27ae60;
            background-color: #e8f5e9;
        }
        .schedule-time {
            font-weight: bold;
            color: #555;
            margin-bottom: 5px;
            display: block;
        }
        .schedule-title {
            font-size: 1.3em;
            color: #34495e;
            margin-top: 0;
            margin-bottom: 5px;
        }
        .schedule-speakers {
            font-style: italic;
            color: #7f8c8d;
            margin-bottom: 10px;
        }
        .schedule-category {
            font-size: 0.9em;
            color: #3498db;
            margin-bottom: 10px;
        }
        .schedule-category span {
            background-color: #e7f3fd;
            padding: 3px 8px;
            border-radius: 3px;
            margin-right: 5px;
        }
        .schedule-description {
            line-height: 1.5;
            color: #666;
        }
        .no-results {
            text-align: center;
            color: #777;
            padding: 20px;
            font-size: 1.1em;
        }
    `;

    // --- Client-side JavaScript ---
    const js = `
        const allScheduleItems = ${JSON.stringify(schedule, null, 2)};
        
        function renderSchedule(itemsToRender) {
            const container = document.getElementById('schedule-container');
            container.innerHTML = ''; // Clear previous content

            if (itemsToRender.length === 0) {
                container.innerHTML = '<div class="no-results">No talks found matching your criteria.</div>';
                return;
            }

            itemsToRender.forEach(item => {
                const itemDiv = document.createElement('div');
                itemDiv.classList.add('schedule-item');
                if (item.type === 'break') {
                    itemDiv.classList.add('break');
                    itemDiv.innerHTML = \`
                        <span class="schedule-time">\${item.startTime} - \${item.endTime}</span>
                        <h2 class="schedule-title">\${item.title}</h2>
                        <p class="schedule-description">\${item.description}</p>
                    \`;
                } else {
                    const categoriesHtml = item.category.map(cat => '<span>' + cat + '</span>').join('');
                    itemDiv.innerHTML = \`
                        <span class="schedule-time">\${item.startTime} - \${item.endTime}</span>
                        <h3 class="schedule-title">\${item.title}</h3>
                        <p class="schedule-speakers">\${item.speakers.join(' & ')}</p>
                        <p class="schedule-category">\${categoriesHtml}</p>
                        <p class="schedule-description">\${item.description}</p>
                    \`;
                }
                container.appendChild(itemDiv);
            });
        }

        document.addEventListener('DOMContentLoaded', () => {
            renderSchedule(allScheduleItems);

            const searchInput = document.getElementById('search-input');
            searchInput.addEventListener('input', (event) => {
                const searchTerm = event.target.value.toLowerCase();
                const filteredItems = allScheduleItems.filter(item => {
                    if (item.type === 'break') return false; // Don't filter breaks
                    return item.category.some(cat => cat.toLowerCase().includes(searchTerm));
                });
                renderSchedule(filteredItems);
            });
        });
    `;

    // --- HTML Template ---
    const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Technical Talk Event Schedule</title>
            <style>
                ${css}
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Technical Talk Event Schedule</h1>
                <div class="search-container">
                    <input type="text" id="search-input" placeholder="Search by category (e.g., 'Web Development')">
                </div>
                <div id="schedule-container">
                    <!-- Schedule items will be rendered here by JavaScript -->
                </div>
            </div>
            <script>
                ${js}
            </script>
        </body>
        </html>
    `;

    fs.writeFileSync(path.join(__dirname, 'index.html'), html.trim());
    console.log('index.html generated successfully!');
}

generateSite();
