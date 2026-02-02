import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

interface CoolThing {
  id: string;
  type: 'BOOK' | 'PRODUCT' | 'ARTICLE' | 'MUSIC' | 'IMAGE';
  title: string;
  subtitle?: string;
  image: string;
  link?: string;
  colSpan?: number;
  rowSpan?: number;
  tagColor?: string; // hex
}

@Component({
  selector: 'app-cool-stuff',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './cool-stuff.html',
  styleUrl: './cool-stuff.scss'
})
export class CoolStuffComponent {
  hoveredItem: CoolThing | null = null;
  items = signal<CoolThing[]>([
    {
      id: '1',
      type: 'BOOK',
      title: 'Neuromancer',
      subtitle: 'William Gibson',
      image: 'https://picsum.photos/seed/neuro/600/800',
      colSpan: 1,
      rowSpan: 2,
      tagColor: '#FFF400', // Yellow
      link: 'https://en.wikipedia.org/wiki/Neuromancer'
    },
    {
      id: '2',
      type: 'PRODUCT',
      title: 'Braun ET66',
      subtitle: 'Calculator',
      image: 'https://picsum.photos/seed/braun/600/600',
      colSpan: 1,
      rowSpan: 1,
      tagColor: '#0004ff', // Blue
      link: 'https://www.braun.com/global/watches-and-clocks/calculators'
    },
    {
      id: '3',
      type: 'ARTICLE',
      title: 'The Brutalist Web',
      subtitle: 'Read Now',
      image: 'https://picsum.photos/seed/article/800/400',
      colSpan: 2,
      rowSpan: 1,
      tagColor: '#FF0000', // Red
      link: 'https://brutalistwebsites.com/'
    },
    {
      id: '4',
      type: 'MUSIC',
      title: 'Nikes',
      subtitle: 'Frank Ocean',
      image: 'https://picsum.photos/seed/nikes/600/600',
      colSpan: 1,
      rowSpan: 1,
      tagColor: '#0004ff',
      link: 'https://www.youtube.com/watch?v=diIFhnWfD2k'
    },
    {
      id: '5',
      type: 'IMAGE',
      title: 'Mood 001',
      image: 'https://picsum.photos/seed/mood1/600/800',
      colSpan: 1,
      rowSpan: 2,
      tagColor: '#FFF400',
      link: 'https://pinterest.com'
    },
    {
      id: '6',
      type: 'PRODUCT',
      title: 'Teen Engineering',
      subtitle: 'OP-1',
      image: 'https://picsum.photos/seed/op1/800/600',
      colSpan: 2,
      rowSpan: 1,
      tagColor: '#FF0000',
      link: 'https://teenage.engineering/products/op-1'
    },
    {
      id: '7',
      type: 'BOOK',
      title: 'Design as Art',
      subtitle: 'Bruno Munari',
      image: 'https://picsum.photos/seed/munari/600/600',
      colSpan: 1,
      rowSpan: 1,
      tagColor: '#0004ff',
      link: 'https://www.penguin.co.uk/books/104/104764/design-as-art/9780141035819.html'
    }
  ]);
}
