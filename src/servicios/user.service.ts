import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable,of } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:4000/api';
  

  constructor(private http: HttpClient) { }

  createUser(data: any): Observable<any> {
    // Recupera el token de localStorage
    const token = localStorage.getItem('token');
console.log('Token:', token);


    if (!token) {
      console.error('No se ha encontrado un token de autenticación.');
      return of();
    }
    

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      })
    };
    
    return this.http.post(`${this.apiUrl}/createusuario`, data, httpOptions);
  }
}