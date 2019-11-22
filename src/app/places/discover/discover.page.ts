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
    if (event.detail.value === 'all') {
      this.relevantPlaces = this.loadedPlaces;
      this.listedLoadedPlaces = this.relevantPlaces.slice(1);
    } else {
      this.relevantPlaces = this.loadedPlaces.filter(place => place.userId !== this.authService.UserId);
      this.listedLoadedPlaces = this.relevantPlaces.slice(1);
    }
  }
}
