import { LightningElement, wire, api, track } from "lwc";
import {
  APPLICATION_SCOPE,
  createMessageContext,
  MessageContext,
  publish,
  releaseMessageContext,
  subscribe,
  unsubscribe,
} from "lightning/messageService";
import BOATMC from "@salesforce/messageChannel/BoatMessageChannel__c";
import { getRecord } from "lightning/uiRecordApi";
const LONGITUDE_FIELD = "Boat__c.Geolocation__Longitude__s";
const LATITUDE_FIELD = "Boat__c.Geolocation__Latitude__s";
const BOAT_FIELDS = [LONGITUDE_FIELD, LATITUDE_FIELD];

export default class BoatMap extends LightningElement {
  subscription = null;

  @track
  boatId = null;

  @api
  get recordId() {
    return this.boatId;
  }
  set recordId(value) {
    this.setAttribute("boatId", value);
    this.boatId = value;
  }

  @api
  error = undefined;
  @api
  mapMarkers = [];

  @wire(MessageContext)
  messageContext;

  @wire(getRecord, { recordId: "$boatId", fields: BOAT_FIELDS })
  wiredRecord({ error, data }) {
    if (data) {
      this.error = undefined;
      const longitude = data.fields.Geolocation__Longitude__s.value;
      const latitude = data.fields.Geolocation__Latitude__s.value;
      this.updateMap(longitude, latitude);
    } else if (error) {
      this.error = error;
      this.boatId = undefined;
      this.mapMarkers = [];
    }
  }

  connectedCallback() {
    if (this.subscription || this.recordId) {
      return;
    }
    this.subscribeMC();
  }

  disconnectedCallback() {
    unsubscribe(this.subscription);
    this.subscription = null;
  }

  subscribeMC() {
    if (this.subscription) {
      return;
    }
    this.subscription = subscribe(
      this.messageContext,
      BOATMC,
      (message) => {
        this.handleMessage(message);
      },
      { scope: APPLICATION_SCOPE }
    );
  }
  handleMessage(message) {
    console.log(message.boatId);
    console.log(JSON.stringify(message));
    console.log("old boatid" + this.boatId);
    this.boatId = message.boatId;
    console.log("new boatid" + this.boatId);
  }

  updateMap(Longitude, Latitude) {
    this.mapMarkers = [
      {
        location: {
          Latitude,
          Longitude,
        },
      },
    ];
  }

  get showMap() {
    return this.mapMarkers.length > 0;
  }
}
