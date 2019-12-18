import { take, tap, switchMap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { Injectable } from '@angular/core';
import { CanLoad, Route, UrlSegment, Router } from '@angular/router';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanLoad {
  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  canLoad(route: Route, segments: UrlSegment[]): boolean | Observable<boolean> | Promise<boolean> {
    return this.authService.userIsAuthenticated
      .pipe(
        take(1),
        switchMap(isAuthenticated => {
          if (!isAuthenticated) {
            return this.authService.autoLogin();
          } else {
            return of(isAuthenticated);
          }
        }),
        tap(isAuthenticated => {
          if (!isAuthenticated) {
            this.router.navigateByUrl('/auth');
          }
        })
      );
  }
}
