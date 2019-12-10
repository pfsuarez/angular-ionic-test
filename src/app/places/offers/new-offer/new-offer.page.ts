import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { LoadingController } from '@ionic/angular';

import { PlaceLocation } from './../../location.model';
import { PlacesService } from './../../places.service';

@Component({
  selector: 'app-new-offer',
  templateUrl: './new-offer.page.html',
  styleUrls: ['./new-offer.page.scss'],
})
export class NewOfferPage implements OnInit {
  form: FormGroup;

  constructor(
    private loadingController: LoadingController,
    private router: Router,
    private placesService: PlacesService
  ) { }

  ngOnInit() {
    this.form = new FormGroup({
      title: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required]
      }),
      description: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required, Validators.maxLength(180)]
      }),
      price: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required, Validators.min(1)]
      }),
      dateFrom: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required]
      }),
      dateTo: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required]
      }),
      location: new FormControl(null, {
        validators: [Validators.required]
      })
    });
  }

  onCreateOffer() {
    if (!this.form.valid) {
      return;
    }

    this.loadingController.create({
      message: 'Creating Place...'
    }).then(loadingEl => {
      loadingEl.present();

      const title = this.form.value.title;
      const description = this.form.value.description;
      const price = +this.form.value.price;
      const dateFrom = new Date(this.form.value.dateFrom);
      const dateTo = new Date(this.form.value.dateTo);
      const location = this.form.value.location;

      this.placesService.addPlace(title, description, price, dateFrom, dateTo, location)
        .subscribe(() => {
          this.form.reset();
          loadingEl.dismiss();
          this.router.navigateByUrl('/places/tabs/offers');
        });
    });
  }

  onLocationPicked(location: PlaceLocation) {
    this.form.controls.location.patchValue(location);
    // this.form.patchValue({location});
  }

  onImagePicked(imageData: string) {
    console.log(imageData);
  }
}
