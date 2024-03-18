import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { GoogleAuthProvider } from '@firebase/auth';

interface LoginResponse {
  usuario: any;
}

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private apiUrl = 'http://localhost:4000/api';
  private citasSubject = new BehaviorSubject<any[]>([]);
  citas$ = this.citasSubject.asObservable();
  private usuarioInfoSubject = new BehaviorSubject<any>(null);
  usuarioInfo$ = this.usuarioInfoSubject.asObservable();
  apiUrl2 = 'http://localhost:4000/chat'; // La URL de tu endpoint en el servidor Node.js

  constructor(private http: HttpClient, private auth: AngularFireAuth, private router: Router) {
    const storedUsuarioInfo = localStorage.getItem('usuarioInfo');
    
    if (storedUsuarioInfo) {
      this.usuarioInfoSubject.next(JSON.parse(storedUsuarioInfo));
    }
  }

  googleAuth() {
    return this.authlogin(new GoogleAuthProvider());
  }

  authlogin(provider: any) {
    return this.auth.signInWithPopup(provider).then(result => {
      console.log('succes login', result);
    }).catch((error) => {
      console.log(error);
    });
  }

  async logOut() {
    this.auth.signOut();
  }

  getStateUser() {
    return this.auth.authState;
  }

  createUser(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/createusuario`, data);
  }

  loginUser(email: string, contrasena: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/loginUsuario`, { email, contrasena }).pipe(
      tap(response => {
        console.log('Respuesta del inicio de sesión:', response);
        this.usuarioInfoSubject.next(response.usuario);
        localStorage.setItem('usuarioInfo', JSON.stringify(response.usuario));
      }),
      catchError((error) => {
        console.error('Error en la solicitud de inicio de sesión:', error);
        throw error;
      })
    );
  }

  getUsuarioInfo() {
    return this.usuarioInfoSubject.value;
  }

  setUsuarioInfo(usuarioInfo: any): void {
    this.usuarioInfoSubject.next(usuarioInfo);
  }

  createManicurista(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/createManicurista`, data);
  }

  getManicuristas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/manicuristas`);
  }

  updateManicurista(data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/updateManicurista`, data);
  }

  eliminarManicurista(idmanicurista: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/eliminarManicurista/${idmanicurista}`);
  }

  buscarManicuristasPorNombre(nombre: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/buscar-por-nombre/${nombre}`);
  }

  createCita(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/crearCita`, data, { headers: { 'Content-Type': 'application/json' } });
  }

  obtenerCitasPorFecha(fecha: string, id_usuario: number, rol: string): Observable<any[]> {
    console.log('Fecha antes de la solicitud HTTP:', fecha);
    return this.http.get<any[]>(`${this.apiUrl}/citas/${fecha}/${id_usuario}/${rol}`).pipe(
      tap(citas => console.log('Citas después de la solicitud HTTP:', citas))
    );
  }

  obtenerCitasPorManicurista(idManicurista: number, fecha: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/citas/manicurista/${idManicurista}/${fecha}`);
  }

  createEmpleadoCandidato(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/createEmpleadoCandidato`, data);
  }

  getAllEmpleadosCandidatos(email: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/getAllEmpleadosCandidatos/${email}`);
  }

  sendEmailWithEmpleadosData(email: string): Observable<any> {
    const data = { email }; // Incluye el correo electrónico en el cuerpo de la solicitud
    return this.http.post(`${this.apiUrl}/sendEmailWithEmpleadosData`, data);
  }

  obtenerHistorialCitasUsuario(usuarioId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/historial/${usuarioId}`);
  }

  getFavoritaManicuristas(userEmail: string): Observable<any[]> {
    const url = `${this.apiUrl}/manicurista/favorita/${userEmail}`;
    return this.http.get<any[]>(url);
  }

  cambiarEstadoCita(idCita: number, nuevoEstado: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/cambioDeEstado`, { id_cita: idCita, nuevo_estado: nuevoEstado });
  }

  obtenerCitasPorId(idCita: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/citas/${idCita}`);
  }

  obtenerCitasUsuario(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/citasUsuario`);
  }

  getConfiguracion(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/Configuracion`);
  }

  createServicio(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/CrearServicio`, data);
  }

  actualizarPrecioServicio(idServicio: number, nuevoPrecio: number): Observable<any> {
    const url = `${this.apiUrl}/ActualizarPrecio/${idServicio}`;
    return this.http.put(url, { precio: nuevoPrecio });
  }

  eliminarServicio(id_servicio: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/eliminarServicio/${id_servicio}`);
  }

  sendMessage(history: any[], question: string): Observable<any> {
    const body = { history, question };
    return this.http.post<any>(this.apiUrl2, body);
  }

  authenticatedRequest(endpoint: string, data: any): Observable<any> {
    const token = localStorage.getItem('token');
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      })
    };

    return this.http.post(`${this.apiUrl}/${endpoint}`, data, httpOptions);
  }
}