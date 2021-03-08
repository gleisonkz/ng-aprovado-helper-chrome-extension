import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

interface VideoInfo {
  title: string;
  durationInSeconds: number;
  durationText: string;
}

@Component({
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.scss'],
})
export class PopupComponent implements OnInit {
  video: VideoInfo;
  userForm: FormGroup;
  videoForm: FormGroup;
  @ViewChild('$duration') $duration: ElementRef<HTMLSpanElement>;
  @ViewChild('$title') $title: ElementRef<HTMLSpanElement>;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.userForm = new FormGroup({
      email: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required]),
    });

    this.getVideoDetails();
  }

  getVideoDetails(): void {
    chrome.tabs.executeScript(
      {
        code: `(${() => {
          const $duration = document.querySelector('.ytp-time-duration');
          const $durationInSeconds = document.querySelector('video');
          const $title = document.querySelector(
            '.title.style-scope.ytd-video-primary-info-renderer'
          );

          const videoInfo = {
            durationText: $duration?.textContent,
            durationInSeconds: $durationInSeconds?.currentTime,
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
    const { title, durationText } = dataParsed;
    this.$duration.nativeElement.innerText = durationText;
    this.$title.nativeElement.innerText = title;
  }

  login() {
    alert('LOGIN');
  }

  async post() {
    const userLogin = {
      Email: 'gleisonsubzerokz@gmail.com',
      Senha: 'g33888705',
      ManterConectado: true,
    };
    console.log(userLogin);

    const response = await this.http
      .post(
        'https://cors-anywhere.herokuapp.com/https://aprovadoapp.com/service/Usuario/Autenticar',
        userLogin,
        { observe: 'response' }
      )
      .toPromise();

    response.headers.set('Set-Cookie', 'session_token');
    const myData = {
      Id: 0,
      Materia: {
        Id: 6496550,
      },
      Tipo: 'manual',
      Conteudo: {
        Id: 9178637,
      },
      DataInicio: '18/09/2020',
      HoraInicio: '12:13',
      Anotacoes: `${this.video.title}`,
      Duracao: this.video.durationInSeconds,
    };
    const postResponse = await this.http
      .post(
        'https://cors-anywhere.herokuapp.com/https://aprovadoapp.com/service/Usuario/Autenticar',
        myData,
        { withCredentials: true }
      )
      .toPromise();
    console.log(postResponse);

    // .subscribe((response) => {
    //   console.log(response);
    //   console.log(
    //     'cookie',
    //     response.headers.set('Set-Cookie', 'session_token')
    //   );
    // });
  }

  extractDuration(duration: string) {
    let totalDuration = duration.split('/')[1].trim();
    totalDuration = totalDuration.match(/\d+:\d+:?\d+/g)![0];
    return totalDuration;
  }
}
