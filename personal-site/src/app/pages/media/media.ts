import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UpperCasePipe } from '@angular/common';

export interface MediaItem {
  id: string;
  type: 'image' | 'video' | 'audio';
  url: string;
  thumbnail?: string; // Audio might not have a thumbnail
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
      thumbnail: 'https://picsum.photos/seed/awge1/800/600', // Landscape
      title: 'CHAOS_01'
    },
    {
      id: '2',
      type: 'video',
      url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      thumbnail: 'https://picsum.photos/seed/video1/600/600', // Square
      title: 'MOTION_TEST'
    },
    {
      id: '3',
      type: 'image',
      url: 'https://picsum.photos/seed/awge3/1080/1920',
      thumbnail: 'https://picsum.photos/seed/awge3/600/900', // Portrait
      title: 'VOID'
    },
    {
      id: '4',
      type: 'audio',
      url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      title: 'AUDIO_LOG_01'
    },
    {
      id: '5',
      type: 'image',
      url: 'https://picsum.photos/seed/awge5/1920/1080',
      thumbnail: 'https://picsum.photos/seed/awge5/900/400', // Wide
      title: 'NOISE'
    },
    {
      id: '6',
      type: 'image',
      url: 'https://picsum.photos/seed/awge6/1080/1920',
      thumbnail: 'https://picsum.photos/seed/awge6/500/800', // Portrait
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
