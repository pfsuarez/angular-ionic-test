import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { ModalController, ActionSheetController, AlertController } from '@ionic/angular';
import { Plugins, Capacitor } from '@capacitor/core';

import { environment } from 'src/environments/environment';
import { MapModalComponent } from './../../map-modal/map-modal.component';
import { PlaceLocation, Coordinates } from './../../../places/location.model';


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
    private http: HttpClient,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private actionSheetCtrl: ActionSheetController
  ) { }

  ngOnInit() { }

  onPickLocation() {
    this.actionSheetCtrl.create({
      header: 'Please Choose',
      buttons: [
        {
          text: 'Auto-Locate',
          handler: () => {
            this.locateUser();
          }
        },
        {
          text: 'Pick on Map',
          handler: () => {
            this.openMap();
          }
        },
        {
          text: 'Cancel',
          role: 'cancel'
        },
      ]
    })
      .then(actionSheetEl => {
        actionSheetEl.present();
      });
  }

  private locateUser() {
    if (!Capacitor.isPluginAvailable('Geolocation')) {
      this.showErrorAlert();
      return;
    }

    this.isLoading = true;

    Plugins.Geolocation.getCurrentPosition()
      .then(geoPosition => {
        console.log('', geoPosition);
        const coordinates: Coordinates = {
          lat: geoPosition.coords.latitude,
          lng: geoPosition.coords.longitude
        };

        this.createPlace(coordinates);
        this.isLoading = false;
        /*
          coords: Coordinates
            accuracy: 29
            altitude: null
            altitudeAccuracy: null
            heading: null
            latitude: 43.9121021
            longitude: 72.332892
            speed: null
        */
      })
      .catch(err => {
        this.showErrorAlert();
        this.isLoading = false;
      });
  }

  private showErrorAlert() {
    this.alertCtrl.create({
      header: 'Could not fetch location',
      message: 'Please use the map to pick a location!',
      buttons: ['Ok']
    }).then(alertEl => alertEl.present());
  }

  private createPlace(coordinates: Coordinates) {
    this.isLoading = true;

    const pickedLocation: PlaceLocation = {
      lat: coordinates.lat,
      lng: coordinates.lng,
      address: null,
      staticMapImageUrl: null
    };

    this.getAddress(coordinates.lat, coordinates.lng)
      .pipe(
        switchMap(address => {
          pickedLocation.address = address;

          return of(this.getMapImage(pickedLocation.lat, pickedLocation.lng, 16));
        })
      )
      .subscribe(staticMapImage => {
        pickedLocation.staticMapImageUrl = staticMapImage;
        this.selectedLocationImage = staticMapImage;
        this.isLoading = false;
        this.locationPick.emit(pickedLocation);
      });
  }

  private openMap() {
    this.modalCtrl.create({
      component: MapModalComponent
    }).then(modalEl => {
      modalEl.onDidDismiss().then(modalData => {
        console.log('', modalData.data);
        if (!modalData.data) {
          return;
        }

        const coordinates: Coordinates = {
          lat: modalData.data.lat,
          lng: modalData.data.lng
        };

        this.createPlace(coordinates);

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
