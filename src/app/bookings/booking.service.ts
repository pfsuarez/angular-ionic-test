import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { take, delay, tap } from 'rxjs/operators';

import { Booking } from './booking-model';
import { AuthService } from './../auth/auth.service';

@Injectable({
    providedIn: 'root'
})
export class BookingService {
    private pBookings = new BehaviorSubject<Booking[]>([]);

    get bookings() {
        return this.pBookings.asObservable();
    }

    constructor(private authService: AuthService) { }

    addBooking(
        placeId: string,
        placeTitle: string,
        placeImage: string,
        firstName: string,
        lastName: string,
        guestNumber: number,
        dateFrom: Date,
        dateTo: Date) {

        const newBooking = new Booking(
            Math.random().toString(),
            placeId,
            this.authService.UserId,
            placeTitle,
            placeImage,
            firstName,
            lastName,
            guestNumber,
            dateFrom,
            dateTo);

        return this.bookings.
            pipe(
                take(1),
                delay(500),
                tap(bookings => {
                    this.pBookings.next(bookings.concat(newBooking));
                })
            );

    }

    cancelBooking(id: string) {
        return this.bookings.
            pipe(
                take(1),
                delay(500),
                tap(bookings => {
                    this.pBookings.next(bookings.filter(b => b.id !== id));
                })
            );
    }
}
