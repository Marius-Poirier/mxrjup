import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class DataService {
    private apiUrl = '/api';

    constructor(private http: HttpClient) { }

    getData<T>(type: string): Observable<T> {
        return this.http.get<T>(`${this.apiUrl}/data/${type}`);
    }

    saveData<T>(type: string, data: T): Observable<any> {
        return this.http.post(`${this.apiUrl}/data/${type}`, data, {
            headers: { 'Authorization': localStorage.getItem('adminPayload') || '' }
        });
    }

    uploadFile(file: File): Observable<{ url: string }> {
        const formData = new FormData();
        formData.append('file', file);
        return this.http.post<{ url: string }>(`${this.apiUrl}/upload`, formData, {
            headers: { 'Authorization': localStorage.getItem('adminPayload') || '' }
        });
    }

    deleteFile(url: string): Observable<any> {
        console.log('DataService: deleteFile called for:', url);
        return this.http.post(`${this.apiUrl}/delete-file`, { url }, {
            headers: { 'Authorization': localStorage.getItem('adminPayload') || '' }
        });
    }

    login(password: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/login`, { password }).pipe(
            tap(() => localStorage.setItem('adminPayload', password))
        );
    }

    isLoggedIn(): boolean {
        return !!localStorage.getItem('adminPayload');
    }

    logout() {
        localStorage.removeItem('adminPayload');
    }
}
