import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

import { ModalController } from '@ionic/angular';

import { MapModalComponent } from './../../map-modal/map-modal.component';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-location-picker',
  templateUrl: './location-picker.component.html',
  styleUrls: ['./location-picker.component.scss'],
})
export class LocationPickerComponent implements OnInit {

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

        this.getAddress(modalData.data.lat, modalData.data.lng)
          .subscribe(address => {
            console.log(address);
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
}
