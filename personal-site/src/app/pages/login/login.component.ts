import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DataService } from '../../services/data.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="login-container">
      <h2>Enter Password</h2>
      <input type="password" [(ngModel)]="password" (keyup.enter)="login()" placeholder="Password">
      <button (click)="login()">Login</button>
      <p *ngIf="error" class="error">{{ error }}</p>
    </div>
  `,
    styles: [`
    .login-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      gap: 1rem;
      background-color: #f0f0f0; /* Basic styling, can be improved */
    }
    input {
      padding: 0.5rem;
      font-size: 1rem;
    }
    button {
      padding: 0.5rem 1rem;
      cursor: pointer;
    }
    .error {
      color: red;
    }
  `]
})
export class LoginComponent {
    password = '';
    error = '';
    private dataService = inject(DataService);
    private router = inject(Router);

    login() {
        this.dataService.login(this.password).subscribe({
            next: () => {
                this.router.navigate(['/add']);
            },
            error: () => {
                this.error = 'Invalid password';
            }
        });
    }
}
