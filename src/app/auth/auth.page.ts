import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';

import { LoadingController, AlertController } from '@ionic/angular';

import { AuthService } from './auth.service';

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
    this.authService.login();

    this.loadingCtrl.create({
      keyboardClose: true,
      message: 'Logging in...'
    }).then(loadingEL => {
      loadingEL.present();

      let service;

      if (this.isLoginMode) {

      } else {
        service = this.authService.signup(email, password);
      }

      service.subscribe(resData => {
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
  }

  private showAlert(message: string) {
    this.alertCtrl.create({
      header: 'Authenticated Failed',
      message,
      buttons: ['Ok']
    }).then(alertEl => alertEl.present());
  }
}
