const fs = require('fs');
const path = require('path');
const axios = require('axios');
const csv = require('csv-parser');
require('dotenv').config();

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const CSV_FILE = path.join(__dirname, 'My Spotify Library.csv');
const TIMELINE_FILE = path.join(__dirname, 'data', 'timeline.json');
const HISTORY_FILE = path.join(__dirname, 'data', 'history.json');
const UPLOADS_DIR = path.join(__dirname, 'uploads');

let spotifyAccessToken = null;

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Function to get Spotify access token using Client Credentials
async function getSpotifyAccessToken() {
    try {
        const credentials = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64');
        const response = await axios.post('https://accounts.spotify.com/api/token',
            'grant_type=client_credentials',
            {
                headers: {
                    'Authorization': `Basic ${credentials}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        spotifyAccessToken = response.data.access_token;
        console.log('✓ Successfully authenticated with Spotify API\n');
        return spotifyAccessToken;
    } catch (error) {
        console.error('❌ Failed to authenticate with Spotify:', error.message);
        throw error;
    }
}

// Function to fetch album details from Spotify API with retry logic
async function fetchAlbumDetails(spotifyId, retries = 3) {
    for (let attempt = 0; attempt < retries; attempt++) {
        try {
            const response = await axios.get(`https://api.spotify.com/v1/albums/${spotifyId}`, {
                headers: {
                    'Authorization': `Bearer ${spotifyAccessToken}`
                }
            });

            return {
                name: response.data.name,
                artist: response.data.artists[0].name,
                releaseDate: response.data.release_date,
                imageUrl: response.data.images[0]?.url, // Get the highest quality image
                success: true
            };
        } catch (error) {
            if (error.response?.status === 429 && attempt < retries - 1) {
                // Rate limited - wait longer before retrying
                const waitTime = Math.pow(2, attempt) * 2000; // Exponential backoff: 2s, 4s, 8s
                console.log(`  ⏳ Rate limited, waiting ${waitTime / 1000}s before retry ${attempt + 1}/${retries}...`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
                continue;
            }
            console.error(`Error fetching album ${spotifyId}:`, error.message);
            return { success: false, error: error.message };
        }
    }
    return { success: false, error: 'Max retries exceeded' };
}

// Function to download image
async function downloadImage(url, spotifyId) {
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        const extension = url.includes('.png') ? 'png' : 'jpg';
        const filename = `album_${spotifyId}.${extension}`;
        const filepath = path.join(UPLOADS_DIR, filename);

        fs.writeFileSync(filepath, response.data);
        return `/uploads/${filename}`;
    } catch (error) {
        console.error(`Error downloading image for ${spotifyId}:`, error.message);
        return null;
    }
}

// Function to parse CSV and process albums
async function processAlbums() {
    const albums = [];
    const timeline = [];
    let processed = 0;
    let failed = 0;

    return new Promise((resolve, reject) => {
        fs.createReadStream(CSV_FILE)
            .pipe(csv())
            .on('data', (row) => {
                albums.push({
                    name: row.Album,
                    artist: row['Artist name'],
                    spotifyId: row['Spotify - id']
                });
            })
            .on('end', async () => {
                console.log(`Found ${albums.length} albums in CSV`);
                console.log('Starting to fetch album details from Spotify...\n');

                for (const album of albums) {
                    processed++;
                    console.log(`[${processed}/${albums.length}] Processing: ${album.name} - ${album.artist}`);

                    // Fetch album details
                    const details = await fetchAlbumDetails(album.spotifyId);

                    if (!details.success) {
                        failed++;
                        console.log(`  ❌ Failed to fetch details`);
                        continue;
                    }

                    // Download cover image
                    let coverPath = null;
                    if (details.imageUrl) {
                        coverPath = await downloadImage(details.imageUrl, album.spotifyId);
                        if (coverPath) {
                            console.log(`  ✓ Downloaded cover image`);
                        } else {
                            console.log(`  ⚠ Failed to download cover image`);
                        }
                    }

                    // Add to timeline
                    timeline.push({
                        id: `spotify_${album.spotifyId}`,
                        title: `${details.name} - ${details.artist}`,
                        date: details.releaseDate,
                        cover: coverPath || '/uploads/default-album.jpg'
                    });

                    console.log(`  ✓ Release date: ${details.releaseDate}\n`);

                    // Add delay to avoid rate limiting - 500ms between requests
                    await new Promise(resolve => setTimeout(resolve, 500));

                }

                console.log('\n===========================================');
                console.log(`Processing complete!`);
                console.log(`Total albums: ${albums.length}`);
                console.log(`Successfully processed: ${processed - failed}`);
                console.log(`Failed: ${failed}`);
                console.log('===========================================\n');

                resolve(timeline);
            })
            .on('error', reject);
    });
}

// Main execution
async function main() {
    try {
        console.log('Starting Spotify album import...\n');

        // Authenticate with Spotify using Client Credentials
        await getSpotifyAccessToken();

        // Process all albums
        const timeline = await processAlbums();

        // Sort by date (newest first)
        timeline.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Write timeline.json
        fs.writeFileSync(TIMELINE_FILE, JSON.stringify(timeline, null, 2));
        console.log(`✓ Updated timeline.json with ${timeline.length} albums`);

        // Also update history.json with the same data
        fs.writeFileSync(HISTORY_FILE, JSON.stringify(timeline, null, 2));
        console.log(`✓ Updated history.json with ${timeline.length} albums`);

        console.log('\n✅ Import complete!');
    } catch (error) {
        console.error('❌ Error during import:', error);
        process.exit(1);
    }
}

main();
