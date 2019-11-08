import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isUserAuthenticated = false;

  get userIsAuthenticated() {
    return this.isUserAuthenticated;
  }

  constructor() { }

  login() {
    this.isUserAuthenticated = true;
  }

  logout() {
    this.isUserAuthenticated = false;
  }
}
