import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {
  activeTab = 'timeline';
  currentData: any[] = [];
  currentItem: any = {};
  editingIndex = -1;
  isUploading = false;

  // For Review Extracts management
  newExtract: { title: string, url: string } = { title: '', url: '' };

  private cdr = inject(ChangeDetectorRef);
  private dataService = inject(DataService);

  ngOnInit() {
    this.loadData();
  }

  setTab(tab: string) {
    this.activeTab = tab;
    this.currentData = [];
    // this.cdr.detectChanges(); // Optional, but let's let loadData handle it
    this.cancelEdit();
    this.loadData();
  }

  loadData() {
    console.log('Loading data for:', this.activeTab);
    this.dataService.getData<any[]>(this.activeTab).subscribe({
      next: (data) => {
        console.log('Data received:', data);
        this.currentData = data || [];
        this.cdr.detectChanges(); // Force update
      },
      error: (err) => {
        console.error('Error loading data:', err);
        this.cdr.detectChanges();
      }
    });
  }

  getItemSummary(item: any): string {
    const data = item as any;
    switch (this.activeTab) {
      case 'timeline': return `${data.title || 'Untitled'} (${data.date || 'No Date'})`;
      case 'history': return `${data.date || 'No Date'} - ${data.text?.substring(0, 30) || 'No Text'}...`;
      // Fix for undefined - undefined. Fallback to title or id.
      case 'reviews': return data.album ? `${data.artist} - ${data.album}` : (data.title || data.id);
      case 'media': return data.title || 'Untitled Media';
      case 'cool_stuff': return data.title || 'Untitled';
      default: return JSON.stringify(data);
    }
  }

  uploadFile(event: any, field: string, targetObj?: any) {
    const file = event.target.files[0];
    if (file) {
      this.isUploading = true;
      this.dataService.uploadFile(file).subscribe({
        next: (res) => {
          if (targetObj) {
            targetObj[field] = res.url;
          } else {
            this.currentItem[field] = res.url;
          }
          this.isUploading = false;
        },
        error: () => this.isUploading = false
      });
    }
  }

  // specific to Review Extracts
  addExtract() {
    if (!this.currentItem.extracts) {
      this.currentItem.extracts = [];
    }
    if (this.newExtract.title && this.newExtract.url) {
      this.currentItem.extracts.push({ ...this.newExtract });
      this.newExtract = { title: '', url: '' };
    }
  }

  removeExtract(index: number) {
    if (this.currentItem.extracts) {
      this.currentItem.extracts.splice(index, 1);
    }
  }

  saveItem() {
    // Auto-generation logic for specific types
    if (this.activeTab === 'cool_stuff') {
      // Always enforce type-based colors and default layout
      const typeColors: { [key: string]: string } = {
        'BOOK': '#e0e0e0',
        'PRODUCT': '#d1d1d1',
        'ARTICLE': '#c2c2c2',
        'MUSIC': '#b3b3b3',
        'IMAGE': '#a4a4a4'
      };

      this.currentItem.tagColor = typeColors[this.currentItem.type] || '#cccccc';
      this.currentItem.colSpan = 1;
      this.currentItem.rowSpan = 1;

      if (this.editingIndex === -1) {
        this.currentItem.id = (this.currentData.length + 1).toString();
      }
    }

    if (this.activeTab === 'reviews' && this.editingIndex === -1) {
      this.currentItem.id = Date.now().toString();
    }
    if (this.activeTab === 'media' && this.editingIndex === -1) {
      this.currentItem.id = Date.now().toString();
    }

    if (this.editingIndex > -1) {
      this.currentData[this.editingIndex] = this.currentItem;
    } else {
      this.currentData.push(this.currentItem);
    }

    this.dataService.saveData(this.activeTab, this.currentData).subscribe({
      next: () => {
        alert('Saved successfully. Reloading...');
        window.location.reload();
      },
      error: (err) => alert('Failed to save')
    });
  }

  editItem(index: number) {
    this.editingIndex = index;
    // Deep copy to avoid reference issues, especially with arrays like extracts
    this.currentItem = JSON.parse(JSON.stringify(this.currentData[index]));
  }

  deleteItem(index: number) {
    if (confirm('Are you sure?')) {
      this.currentData.splice(index, 1);
      this.dataService.saveData(this.activeTab, this.currentData).subscribe();
    }
  }

  cancelEdit() {
    this.editingIndex = -1;
    this.currentItem = {};
    this.newExtract = { title: '', url: '' };
  }

  resetForm() {
    this.cancelEdit();
  }

  logout() {
    this.dataService.logout();
    window.location.reload();
  }
}
