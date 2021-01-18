import { LightningElement, api, wire, track } from "lwc";
import getAllReviews from "@salesforce/apex/BoatDataService.getAllReviews";
import { NavigationMixin } from "lightning/navigation";

export default class BoatReviews extends NavigationMixin(LightningElement) {
  boatId;
  error;

  @track
  boatReviews;

  isLoading = false;

  @api
  get recordId() {
    return this.boatId;
  }
  set recordId(value) {
    this.boatId = value;
    this.getReviews();
  }

  get reviewsToShow() {
    return this.boatReviews && this.boatReviews.length > 0;
  }

  @api
  refresh() {
    this.getReviews();
  }
  getReviews() {
    let boatId = this.boatId;
    if (!boatId) {
      return;
    }

    this.isLoading = true;

    getAllReviews({ boatId: boatId })
      .then((result) => {
        this.boatReviews = result;
        this.isLoading = false;
      })
      .catch((error) => {
        this.error = error;
        this.isLoading = false;
      });
  }

  navigateToRecord(event) {
    console.log(event.target.dataset.recordId);
    let recordId = event.target.dataset.recordId;
    this[NavigationMixin.Navigate]({
      type: "standard__recordPage",
      attributes: {
        recordId: recordId,
        objectApiName: "User",
        actionName: "view",
      },
    });
  }
}
