import { LightningElement, wire, api, track } from "lwc";
import getBoatsByLocation from "@salesforce/apex/BoatDataService.getBoatsByLocation";
const LABEL_YOU_ARE_HERE = "You are here!";
const ICON_STANDARD_USER = "standard:user";
const ERROR_TITLE = "Error loading Boats Near Me";
const ERROR_VARIANT = "error";
import { ShowToastEvent } from "lightning/platformShowToastEvent";

export default class BoatsNearMe extends LightningElement {
  @api
  boatTypeId;

  @track
  mapMarkers = [];
  isLoading = true;
  latitude;
  longitude;

  @wire(getBoatsByLocation, {
    latitude: "$latitude",
    longitude: "$longitude",
    boatTypeId: "$boatTypeId",
  })
  wiredBoatsJSON({ error, data }) {
    console.log("data => " + data);
    if (data) {
      this.createMapMarkers(JSON.parse(data));
      this.isLoading = false;
    } else {
      if (error) {
        console.log("error in data before create map =>" + error);
        this.dispatchEvent(
          new ShowToastEvent({
            title: ERROR_TITLE,
            message: error,
            variant: ERROR_VARIANT,
          })
        );
        this.isLoading = false;
      } else {
        console.log("error in data and error before create map");
      }
    }
  }

  getLocationFromBrowser() {
    console.log("try to get longitude and lotitude");
    window.navigator.geolocation.getCurrentPosition((position) => {
      this.latitude = position.coords.latitude;
      this.longitude = position.coords.longitude;
    });
  }
  renderedCallback() {
    if (!this.isRendered) {
      this.getLocationFromBrowser();
      console.log(this);
      console.log("latitdue from browser " + this.latitude);
      console.log("longitude from browser " + this.longitude);
      this.isRendered = true;
    }
  }

  createMapMarkers(boatData) {
    const newMarkers = boatData.map((boat) => {
      return {
        location: {
          Latitude: boat.Geolocation__Latitude__s,
          Longitude: boat.Geolocation__Longitude__s,
        },
        title: boat.Name,
      };
    });
    newMarkers.unshift({
      location: {
        Latitude: this.latitude,
        Longitude: this.longitude,
      },
      title: LABEL_YOU_ARE_HERE,
      icon: ICON_STANDARD_USER,
    });

    this.mapMarkers = newMarkers;
  }
}
