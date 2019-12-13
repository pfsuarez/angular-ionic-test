import { switchMap } from 'rxjs/operators';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { LoadingController } from '@ionic/angular';

import { PlaceLocation } from './../../location.model';
import { PlacesService } from './../../places.service';

function base64toBlob(base64Data, contentType) {
  contentType = contentType || '';
  const sliceSize = 1024;
  const byteCharacters = atob(base64Data);
  const bytesLength = byteCharacters.length;
  const slicesCount = Math.ceil(bytesLength / sliceSize);
  const byteArrays = new Array(slicesCount);

  for (let sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
    const begin = sliceIndex * sliceSize;
    const end = Math.min(begin + sliceSize, bytesLength);

    const bytes = new Array(end - begin);
    for (let offset = begin, i = 0; offset < end; ++i, ++offset) {
      bytes[i] = byteCharacters[offset].charCodeAt(0);
    }
    byteArrays[sliceIndex] = new Uint8Array(bytes);
  }
  return new Blob(byteArrays, { type: contentType });
}

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
      }),
      image: new FormControl(null)
    });
  }

  onCreateOffer() {
    if (!this.form.valid || !this.form.get('image').value) {
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
      const image = this.form.value.image;

      this.placesService.uploadImage(image)
        .pipe(
          switchMap(uploadRes => {
            return this.placesService.addPlace(title, description, price, uploadRes.imageUrl, dateFrom, dateTo, location);
          })
        )
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

  onImagePicked(imageData: string | File) {
    console.log(imageData);
    let imageFile;
    if (typeof imageData === 'string') {
      try {
        imageFile = base64toBlob(imageData.replace('data:image/jpeg;base64', ''), 'image/jpeg');
      } catch (error) {
        console.log(error);
        return;
      }
    } else {
      imageFile = imageData;
    }

    this.form.patchValue({ image: imageFile });
  }
}
