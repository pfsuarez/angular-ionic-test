import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isUserAuthenticated = true;
  private pUserId = 'abc';

  get userIsAuthenticated() {
    return this.isUserAuthenticated;
  }

  get UserId() {
    return this.pUserId;
  }

  constructor() { }

  login() {
    this.isUserAuthenticated = true;
  }

  logout() {
    this.isUserAuthenticated = false;
  }
}
