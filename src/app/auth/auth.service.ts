import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { Plugins } from '@capacitor/core';

import { environment } from 'src/environments/environment';
import { User } from './user.model';

export interface AuthResponseData {
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  registered?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private user = new BehaviorSubject<User>(null);

  get userIsAuthenticated() {
    return this.user.asObservable()
      .pipe(
        map(user => {
          if (user) {
            return !!user.token;
          } else {
            return false;
          }
        })
      );
  }

  get UserId() {
    return this.user.asObservable()
      .pipe(
        map(user => {
          if (user) {
            return user.id;
          } else {
            return null;
          }
        })
      );
  }

  constructor(
    private http: HttpClient
  ) { }

  signup(email: string, password: string) {
    return this.http.post<AuthResponseData>(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${environment.firebaseApiKey}`,
      {
        email,
        password,
        returnSecureToken: true
      })
      .pipe(
        tap(userData => this.setUserData(userData))
      );
  }

  login(email: string, password: string) {
    return this.http.post<AuthResponseData>(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${environment.firebaseApiKey}`,
      {
        email,
        password,
        returnSecureToken: true
      }
    )
      .pipe(
        tap(userData => this.setUserData(userData))
      );
  }

  logout() {
    this.user.next(null);
  }

  private setUserData(userData: AuthResponseData) {
    const expirationTime = new Date(new Date().getTime() + (+userData.expiresIn * 1000));
    this.user.next(new User(
      userData.localId,
      userData.email,
      userData.idToken,
      expirationTime
    ));
    this.storeAuthData(userData.localId, userData.idToken, expirationTime.toISOString());
  }

  private storeAuthData(userId: string, token: string, tokenExpirationDate: string) {
    const data = {
      userId,
      token,
      tokenExpirationDate
    };
    Plugins.Storage.set({
      key: 'authData',
      value: JSON.stringify(data)
    });
  }
}
