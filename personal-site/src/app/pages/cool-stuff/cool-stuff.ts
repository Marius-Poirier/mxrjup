import { Component, signal, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DataService } from '../../services/data.service';

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
export class CoolStuffComponent implements OnInit {
  private dataService = inject(DataService);
  hoveredItem: CoolThing | null = null;
  items = signal<CoolThing[]>([]);

  ngOnInit() {
    this.dataService.getData<CoolThing[]>('cool_stuff').subscribe(data => {
      this.items.set(data);
    });
  }
}
