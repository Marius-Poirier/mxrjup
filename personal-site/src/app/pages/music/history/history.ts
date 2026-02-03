import { Component, signal, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe, CommonModule } from '@angular/common';
import { DataService } from '../../../services/data.service';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [RouterLink, DatePipe, CommonModule],
  templateUrl: './history.html',
  styleUrl: './history.scss'
})
export class HistoryComponent implements OnInit {
  private dataService = inject(DataService);
  history = signal<any[]>([]);

  ngOnInit() {
    this.dataService.getData<any[]>('history').subscribe(data => {
      this.history.set(data);
    });
  }
}
