import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { NavController, LoadingController, AlertController } from '@ionic/angular';

import { Place } from './../../place.model';
import { PlacesService } from './../../places.service';

@Component({
  selector: 'app-edit-offer',
  templateUrl: './edit-offer.page.html',
  styleUrls: ['./edit-offer.page.scss'],
})
export class EditOfferPage implements OnInit, OnDestroy {
  form: FormGroup;
  place: Place;
  placeId: string;
  isLoading = true;
  private placeSub: Subscription;

  constructor(
    private placesService: PlacesService,
    private alertCtrl: AlertController,
    private navCtrl: NavController,
    private loadingCtrl: LoadingController,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {

    this.route.paramMap.subscribe(paramMap => {
      if (!paramMap.has('placeId')) {
        this.navCtrl.navigateBack('/places/tabs/offers');
        return;
      }

      this.isLoading = true;
      this.placeId = paramMap.get('placeId');

      this.placeSub = this.placesService
        .getPlace(paramMap.get('placeId'))
        .subscribe(place => {
          this.place = place;

          this.form = new FormGroup({
            title: new FormControl(this.place.title, {
              updateOn: 'blur',
              validators: [Validators.required]
            }),
            description: new FormControl(this.place.description, {
              updateOn: 'blur',
              validators: [Validators.required, Validators.maxLength(180)]
            })
          });

          this.isLoading = false;
        }, error => {
          this.alertCtrl.create({
            header: 'An error occurred!',
            message: 'Place could not be fetched. Please try again later.',
            buttons: [
              {
                text: 'Ok',
                handler: () => {
                  this.router.navigateByUrl('/places/tabs/offers');
                }
              }]
          }).then(alertEl => {
            alertEl.present();
          });
        });
    });
  }

  ngOnDestroy() {
    if (this.placeSub) {
      this.placeSub.unsubscribe();
    }
  }

  onUpdateOffer() {
    if (!this.form.valid) {
      return;
    }

    this.loadingCtrl.create({
      message: 'Updating place...'
    }).then(loadEl => {
      loadEl.present();

      const title = this.form.value.title;
      const description = this.form.value.description;


      this.placesService
        .updatePlace(this.place.id, title, description)
        .subscribe(() => {
          this.form.reset();
          loadEl.dismiss();
          this.navCtrl.navigateBack('/places/tabs/offers');
        });
    });
  }

}
