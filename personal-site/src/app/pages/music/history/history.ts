import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './history.html',
  styleUrl: './history.scss'
})
export class HistoryComponent {
  // Mock data: Ordered play history
  history = signal([
    { id: 1, artist: 'Radiohead', title: 'In Rainbows', date: 'Just now' },
    { id: 2, artist: 'Aphex Twin', title: 'Selected Ambient Works 85-92', date: '3 hours ago' },
    { id: 3, artist: 'Massive Attack', title: 'Mezzanine', date: 'Yesterday' },
    { id: 4, artist: 'Björk', title: 'Homogenic', date: 'Yesterday' },
    { id: 5, artist: 'Portishead', title: 'Dummy', date: '2 days ago' },
    { id: 6, artist: 'BoardsofCanada', title: 'Music Has the Right to Children', date: '3 days ago' },
  ]);
}
