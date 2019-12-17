import { take } from 'rxjs/operators';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { MenuController } from '@ionic/angular';
import { SegmentChangeEventDetail } from '@ionic/core';

import { Place } from './../place.model';
import { PlacesService } from './../places.service';
import { AuthService } from './../../auth/auth.service';

@Component({
  selector: 'app-discover',
  templateUrl: './discover.page.html',
  styleUrls: ['./discover.page.scss'],
})
export class DiscoverPage implements OnInit, OnDestroy {
  loadedPlaces: Place[];
  listedLoadedPlaces: Place[];
  relevantPlaces: Place[];
  isLoading = false;
  private placesSub: Subscription;

  constructor(
    private menuCtrl: MenuController,
    private placesService: PlacesService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.placesSub = this.placesService.getPlaces().subscribe(places => {
      this.loadedPlaces = places;
      this.relevantPlaces = places;
      this.listedLoadedPlaces = this.relevantPlaces.slice(1);
    });
  }

  ionViewWillEnter() {
    this.isLoading = true;
    this.placesService.fetchPlaces().subscribe(() => {
      this.isLoading = false;
    });
  }

  ngOnDestroy() {
    if (this.placesSub) {
      this.placesSub.unsubscribe();
    }
  }

  onOpenMenu() {
    this.menuCtrl.toggle('mainMenu');
  }

  onFilterUpdate(event: CustomEvent<SegmentChangeEventDetail>) {
    console.log('', event.detail);
    this.authService.UserId
      .pipe(
        take(1)
      )
      .subscribe(userId => {
        if (event.detail.value === 'all') {
          this.relevantPlaces = this.loadedPlaces;
          this.listedLoadedPlaces = this.relevantPlaces.slice(1);
        } else {
          this.relevantPlaces = this.loadedPlaces.filter(place => place.userId !== userId);
          this.listedLoadedPlaces = this.relevantPlaces.slice(1);
        }
      });
  }
}
