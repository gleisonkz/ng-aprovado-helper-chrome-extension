import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { HotToastService } from '@ngneat/hot-toast';
import { eListeningType, ListeningType } from 'src/app/models/listening-type';
import { VideoInfo } from '../../models/video-info';

@Component({
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.scss'],
})
export class PopupComponent implements OnInit {
  video: VideoInfo;
  isLogged = true;
  userForm: FormGroup;
  selectedType = new FormControl(9178639);
  listeningTypes: ListeningType[] = [
    { key: eListeningType.Passive, value: 'Passive' },
    { key: eListeningType.Active, value: 'Active' },
  ];
  @ViewChild('$duration') $duration: ElementRef<HTMLSpanElement>;
  @ViewChild('$title') $title: ElementRef<HTMLSpanElement>;

  constructor(private http: HttpClient, private toast: HotToastService) {}

  ngOnInit(): void {
    this.userForm = new FormGroup({
      Email: new FormControl('', [Validators.required]),
      Senha: new FormControl('', [Validators.required]),
      ManterConectado: new FormControl(true),
    });

    this.getVideoDetails();
    this.checkIfIsLogged();
  }

  isEnded() {}

  listenVideo() {
    this.isEnded();
    chrome.tabs.executeScript({
      code: `(${() => {
        const $video = document.querySelector('video');
        $video?.addEventListener('ended', () => {
          chrome.runtime.sendMessage({
            message: { type: 'done' },
          });
        });
      }})()`,
    });
  }

  getVideoDetails(): void {
    chrome.tabs.executeScript(
      {
        code: `(${() => {
          const $textTotalDuration =
            document.querySelector('.ytp-time-duration');
          const $video = document.querySelector('video');
          const $title = document.querySelector(
            '.title.style-scope.ytd-video-primary-info-renderer'
          );

          const videoInfo = {
            totalDurationText: $textTotalDuration?.textContent,
            currentDurationInSeconds: $video?.currentTime,
            totalDurationInSeconds: $video?.duration,
            title: $title?.textContent,
          };

          return videoInfo;
        }})()`,
      },
      (result) => this.updateVideoInfo(result)
    );
  }

  updateVideoInfo(data: any) {
    const dataParsed = data[0] as VideoInfo;
    this.video = dataParsed;
    const { title, totalDurationText } = dataParsed;
    this.$duration.nativeElement.innerText = totalDurationText;
    this.$title.nativeElement.innerText = title;
  }

  post() {
    const myData = {
      Id: 0,
      Materia: {
        Id: 6496550,
      },
      Tipo: 'manual',
      Conteudo: {
        Id: this.selectedType.value,
      },
      DataInicio: this.getCurrentDate(),
      HoraInicio: this.getCurrentTime(),
      Anotacoes: `${this.video.title}`,
      Duracao: this.video.totalDurationInSeconds * 1000,
    };

    this.http
      .post('https://aprovadoapp.com/service/Atividade/Novo', myData, {
        withCredentials: true,
      })
      .subscribe(
        () => this.toast.success('atividade salva'),
        (error: HttpErrorResponse) => {
          if (error.status === 401) {
            this.toast.error('Você não está logado');
          }
          this.toast.error(error.message);
        }
      );
  }

  async login() {
    const response = await this.http
      .post(
        'https://aprovadoapp.com/service/Usuario/Autenticar',
        this.userForm.value,
        {
          observe: 'response',
        }
      )
      .toPromise();

    response.headers.set('Set-Cookie', 'session_token');
  }

  getCurrentTime() {
    return new Date().toString().slice(16, 21);
  }

  getCurrentDate() {
    return new Date().toLocaleDateString('pt-br');
  }

  extractDuration(duration: string) {
    let totalDuration = duration.split('/')[1].trim();
    totalDuration = totalDuration.match(/\d+:\d+:?\d+/g)![0];
    return totalDuration;
  }

  checkIfIsLogged() {
    this.http.get('https://aprovadoapp.com/service/Usuario/Obter').subscribe(
      () => (this.isLogged = true),
      () => (this.isLogged = false)
    );
  }
}
