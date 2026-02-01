import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-review-detail',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './review-detail.html',
  styleUrl: './review-detail.scss'
})
export class ReviewDetailComponent {
  private route = inject(ActivatedRoute);

  // In a real app, this would come from a service. For now, we mock looking it up.
  // We'll just define the full data here for simplicity since we don't have a shared service yet (besides blog).

  reviews = [
    {
      id: '1',
      artist: 'Joyce Manor',
      album: 'I Used to Go to This Bar',
      cover: 'https://picsum.photos/seed/joyce/800/800',
      genre: 'ROCK',
      author: 'Grace Robins-Somerville',
      score: '7.8',
      date: 'FEBRUARY 1 2026',
      summary: 'The Los Angeles pop-punk trio spends its seventh album wrestling with nostalgia...',
      content: `
        <p>This is the full review content area. It mimics the layout of a serious music publication.</p>
        <p>The album opens with a burst of energy that immediately recalls their earlier work, yet there is a weariness to the lyrics that suggests a band having grown up. "Don't Let The Bastards Get You Down" serves as a thematic anchor, revisiting the angst of their debut but filtering it through a decade of touring and life changes.</p>
        <p><strong>Best New Music</strong> classification is reserved for albums that define the current moment. While this record hits many high notes, it ultimately feels like a retrospective.</p>
        <p>Barry Johnson's vocals have never sounded clearer, sitting high in the mix above jagged guitar lines that owe as much to Thin Lizzy as they do to the Descendents. The production by Rob Schnapf adds a layer of polish that might alienate purists but undeniably gives the songs more punch.</p>
        <hr>
        <p>It was a cold Tuesday in Los Angeles when I first heard the demo tapes. The rain was lashing against the windshield of my 2004 Honda Civic, a fitting setting for an album so obsessed with the passage of time and the mundane tragedies of adulthood.</p>
        <p>Tracks like "Gotta Let It Go" and "NBTSA" showcase the band's ability to write earworm choruses that hide devastatingly sad lyrics. It is a trick they have pulled before, but it remains effective. The closing track, "Stairs," is a acoustic departure that ends the album on a somber, reflective note, leaving the listener in a quiet room with their own thoughts.</p>
        <p>Ultimately, <em>I Used to Go to This Bar</em> is a testament to survival. It is about looking back at who you used to be and making peace with who you have become, even if you miss the chaos of your youth.</p>
      `,
      extracts: [
        { title: 'Gotta Let It Go (Clip)', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
        { title: 'NBTSA (Clip)', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
        { title: 'Stairs (Clip)', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' }
      ]
    },
    {
      id: '2',
      artist: 'Frank Ocean',
      album: 'Blonde',
      cover: 'https://picsum.photos/seed/blonde/800/800',
      genre: 'R&B',
      author: 'Marius',
      score: '10.0',
      date: 'JANUARY 28 2026',
      summary: 'A minimalist masterpiece...',
      content: '<p>A masterpiece of modern R&B.</p>'
    }
  ];

  review = computed(() => {
    const id = this.route.snapshot.paramMap.get('id');
    return this.reviews.find(r => r.id === id);
  });

  activeExtract = signal<{ title: string, url: string } | null>(null);

  openLightbox(extract: { title: string, url: string }) {
    this.activeExtract.set(extract);
  }

  closeLightbox() {
    this.activeExtract.set(null);
  }
}
