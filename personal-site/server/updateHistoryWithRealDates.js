const fs = require('fs');
const path = require('path');

// Real dates from Spotify screenshots
const realDates = {
    // Image 1
    "56 Nights": "2026-01-26",
    "Alfredo": "2026-01-25",
    "Don't Be Dumb": "2026-01-16",
    "Are You Experienced": "2025-12-10",
    "Trap House 3": "2025-12-01",
    "DMVP": "2025-11-30",
    "ATLiens": "2025-11-26",
    "Wave Pack": "2025-11-17",
    "Southernplayalisticadillacmuzik": "2025-11-11",
    "Without Warning": "2025-11-06",
    "Cozy Tapes: Vol. 1 Friends -": "2025-10-25",
    "Annie's Mix '85 (Special English Version)": "2025-10-11",
    "Appetite For Destruction": "2025-10-05",
    "The Documentary": "2025-09-25",
    "Bad (Remastered)": "2025-09-15",
    "Superunknown (20th Anniversary)": "2025-09-01",
    "Watch The Throne": "2025-08-25",
    "Tha Carter III": "2025-08-20",
    "Mr. Morale & The Big Steppers": "2025-08-05",
    "Squidtastic": "2025-08-07",

    // Image 2
    "Finally Rich": "2025-07-26",
    "Lil Uzi Vert vs. The World": "2025-07-14",
    "Nevermind (Remastered)": "2025-07-03",
    "Off the Wall": "2025-06-30",
    "The Blueprint (Explicit Version)": "2025-06-27",
    "DAYTONA": "2025-06-14",
    "Tha Carter II": "2025-06-06",
    "Slime Season 3": "2025-05-24",
    "Tha Carter": "2025-05-15",
    "Man On The Moon: The End Of Day (Int'l Version)": "2025-05-05",
    "Playboi Carti": "2025-04-18",
    "Culture": "2025-04-05",
    "The Dark Side of the Moon": "2025-03-08",
    "DS2 (Deluxe)": "2025-02-22",
    "TESTING": "2025-02-16",
    "Metallica": "2025-02-11",
    "Lean on Me: The Best of Bill Withers": "2025-01-27",
    "Illmatic": "2025-01-20",
    "HEROES & VILLAINS": "2025-01-10",
    "Monster": "2024-12-28",

    // Image 3
    "Slime Season": "2024-12-26",
    "AT.LONG.LAST.A$AP": "2024-12-18",
    "Thriller": "2024-12-13",
    "JEFFERY": "2024-12-10",
    "GNX": "2024-12-04",
    "Doggystyle": "2024-11-29",
    "LONG.LIVE.A$AP (Deluxe Version)": "2024-11-19",
    "In Rainbows": "2024-11-10",
    "LIVE.LOVE.A$AP": "2024-10-31",
    "Die Lit": "2024-10-19",
    "ESCAPE PLAN / MAFIA": "2024-10-12",
    "The Miseducation of Lauryn Hill": "2024-10-07",
    "Electric Ladyland": "2024-10-05",
    "DAMN. COLLECTORS EDITION.": "2024-09-26",
    "DAMN.": "2024-09-26",
    "(What's The Story) Morning Glory?": "2024-09-09",
    "2001": "2024-08-29",
    "DAYS BEFORE RODEO": "2024-08-23",
    "Big Fish Theory": "2024-08-08",
    "Talking Book": "2024-07-31",

    // Image 4
    "Luv Is Rage 2 (Deluxe)": "2024-07-25",
    "To Pimp A Butterfly": "2024-07-16",
    "OK Computer": "2024-07-02",
    "So Much Fun (Deluxe)": "2024-06-28",
    "The Score (Expanded Edition)": "2024-06-26",
    "SAVAGE MODE II": "2024-06-16",
    "HARDSTONE PSYCHO": "2024-06-14",
    "good kid, m.A.A.d city (Deluxe)": "2024-05-25",
    "Only Built For Infinity Links": "2024-05-19",
    "Random Access Memories": "2024-05-16",
    "UTOPIA": "2024-05-02",
    "Heaven Or Hell": "2024-04-25",
    "JACKBOYS": "2024-04-23",
    "Culture II": "2024-04-20",
    "Birds In The Trap Sing McKnight": "2024-04-09",
    "Currents": "2024-04-05",
    "The Chronic": "2024-04-03",
    "Rage Against The Machine": "2024-03-27",
    "Rodeo": "2024-03-24",
    "Goodbye & Good Riddance": "2024-03-18",

    // Image 5
    "VULTURES 1": "2024-03-05",
    "Whole Lotta Red": "2024-02-25",
    "Donda": "2024-02-08",
    "JESUS IS KING": "2024-01-13",
    "Wish You Were Here (Remastered Version)": "2024-01-06"
};

// Load timeline to get all albums with their IDs and covers
const TIMELINE_FILE = path.join(__dirname, 'data', 'timeline.json');
const HISTORY_FILE = path.join(__dirname, 'data', 'history.json');

const timeline = JSON.parse(fs.readFileSync(TIMELINE_FILE, 'utf8'));

// Build history from timeline + real dates
const history = [];
let matched = 0;
let notMatched = [];

console.log('🎵 Building history from real Spotify dates...\n');

timeline.forEach(timelineItem => {
    // Extract just the album name from the title (remove " - Artist")
    const albumName = timelineItem.title.split(' - ')[0];

    // Check if we have a real date for this album
    if (realDates[albumName]) {
        history.push({
            id: timelineItem.id,
            text: timelineItem.title,
            date: realDates[albumName],
            cover: timelineItem.cover
        });
        console.log(`✓ ${albumName} - ${realDates[albumName]}`);
        matched++;
    } else {
        notMatched.push(albumName);
    }
});

// Sort by date (newest first)
history.sort((a, b) => new Date(b.date) - new Date(a.date));

// Write history.json
fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));

console.log('\n===========================================');
console.log('Processing complete!');
console.log(`Total albums in timeline: ${timeline.length}`);
console.log(`Matched with real dates: ${matched}`);
console.log(`Not matched: ${notMatched.length}`);
console.log('===========================================\n');

if (notMatched.length > 0) {
    console.log('Albums without dates (these are likely the French rap albums from Deezer):\n');
    notMatched.forEach((album, index) => {
        console.log(`${index + 1}. ${album}`);
    });
    console.log('');
}

console.log(`✓ Updated history.json with ${history.length} albums and their REAL Spotify dates\n`);
console.log('✅ Complete!\n');
