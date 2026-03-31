// Load and display episodes
document.addEventListener('DOMContentLoaded', function() {
    fetch('episodes.json')
        .then(response => response.json())
        .then(data => {
            displayEpisodes(data.episodes, data.podcastLinks);
        })
        .catch(error => {
            console.error('Error loading episodes:', error);
            document.getElementById('episodes-list').innerHTML = 
                '<p style="color: #e94560; text-align: center;">Error loading episodes. Please try again later.</p>';
        });
});

function displayEpisodes(episodes, podcastLinks) {
    const container = document.getElementById('episodes-list');
    const readingSelect = document.getElementById('reading-select');
    
    // Sort episodes by date (newest first)
    const sortedEpisodes = [...episodes].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
    );

    populateReadingSelect(sortedEpisodes, readingSelect);

    sortedEpisodes.forEach(episode => {
        const card = createEpisodeCard(episode, podcastLinks);
        container.appendChild(card);
    });
}

function createEpisodeCard(episode, podcastLinks) {
    const card = document.createElement('article');
    card.className = 'episode-card';
    card.id = getEpisodeAnchorId(episode);
    
    const date = parseEpisodeDate(episode.date);
    const formattedDate = date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    const readingLinks = getReadingLinks(episode);
    const appleUrl = getAppleUrl(episode);
    const spotifyUrl = getSpotifyUrl(episode);

    card.innerHTML = `
        <div class="episode-header">
            <span class="episode-number">Episode ${episode.number}</span>
            <span class="episode-date">${formattedDate}</span>
            <span class="episode-duration">Duration: ${episode.duration}</span>
        </div>
        <h2 class="episode-title">
            <a href="${episode.episodeUrl}" target="_blank">${episode.title}</a>
        </h2>
        <p class="episode-description">${episode.description}</p>
        <div class="episode-reading">
            <div class="section-label">Readings</div>
            <div class="episode-reading-links">
                ${readingLinks || '<span class="no-reading">No reading linked yet</span>'}
            </div>
        </div>
        <div class="episode-actions">
            <a href="${episode.episodeUrl}" target="_blank">Episode Page</a>
        </div>
        <div class="episode-platforms">
            <div class="section-label">Listen On</div>
            <div class="episode-platform-links">
                <a href="${appleUrl}" target="_blank">Apple Podcasts</a>
                <a href="${spotifyUrl}" target="_blank">Spotify</a>
            </div>
        </div>
    `;
    
    return card;
}

function getReadingLinks(episode) {
    if (Array.isArray(episode.readingUrls) && episode.readingUrls.length > 0) {
        return episode.readingUrls
            .map(reading => `<a href="${encodePathUrl(reading.url)}" target="_blank" class="reading-link">Read: ${reading.label}</a>`)
            .join('');
    }

    if (episode.readingUrl) {
        return `<a href="${encodePathUrl(episode.readingUrl)}" target="_blank" class="reading-link">Read: ${episode.borgesWork}</a>`;
    }

    return '';
}

function populateReadingSelect(episodes, select) {
    const readingOptions = episodes.flatMap(episode => getReadingOptions(episode));

    readingOptions
        .sort((a, b) => a.label.localeCompare(b.label))
        .forEach(option => {
            const element = document.createElement('option');
            element.value = option.targetId;
            element.textContent = option.label;
            select.appendChild(element);
        });

    select.addEventListener('change', event => {
        const targetId = event.target.value;

        if (!targetId) {
            return;
        }

        const target = document.getElementById(targetId);

        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
}

function getReadingOptions(episode) {
    if (Array.isArray(episode.readingUrls) && episode.readingUrls.length > 0) {
        return episode.readingUrls.map(reading => ({
            label: reading.label,
            targetId: getEpisodeAnchorId(episode)
        }));
    }

    return [{
        label: episode.borgesWork,
        targetId: getEpisodeAnchorId(episode)
    }];
}

function getEpisodeAnchorId(episode) {
    return `episode-${episode.number}`;
}

function parseEpisodeDate(dateString) {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
}

function encodePathUrl(url) {
    return url
        .split('/')
        .map((segment, index) => (index === 0 ? segment : encodeURIComponent(segment)))
        .join('/');
}

function getAppleUrl(episode) {
    return episode.appleUrl || 'https://podcasts.apple.com/us/podcast/feed/id557975157?ls=1';
}

function getSpotifyUrl(episode) {
    if (episode.spotifyUrl) {
        return episode.spotifyUrl;
    }

    return `https://open.spotify.com/search/${encodeURIComponent(`Very Bad Wizards Episode ${episode.number} ${episode.title}`)}/episodes`;
}
