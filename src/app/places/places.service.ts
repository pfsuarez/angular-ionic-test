import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { take, map } from 'rxjs/operators';

import { Place } from './place.model';
import { AuthService } from './../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class PlacesService {
  private places = new BehaviorSubject<Place[]>([
    new Place(
      'p1',
      'Manhattan Mansion',
      'In the heart of New York City.',
      'https://lonelyplanetimages.imgix.net/mastheads/GettyImages-538096543_medium.jpg?sharp=10&vib=20&w=1200',
      149.99,
      new Date('2019-01-01'),
      new Date('2019-12-31'),
      'abc'
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
      'p3',
      'The Foggy Palace',
      'Not your average city trip!',
      'https://upload.wikimedia.org/wikipedia/commons/0/01/San_Francisco_with_two_bridges_and_the_fog.jpg',
      99.99,
      new Date('2019-11-01'),
      new Date('2019-11-15'),
      'abc'
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

  constructor(private authService: AuthService) { }

  addPlace(title: string, description: string, price: number, dateFrom: Date, dateTo: Date) {
    const id = Math.random().toString();
    const imageUrl = 'http://www.larotativadigital.com.ar/wp-content/uploads/2017/12/Bariloche_Puente-Lagos-verano.jpg';
    const newPlace = new Place(id, title, description, imageUrl, price, dateFrom, dateTo, this.authService.UserId);

    this.places
      .pipe(take(1))
      .subscribe((places) => {
        this.places.next(places.concat(newPlace));
      });
  }
}
