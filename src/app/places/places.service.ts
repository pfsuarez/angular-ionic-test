import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, of, pipe } from 'rxjs';
import { take, map, tap, delay, switchMap } from 'rxjs/operators';

import { Place } from './place.model';
import { PlaceLocation } from './location.model';
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
  location: PlaceLocation;
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
    return this.authService.token
      .pipe(
        take(1),
        switchMap(token => {
          return this.http.get<{ [key: string]: PlaceData }>(`${environment.firebaseOfferedPlacesUrl}.json?auth=${token}`);
        }),
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
                data.userId,
                data.location));
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
    return this.authService.token.pipe(
      take(1),
      switchMap(token => {
        return this.http.get<PlaceData>(`${environment.firebaseOfferedPlacesUrl}/${id}.json?auth=${token}`);
      }),
      map(placeData => {
        return new Place(
          id,
          placeData.title,
          placeData.description,
          placeData.imageUrl,
          placeData.price,
          new Date(placeData.availableFrom),
          new Date(placeData.availableTo),
          placeData.userId,
          placeData.location);
      })
    );
  }

  uploadImage(image: File) {
    const uploadData = new FormData();
    uploadData.append('image', image);

    return this.authService.token.pipe(
      take(1),
      switchMap(token => {
        return this.http.post<{ imageUrl: string, imagePath: string }>
          (environment.firebaseUploadImageUrl,
            uploadData,
            {
              headers: {
                Authorization: 'Bearer ' + token
              }
            }
          );
      })
    );


  }

  addPlace(
    title: string,
    description: string,
    price: number,
    imageUrl: string,
    dateFrom: Date,
    dateTo: Date,
    location: PlaceLocation
  ) {
    let generatedId: string;
    let fetchedUserId: string;
    const id = Math.random().toString();
    let newPlace: Place;

    return this.authService.UserId.
      pipe(
        take(1),
        switchMap(userId => {
          fetchedUserId = userId;
          return this.authService.token;
        }),
        take(1),
        switchMap(token => {
          if (!fetchedUserId) {
            throw new Error('No User found!');
          }
          newPlace = new Place(id, title, description, imageUrl, price, dateFrom, dateTo, fetchedUserId, location);

          return this.http.post<{ name: string }>
            (`${environment.firebaseOfferedPlacesUrl}.json`, { ...newPlace, id: null },
              {
                headers: {
                  Authorization: 'Bearer ' + token
                }
              });
        }),
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
    let fetchedToken: string;

    return this.authService.token.pipe(
      take(1),
      switchMap(token => {
        fetchedToken = token;
        return this.getPlaces();
      }),
      take(1),
      switchMap(places => {
        if (!places || places.length === 0) {
          return this.fetchPlaces();
        } else {
          return of(places);
        }
      }),
      switchMap(places => {
        updatedPlaces = [...places];
        const index = places.findIndex(x => x.id === id);
        const place = updatedPlaces[index]; // new Place();

        place.title = title;
        place.description = description;

        updatedPlaces[index] = place;

        return this.http.put(`${environment.firebaseOfferedPlacesUrl}/${id}.json`,
          { ...place, id: null },
          {
            headers: {
              Authorization: 'Bearer ' + fetchedToken
            }
          });
      }),
      tap(() => {
        this.places.next(updatedPlaces);
      })
    );
  }
}
