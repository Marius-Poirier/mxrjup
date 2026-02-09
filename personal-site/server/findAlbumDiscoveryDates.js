const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// Paths
const SPOTIFY_DATA_DIR = '/home/marius/Documents/instaData/my_spotify_data/Spotify Extended Streaming History';
const CSV_FILE = path.join(__dirname, 'My Spotify Library.csv');
const HISTORY_FILE = path.join(__dirname, 'data', 'history.json');
const TIMELINE_FILE = path.join(__dirname, 'data', 'timeline.json');

// Configuration
const MIN_CONSECUTIVE_SONGS = 5;

// Function to normalize album name (remove deluxe/remastered/etc suffixes)
function normalizeAlbumName(name) {
    if (!name) return '';
    return name
        .replace(/\s*\(Deluxe.*?\)/gi, '')
        .replace(/\s*\(Remastered.*?\)/gi, '')
        .replace(/\s*\(Explicit.*?\)/gi, '')
        .replace(/\s*\(Int'l.*?\)/gi, '')
        .replace(/\s*\(Special.*?\)/gi, '')
        .replace(/\s*\(Expanded.*?\)/gi, '')
        .replace(/\s*\(20th Anniversary.*?\)/gi, '')
        .trim();
}

// Function to load all streaming history files
function loadAllStreamingHistory() {
    const files = fs.readdirSync(SPOTIFY_DATA_DIR)
        .filter(f => f.startsWith('Streaming_History_Audio') && f.endsWith('.json'));

    console.log(`Found ${files.length} streaming history files\n`);

    let allHistory = [];
    files.forEach(file => {
        const filePath = path.join(SPOTIFY_DATA_DIR, file);
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        allHistory = allHistory.concat(data);
        console.log(`✓ Loaded ${data.length} streams from ${file}`);
    });

    console.log(`\n✓ Total streams: ${allHistory.length}\n`);
    return allHistory;
}

// Function to find album discovery dates based on consecutive plays
function findAlbumDiscoveryDates(streamingHistory) {
    const albumDiscoveryDates = new Map();

    // Sort by timestamp (oldest first)
    streamingHistory.sort((a, b) => new Date(a.ts) - new Date(b.ts));

    console.log('Analyzing consecutive plays to find album discovery dates...\n');

    let consecutiveCount = 0;
    let currentAlbum = null;
    let currentAlbumFirstPlay = null;

    streamingHistory.forEach((stream, index) => {
        const albumName = stream.master_metadata_album_album_name;

        if (!albumName) return;

        // Normalize album name for matching
        const normalizedAlbum = normalizeAlbumName(albumName);

        if (albumName === currentAlbum) {
            consecutiveCount++;

            if (consecutiveCount >= MIN_CONSECUTIVE_SONGS && !albumDiscoveryDates.has(normalizedAlbum)) {
                const date = currentAlbumFirstPlay.split('T')[0];
                albumDiscoveryDates.set(normalizedAlbum, {
                    date,
                    artist: stream.master_metadata_album_artist_name,
                    originalName: albumName,
                    consecutiveCount
                });
                console.log(`✓ ${albumName} - discovered on ${date} (${consecutiveCount} consecutive plays)`);
            }
        } else {
            currentAlbum = albumName;
            currentAlbumFirstPlay = stream.ts;
            consecutiveCount = 1;
        }
    });

    console.log(`\n✓ Found ${albumDiscoveryDates.size} albums with ${MIN_CONSECUTIVE_SONGS}+ consecutive plays\n`);
    return albumDiscoveryDates;
}

// Function to load album data from CSV
function loadAlbumIdsFromCSV() {
    return new Promise((resolve, reject) => {
        const albums = [];
        fs.createReadStream(CSV_FILE)
            .pipe(csv())
            .on('data', (row) => {
                albums.push({
                    id: row['Spotify - id'],
                    name: row.Album,
                    artist: row['Artist name']
                });
            })
            .on('end', () => {
                console.log(`✓ Loaded ${albums.length} albums from CSV\n`);
                resolve(albums);
            })
            .on('error', reject);
    });
}

// Main execution
async function main() {
    try {
        console.log('\n🎵 Finding album discovery dates from consecutive plays...\n');
        console.log(`Using threshold: ${MIN_CONSECUTIVE_SONGS} consecutive songs from same album\n`);

        const streamingHistory = loadAllStreamingHistory();
        const discoveryDates = findAlbumDiscoveryDates(streamingHistory);
        const csvAlbums = await loadAlbumIdsFromCSV();

        const timeline = JSON.parse(fs.readFileSync(TIMELINE_FILE, 'utf8'));
        const timelineMap = new Map();
        timeline.forEach(item => {
            const spotifyId = item.id.replace('spotify_', '');
            timelineMap.set(spotifyId, item);
        });

        const history = [];
        let matched = 0;
        let matchedViaBase = 0;
        let notFound = [];

        console.log('Matching albums with discovery dates...\n');

        csvAlbums.forEach(csvAlbum => {
            const timelineData = timelineMap.get(csvAlbum.id);
            if (!timelineData) return;

            // Try exact match first
            let discovery = discoveryDates.get(csvAlbum.name);
            let matchType = 'exact';

            // If no exact match, try normalized (base version)
            if (!discovery) {
                const normalized = normalizeAlbumName(csvAlbum.name);
                discovery = discoveryDates.get(normalized);
                matchType = 'base';
            }

            if (discovery) {
                history.push({
                    id: `spotify_${csvAlbum.id}`,
                    text: `${csvAlbum.name} - ${csvAlbum.artist}`,
                    date: discovery.date,
                    cover: timelineData.cover
                });

                if (matchType === 'base') {
                    console.log(`✓ [BASE] ${csvAlbum.name} matched to "${discovery.originalName}" - ${discovery.date}`);
                    matchedViaBase++;
                }
                matched++;
            } else {
                notFound.push({
                    name: csvAlbum.name,
                    artist: csvAlbum.artist,
                    normalized: normalizeAlbumName(csvAlbum.name)
                });
            }
        });

        // Sort by date (newest first)
        history.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Write history.json
        fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));

        console.log('\n===========================================');
        console.log('Processing complete!');
        console.log(`Total albums in CSV: ${csvAlbums.length}`);
        console.log(`Matched exactly: ${matched - matchedViaBase}`);
        console.log(`Matched via base version: ${matchedViaBase}`);
        console.log(`Total matched: ${matched}`);
        console.log(`Not found: ${notFound.length}`);
        console.log('===========================================\n');

        if (notFound.length > 0) {
            console.log('Albums NOT found (no 5+ consecutive plays):\n');

            // Group by whether they might be French rap
            const frenchRap = notFound.filter(a =>
                ['Vald', 'Spider ZED', 'Orelsan', 'Népal', 'Lorenzo', 'Lesram',
                    "L'Or du Commun", 'Kekra', 'KAYTRANADA', 'Hugo TSR', 'HOUDI',
                    'Freeze corleone', 'Deen Burbigo', 'Dalí', 'Casseurs Flowters',
                    'Caballero & JeanJass', 'Alpha Wann', 'Jazzy Bazz', 'Nieve'].includes(a.artist)
            );

            const others = notFound.filter(a => !frenchRap.includes(a));

            if (others.length > 0) {
                console.log('Other albums:');
                others.forEach((album, index) => {
                    console.log(`${index + 1}. ${album.name} by ${album.artist}`);
                });
                console.log('');
            }

            if (frenchRap.length > 0) {
                console.log(`French rap albums (${frenchRap.length} - likely listened via playlists):`);
                frenchRap.forEach((album, index) => {
                    console.log(`${index + 1}. ${album.name} by ${album.artist}`);
                });
                console.log('');
            }
        }

        console.log(`✓ Updated history.json with ${history.length} albums`);
        console.log(`✓ timeline.json remains unchanged with release dates`);

        console.log('\n✅ Import complete!\n');

    } catch (error) {
        console.error('\n❌ Error during processing:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

main();
