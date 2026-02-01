import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

export interface MusicReview {
  id: string;
  artist: string;
  album: string;
  cover: string;
  genre: string;
  author: string;
  score: string; // Pitchfork style 8.5
  date: string;
  summary: string;
}

@Component({
  selector: 'app-music',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './music.html',
  styleUrl: './music.scss'
})
export class MusicComponent {

  reviews = signal<MusicReview[]>([
    {
      id: '1',
      artist: 'Joyce Manor',
      album: 'I Used to Go to This Bar',
      cover: 'https://picsum.photos/seed/joyce/800/800',
      genre: 'ROCK',
      author: 'Grace Robins-Somerville',
      score: '7.8',
      date: 'FEBRUARY 1 2026',
      summary: 'The Los Angeles pop-punk trio spends its seventh album wrestling with nostalgia, finding nuance and emotional complexity in their everyday grievances.'
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
      summary: 'A minimalist masterpiece that deconstructs the R&B genre into a raw, emotional soundscape of memory and longing.'
    },
    {
      id: '3',
      artist: 'Burial',
      album: 'Untrue',
      cover: 'https://picsum.photos/seed/burial/800/800',
      genre: 'ELECTRONIC',
      author: 'Guest Critic',
      score: '9.2',
      date: 'JANUARY 20 2026',
      summary: 'The sound of a city sleeping, rain against the bus window, and ghosts in the metro system.'
    }
  ]);

}
