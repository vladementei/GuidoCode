import {Injectable} from '@angular/core';

@Injectable({providedIn: 'root'})
export class FileService {

  downloadFile(response: any, fileName?: string): void {
    const blob = new Blob([response], {type: 'audio/mid'});
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    document.body.appendChild(link);
    link.className = 'hidden';
    link.download = fileName || 'file';
    link.href = url;
    link.click();
    document.body.removeChild(link);
  }
}
