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
import { getRecord, getFieldValue } from "lightning/uiRecordApi";
import labelDetails from "@salesforce/label/c.Details";
import labelReviews from "@salesforce/label/c.Reviews";
import labelAddReview from "@salesforce/label/c.Add_Review";
import labelFullDetails from "@salesforce/label/c.Full_Details";
import labelPleaseSelectABoat from "@salesforce/label/c.Please_select_a_boat";
import BOAT_OBJECT from "@salesforce/schema/Boat__c";
import BOAT_ID_FIELD from "@salesforce/schema/Boat__c.Id";
import BOAT_NAME_FIELD from "@salesforce/schema/Boat__c.Name";
import { NavigationMixin } from "lightning/navigation";

const BOAT_FIELDS = [BOAT_ID_FIELD, BOAT_NAME_FIELD];

export default class BoatDetailTabs extends NavigationMixin(LightningElement) {
  boatId;
  label = {
    labelDetails,
    labelReviews,
    labelAddReview,
    labelFullDetails,
    labelPleaseSelectABoat,
  };

  get detailsTabIconName() {
    return this.wiredRecord.data ? "utility:anchor" : null;
  }

  @wire(MessageContext)
  messageContext;

  @wire(getRecord, { recordId: "$boatId", fields: BOAT_FIELDS })
  wiredRecord;

  get boatName() {
    return getFieldValue(this.wiredRecord.data, BOAT_NAME_FIELD);
  }

  subscription = null;
  subscribeMC() {
    if (this.subscription) {
      return;
    }
    // Subscribe to the message channel to retrieve the recordID and assign it to boatId.
    this.subscription = subscribe(
      this.messageContext,
      BOATMC,
      (message) => {
        this.boatId = message.recordId;
      },
      { scope: APPLICATION_SCOPE }
    );
  }
  connectedCallback() {
    if (this.subscription || this.recordId) {
      return;
    }
    this.subscribeMC();
  }

  navigateToRecordViewPage() {
    this[NavigationMixin.Navigate]({
      type: "standard__recordPage",
      attributes: {
        recordId: this.boatId,
        objectApiName: "Boat__c",
        actionName: "view",
      },
    });
  }

  handleReviewCreated() {
    this.template.querySelector("lightning-tabset").activeTabValue = "reviews";
    this.template.querySelector("c-boat-reviews").refresh();
  }
}
