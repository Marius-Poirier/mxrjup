import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

interface Experiment {
  id: string;
  date: string;    // was code/version
  object: string;  // was type
  subject: string; // was name
  link: string;
}

@Component({
  selector: 'app-wip',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './wip.html',
  styleUrl: './wip.scss'
})
export class WipComponent {
  experiments = signal<Experiment[]>([
    {
      id: '1',
      date: '2026.02.01',
      object: 'Visual Identity',
      subject: 'ASCII Renderer Engine',
      link: '/'
    },
    {
      id: '2',
      date: '2026.01.28',
      object: 'Poster',
      subject: 'Luminous Strays',
      link: '#'
    },
    {
      id: '3',
      date: '2026.01.15',
      object: 'Simulation',
      subject: 'Fluid Dynamics (WebGL)',
      link: '#'
    },
    {
      id: '4',
      date: '2025.12.10',
      object: 'Publication',
      subject: 'The Brutalist Web',
      link: '#'
    },
    {
      id: '5',
      date: '2025.11.05',
      object: 'Exhibition',
      subject: 'Glotta 01: On Monsters',
      link: '#'
    },
    {
      id: '6',
      date: '2025.10.31',
      object: 'Packaging',
      subject: 'Cabinet of Commodities',
      link: '#'
    }
  ]);
}
