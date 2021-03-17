import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {take, tap} from 'rxjs/operators';


@Injectable({providedIn: 'root'})
export class RestService {

  private recognitionServerUrl;
  private gatewayServerUrl = "http://localhost:8080";
  private readonly serverUrlsSheetId: string = '1HgBUVQrBo-UnrZ6W7-ipKgmZIMUyFXCsQ-DNCzq5BCc';

  constructor(private http: HttpClient) {
  }

  sendImage(file: File): Observable<any> {
    const formData: FormData = new FormData();
    formData.append('file', file);
    return this.http.post(this.recognitionServerUrl, formData, {responseType: 'arraybuffer'});
  }

  convertMidiToNotes(file: File): Observable<any> {
    const formData: FormData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.gatewayServerUrl}/converter/notes`, formData, {responseType: 'text'});
  }

  updateServerUrls(): void {
    this.http.get(`https://spreadsheets.google.com/feeds/cells/${this.serverUrlsSheetId}/1/public/values?alt=json-in-script`, {responseType: 'text'})
      .pipe(take(1))
      .subscribe((res) => {
        this.recognitionServerUrl = JSON.parse(res.slice(28, -2)).feed.entry[0].content['$t'];
        console.log(this.recognitionServerUrl);
      });
  }

  logout(): Observable<any> {
    return this.http.post('/logout', null, {responseType: 'text'})
      .pipe(tap(() => {
        document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        sessionStorage.clear();
      }));
  }
}
