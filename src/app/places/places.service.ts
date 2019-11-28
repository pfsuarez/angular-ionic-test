import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { take, map, tap, delay, switchMap } from 'rxjs/operators';

import { Place } from './place.model';
import { AuthService } from './../auth/auth.service';
import { environment } from 'src/environments/environment';

interface PlaceData {
  availableFrom: string;
  availableTo: string;
  description: string;
  imageUrl: string;
  price: number;
  title: string;
  userId: string;
}

@Injectable({
  providedIn: 'root'
})
export class PlacesService {
  private places = new BehaviorSubject<Place[]>([]);

  getPlaces() {
    return this.places.asObservable();
  }

  constructor(
    private authService: AuthService,
    private http: HttpClient
  ) { }

  fetchPlaces() {
    return this.http.get<{ [key: string]: PlaceData }>(`${environment.firebaseOfferedPlacesUrl}.json`)
      .pipe(
        map(resData => {
          const places: Place[] = [];
          for (const key in resData) {
            if (resData.hasOwnProperty(key)) {
              const data = resData[key];
              places.push(new Place(
                key,
                data.title,
                data.description,
                data.imageUrl,
                data.price,
                new Date(data.availableFrom),
                new Date(data.availableTo),
                data.userId));
            }
          }
          return places;
        }),
        tap(places => {
          this.places.next(places);
        })
      );
  }

  getPlace(id: string) {
    return this.http.get<PlaceData>(`${environment.firebaseOfferedPlacesUrl}/${id}.json`)
      .pipe(
        map(placeData => {
          return new Place(
            id,
            placeData.title,
            placeData.description,
            placeData.imageUrl,
            placeData.price,
            new Date(placeData.availableFrom),
            new Date(placeData.availableTo),
            placeData.userId);
        })
      );
  }

  addPlace(title: string, description: string, price: number, dateFrom: Date, dateTo: Date) {
    let generatedId: string;
    const id = Math.random().toString();
    const imageUrl = 'http://www.larotativadigital.com.ar/wp-content/uploads/2017/12/Bariloche_Puente-Lagos-verano.jpg';
    const newPlace = new Place(id, title, description, imageUrl, price, dateFrom, dateTo, this.authService.UserId);

    return this.http.post<{ name: string }>(`${environment.firebaseOfferedPlacesUrl}.json`, { ...newPlace, id: null })
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
    let updatedPlaces: Place[];
    return this.getPlaces()
      .pipe(
        take(1),
        switchMap(places => {
          updatedPlaces = [...places];
          const index = places.findIndex(x => x.id === id);
          const place = updatedPlaces[index]; // new Place();

          place.title = title;
          place.description = description;

          updatedPlaces[index] = place;

          return this.http.put(`${environment.firebaseOfferedPlacesUrl}/${id}.json`, { ...place, id: null });
        }),
        tap(() => {
          this.places.next(updatedPlaces);
        })
      );
  }
}
