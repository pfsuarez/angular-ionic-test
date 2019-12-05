import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { ModalController } from '@ionic/angular';

import { environment } from 'src/environments/environment';
import { MapModalComponent } from './../../map-modal/map-modal.component';
import { PlaceLocation } from './../../../places/location.model';


@Component({
  selector: 'app-location-picker',
  templateUrl: './location-picker.component.html',
  styleUrls: ['./location-picker.component.scss'],
})
export class LocationPickerComponent implements OnInit {
  @Output() locationPick = new EventEmitter<PlaceLocation>();

  selectedLocationImage: string;
  isLoading = false;

  constructor(
    private modalCtrl: ModalController,
    private http: HttpClient
  ) { }

  ngOnInit() { }

  onPickLocation() {
    this.modalCtrl.create({
      component: MapModalComponent
    }).then(modalEl => {
      modalEl.onDidDismiss().then(modalData => {
        console.log('', modalData.data);
        if (!modalData.data) {
          return;
        }

        this.isLoading = true;

        const pickedLocation: PlaceLocation = {
          lat: modalData.data.lat,
          lng: modalData.data.lng,
          address: null,
          staticMapImageUrl: null
        };

        this.getAddress(modalData.data.lat, modalData.data.lng)
          .pipe(
            switchMap(address => {
              pickedLocation.address = address;

              return of(this.getMapImage(pickedLocation.lat, pickedLocation.lng, 14));
            })
          )
          .subscribe(staticMapImage => {
            pickedLocation.staticMapImageUrl = staticMapImage;
            this.selectedLocationImage = staticMapImage;
            this.isLoading = false;
            this.locationPick.emit(pickedLocation);
          });
      });
      modalEl.present();
    });
  }

  private getAddress(lat: number, lng: number) {
    return this.http.get<any>(`${environment.googleGeocodingUrl}&latlng=${lat},${lng}`)
      .pipe(
        map(geoData => {
          console.log('', geoData);
          if (!geoData || !geoData.results || geoData.results === 0) {
            return null;
          }

          return geoData.results[0].formatted_address;
        })
      );
  }

  private getMapImage(lat: number, lng: number, zoom: number) {
    return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=500x300&maptype=roadmap
            &markers=color:red%7Clabel:Place%7C${lat},${lng}&key=${environment.googleApiKey}`;
  }
}
