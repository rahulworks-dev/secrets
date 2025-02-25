import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { collection } from 'src/app/constants/secret.constant';
import { HelperService } from 'src/app/services/helper.service';
import { IntermediateService } from 'src/app/services/intermediate.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.page.html',
  styleUrls: ['./feedback.page.scss'],
  standalone: false,
})
export class FeedbackPage {
  // Feedback model
  feedback = {
    rating: 0,
    message: '',
  };

  stars = new Array(5);

  constructor(
    private helperService: HelperService,
    private intermediateService: IntermediateService,
    private toast: ToastService,
    private location : Location
  ) {}

  // Set the rating when a star is clicked
  setRating(rating: number) {
    this.feedback.rating = rating;
  }

  // Called when the user clicks the submit button
  async submitFeedback() {
    const loggedInUserDetails =
      await this.helperService.getLoggedInUserDetails();
    if (this.feedback?.rating) {
      const payload = {
        id: loggedInUserDetails.id,
        feedback: this.feedback.message,
        rating: this.feedback.rating,
      };
      this.intermediateService.create(payload, collection.FEEDBACK).subscribe({
        next: () => {
          this.toast.showSuccessToast('Succesfully Shared Feedback');
          this.location.back();
        },
        error: () => {
          this.toast.showErrorToast(
            'We Could not share feedback due to technical issue'
          );
        },
      });
    }
  }
}
