import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { take, delay, tap, switchMap, map } from 'rxjs/operators';

import { Booking } from './booking-model';
import { AuthService } from './../auth/auth.service';
import { environment } from 'src/environments/environment';

interface BookingData {
    bookedFrom: string;
    bookedTo: string;
    firstName: string;
    lastName: string;
    guestNumber: number;
    placeId: string;
    placeImage: string;
    placeTitle: string;
    userId: string;
}

@Injectable({
    providedIn: 'root'
})
export class BookingService {
    private pBookings = new BehaviorSubject<Booking[]>([]);

    get bookings() {
        return this.pBookings.asObservable();
    }

    constructor(
        private authService: AuthService,
        private http: HttpClient
    ) { }

    fetchBookings() {
        let fetchedUserId: string;

        return this.authService.UserId
            .pipe(
                take(1),
                switchMap(userId => {
                    fetchedUserId = userId;
                    return this.authService.token;
                }),
                take(1),
                switchMap(token => {
                    if (!fetchedUserId) {
                        throw new Error('User not found');
                    }

                    return this.http.get<{ [key: string]: BookingData }>
                        (`${environment.firebaseBookedPlacesUrl}.json?auth=${token}&orderBy="userId"&equalTo="${fetchedUserId}"`);
                }),
                map(resData => {
                    const bookings: Booking[] = [];
                    for (const key in resData) {
                        if (resData.hasOwnProperty(key)) {
                            const booking = resData[key];
                            bookings.push(new Booking(
                                key,
                                booking.placeId,
                                booking.userId,
                                booking.placeTitle,
                                booking.placeImage,
                                booking.firstName,
                                booking.lastName,
                                booking.guestNumber,
                                new Date(booking.bookedFrom),
                                new Date(booking.bookedTo)
                            ));
                        }
                    }
                    return bookings;
                }),
                tap(bookings => {
                    this.pBookings.next(bookings);
                })
            );
    }

    addBooking(
        placeId: string,
        placeTitle: string,
        placeImage: string,
        firstName: string,
        lastName: string,
        guestNumber: number,
        dateFrom: Date,
        dateTo: Date) {

        let generatedId: string;
        let newBooking: Booking;
        let fetchedUserId: string;

        return this.authService.UserId
            .pipe(
                take(1),
                switchMap(userId => {
                    fetchedUserId = userId;
                    return this.authService.token;
                }),
                take(1),
                switchMap(token => {
                    if (!fetchedUserId) {
                        throw new Error('No user id found');
                    }

                    newBooking = new Booking(
                        Math.random().toString(),
                        placeId,
                        fetchedUserId,
                        placeTitle,
                        placeImage,
                        firstName,
                        lastName,
                        guestNumber,
                        dateFrom,
                        dateTo);
                    return this.http.post<{ name: string }>
                        (`${environment.firebaseBookedPlacesUrl}.json`,
                            { ...newBooking, id: null },
                            {
                                headers: {
                                    Authorization: 'Bearer ' + token
                                }
                            });
                }),
                switchMap(resData => {
                    generatedId = resData.name;
                    return this.bookings;
                }),
                take(1),
                tap(bookings => {
                    newBooking.id = generatedId;
                    this.pBookings.next(bookings.concat(newBooking));
                })
            );
    }

    cancelBooking(id: string) {
        return this.authService.token.pipe(
            take(1),
            switchMap(token => {
                return this.http.delete(`${environment.firebaseBookedPlacesUrl}/${id}.json?auth=${token}`);
            }),
            switchMap(() => {
                return this.bookings;
            }),
            take(1),
            tap(bookings => {
                this.pBookings.next(bookings.filter(b => b.id !== id));
            })
        );
    }
}
