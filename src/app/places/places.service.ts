import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { take, map, tap, delay, switchMap } from 'rxjs/operators';

import { Place } from './place.model';
import { AuthService } from './../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class PlacesService {
  private firebaseUrl = '';
  private places = new BehaviorSubject<Place[]>([
    new Place(
      'p1',
      'Manhattan Mansion',
      'In the heart of New York City.',
      'https://lonelyplanetimages.imgix.net/mastheads/GettyImages-538096543_medium.jpg?sharp=10&vib=20&w=1200',
      149.99,
      new Date('2019-01-01'),
      new Date('2019-12-31'),
      'xyz'
    ),
    new Place(
      'p2',
      'L\'Amour Toujours',
      'A romantic place in Paris!',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Paris_Night.jpg/1024px-Paris_Night.jpg',
      189.99,
      new Date('2019-12-01'),
      new Date('2019-12-30'),
      'abc'
    ),
    new Place(
      'p3',
      'The Foggy Palace',
      'Not your average city trip!',
      'https://upload.wikimedia.org/wikipedia/commons/0/01/San_Francisco_with_two_bridges_and_the_fog.jpg',
      99.99,
      new Date('2019-10-01'),
      new Date('2019-10-10'),
      'abc'
    ),
    new Place(
      'p4',
      'The Palace',
      'Not your average city trip!',
      'https://upload.wikimedia.org/wikipedia/commons/0/01/San_Francisco_with_two_bridges_and_the_fog.jpg',
      99.99,
      new Date('2019-11-01'),
      new Date('2019-11-15'),
      'xyz'
    )]
  );

  getPlaces() {
    return this.places.asObservable();
  }

  getPlace(id: string) {
    return this.getPlaces()
      .pipe(
        take(1),
        map(places => {
          return { ...places.find(p => p.id === id) };
        }));
  }

  constructor(
    private authService: AuthService,
    private http: HttpClient
  ) { }

  addPlace(title: string, description: string, price: number, dateFrom: Date, dateTo: Date) {
    let generatedId: string;
    const id = Math.random().toString();
    const imageUrl = 'http://www.larotativadigital.com.ar/wp-content/uploads/2017/12/Bariloche_Puente-Lagos-verano.jpg';
    const newPlace = new Place(id, title, description, imageUrl, price, dateFrom, dateTo, this.authService.UserId);

    return this.http.post<{ name: string }>(this.firebaseUrl, { ...newPlace, id: null })
      .pipe(
        switchMap(resData => {
          generatedId = resData.name;
          return this.getPlaces();
        }),
        take(1),
        tap(places => {
          newPlace.id = generatedId;
          this.places.next(places.concat(newPlace));
        })
      );
  }

  updatePlace(id: string, title: string, description: string) {
    return this.places
      .pipe(
        take(1),
        delay(1000),
        tap(places => {
          const updatedPlaces = [...places];
          const index = places.findIndex(x => x.id === id);
          const place = updatedPlaces[index]; // new Place();
          if (place) {
            place.title = title;
            place.description = description;

            updatedPlaces[index] = place;

            this.places.next(updatedPlaces);
          }
        })
      );
  }
}
