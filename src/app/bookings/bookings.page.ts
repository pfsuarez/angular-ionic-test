import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { IonItemSliding, LoadingController } from '@ionic/angular';

import { Booking } from './booking-model';
import { BookingService } from './booking.service';

@Component({
  selector: 'app-bookings',
  templateUrl: './bookings.page.html',
  styleUrls: ['./bookings.page.scss'],
})
export class BookingsPage implements OnInit, OnDestroy {
  loadedBookings: Booking[];
  isLoading = false;
  private bookingSub: Subscription;

  constructor(
    private bookingService: BookingService,
    private loadingCtrl: LoadingController
  ) { }

  ngOnInit() {
    this.bookingSub = this.bookingService.bookings.subscribe(bookings => {
      this.loadedBookings = bookings;
    });
  }

  ionViewWillEnter() {
    this.isLoading = true;
    this.bookingService.fetchBookings().subscribe(() => this.isLoading = false);
  }

  ngOnDestroy() {
    if (this.bookingSub) {
      this.bookingSub.unsubscribe();
    }
  }

  onCancelBooking(bookingId: string, slidingItemBooking: IonItemSliding) {
    slidingItemBooking.close();
    this.loadingCtrl.create({
      message: 'Cancelling Booking...'
    }).then(loadingEl => {
      loadingEl.present();

      this.bookingService.cancelBooking(bookingId)
        .subscribe(() => loadingEl.dismiss());
    });

  }
}
