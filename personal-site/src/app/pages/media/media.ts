import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UpperCasePipe } from '@angular/common';

export interface MediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnail: string;
  title: string;
}

@Component({
  selector: 'app-media',
  standalone: true,
  imports: [RouterLink, UpperCasePipe],
  templateUrl: './media.html',
  styleUrl: './media.scss'
})
export class MediaComponent {

  items = signal<MediaItem[]>([
    {
      id: '1',
      type: 'image',
      url: 'https://picsum.photos/seed/awge1/1920/1080',
      thumbnail: 'https://picsum.photos/seed/awge1/600/600',
      title: 'CHAOS_01'
    },
    {
      id: '2',
      type: 'image',
      url: 'https://picsum.photos/seed/awge2/1920/1080',
      thumbnail: 'https://picsum.photos/seed/awge2/600/800',
      title: 'ENTROPY'
    },
    {
      id: '3',
      type: 'image',
      url: 'https://picsum.photos/seed/awge3/1920/1080',
      thumbnail: 'https://picsum.photos/seed/awge3/600/600',
      title: 'VOID'
    },
    {
      id: '4',
      type: 'image',
      url: 'https://picsum.photos/seed/awge4/1920/1080',
      thumbnail: 'https://picsum.photos/seed/awge4/800/600',
      title: 'STATIC'
    },
    {
      id: '5',
      type: 'image',
      url: 'https://picsum.photos/seed/awge5/1920/1080',
      thumbnail: 'https://picsum.photos/seed/awge5/600/900',
      title: 'NOISE'
    },
    {
      id: '6',
      type: 'image',
      url: 'https://picsum.photos/seed/awge6/1920/1080',
      thumbnail: 'https://picsum.photos/seed/awge6/600/600',
      title: 'SIGNAL'
    }
  ]);

  activeItem = signal<MediaItem | null>(null);

  openLightbox(item: MediaItem) {
    this.activeItem.set(item);
  }

  closeLightbox() {
    this.activeItem.set(null);
  }
}
