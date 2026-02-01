import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-timeline',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './timeline.html',
  styleUrl: './timeline.scss'
})
export class TimelineComponent {
  // Mock data: Dense history to test "clutter" solution
  albums = signal([
    // 2016 Cluster (The busy year)
    { date: '2016-02-14', title: 'The Life of Pablo', cover: 'https://picsum.photos/seed/tlop/300/300' },
    { date: '2016-03-04', title: 'Untitled Unmastered', cover: 'https://picsum.photos/seed/kendrick/300/300' },
    { date: '2016-04-23', title: 'Lemonade', cover: 'https://picsum.photos/seed/lemonade/300/300' },
    { date: '2016-05-06', title: 'Bottomless Pit', cover: 'https://picsum.photos/seed/deathgrip/300/300' },
    { date: '2016-05-08', title: 'A Moon Shaped Pool', cover: 'https://picsum.photos/seed/radiohead/300/300' },
    { date: '2016-05-20', title: 'Teens of Denial', cover: 'https://picsum.photos/seed/csh/300/300' },
    { date: '2016-06-17', title: 'Puberty 2', cover: 'https://picsum.photos/seed/mitski/300/300' },
    { date: '2016-08-20', title: 'Blonde', cover: 'https://picsum.photos/seed/blonde/300/300' },
    { date: '2016-09-30', title: 'Atrocity Exhibition', cover: 'https://picsum.photos/seed/danny/300/300' },

    // Spread out years
    { date: '2017-06-16', title: 'Melodrama', cover: 'https://picsum.photos/seed/lorde/300/300' },
    { date: '2018-08-31', title: 'Joy as an Act of Resistance', cover: 'https://picsum.photos/seed/idles/300/300' },
    { date: '2024-02-28', title: 'Scrapyard', cover: 'https://picsum.photos/seed/quadeca/300/300' }
  ]);

  // Group by year for the layout
  groupedAlbums = computed(() => {
    const sorted = this.albums().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const groups: { year: string, items: any[] }[] = [];

    sorted.forEach(album => {
      const year = album.date.split('-')[0];
      let group = groups.find(g => g.year === year);
      if (!group) {
        group = { year, items: [] };
        groups.push(group);
      }
      group.items.push(album);
    });

    return groups;
  });
}
