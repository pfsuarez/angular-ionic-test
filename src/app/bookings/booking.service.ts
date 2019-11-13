import { Injectable } from '@angular/core';

import { Booking } from './booking-model';

@Injectable({
    providedIn: 'root'
})
export class BookingService {
    private pBookings: Booking[] = [
        {
            id: 'xyz',
            placeId: 'p1',
            placeTitle: 'Manhatan Mansion',
            userId: 'abc',
            guestNumber: 2
        }
    ];

    get bookings() {
        return [...this.pBookings];
    }
}
