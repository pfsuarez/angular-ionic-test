import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

import { LoadingController, AlertController } from '@ionic/angular';

import { AuthService, AuthResponseData } from './auth.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
})
export class AuthPage implements OnInit {
  isLoading = false;
  isLoginMode = true;

  constructor(
    private router: Router,
    private authService: AuthService,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController
  ) { }

  ngOnInit() {
  }

  authenticate(email: string, password: string) {
    this.isLoading = true;
    // this.authService.login();

    this.loadingCtrl.create({
      keyboardClose: true,
      message: 'Logging in...'
    }).then(loadingEL => {
      loadingEL.present();

      let authObs: Observable<AuthResponseData>;

      if (this.isLoginMode) {
        authObs = this.authService.login(email, password);
      } else {
        authObs = this.authService.signup(email, password);
      }

      authObs.subscribe(resData => {
        console.log('', resData);
        this.isLoading = false;
        loadingEL.dismiss();
        this.router.navigateByUrl('/places/tabs/discover');
      }, errRes => {
        this.isLoading = false;
        loadingEL.dismiss();
        const code = errRes.error.error.message;
        let message = 'Could not sign  you up, please try again.';

        switch (code) {
          case 'EMAIL_EXISTS':
            message = 'This email exists already!';
            break;
          case 'INVALID_PASSWORD':
            message = 'This password is not correct.';
            break;
          case 'EMAIL_NOT_FOUND':
            message = 'E-Mail address could not be found';
            break;
        }

        this.showAlert(message);
      });
    });
  }

  onSwitchAuthMode() {
    this.isLoginMode = !this.isLoginMode;
  }

  onSubmit(form: NgForm) {
    if (!form.valid) {
      return;
    }

    const email = form.value.email;
    const password = form.value.password;
    console.log(email, password);

    this.authenticate(email, password);
    form.reset();
  }

  private showAlert(message: string) {
    this.alertCtrl.create({
      header: 'Authenticated Failed',
      message,
      buttons: ['Ok']
    }).then(alertEl => alertEl.present());
  }
}
