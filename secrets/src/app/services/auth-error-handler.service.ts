import { Injectable } from '@angular/core';
import { ToastService } from './toast.service';
import { FirebaseError } from '@angular/fire/app';

@Injectable({
  providedIn: 'root',
})
export class AuthErrorHandlerService {
  constructor(private toast: ToastService) {}

  handleAuthError(error: any) {
    let errorMessage = 'Something went wrong. Please try again.';

    if (!(error instanceof FirebaseError)) {
      this.toast.showErrorToast(errorMessage);
      return;
    }

    switch (error.code) {
      case 'auth/email-already-exists':
      case 'auth/email-already-in-use':
        errorMessage =
          'This email is already in use. Please use a different one.';
        break;

      case 'auth/invalid-email':
        errorMessage =
          'Invalid email format. Please enter a valid email address.';
        break;

      case 'auth/user-not-found':
        errorMessage =
          'No user found with this email. Please check and try again.';
        break;

      case 'auth/wrong-password':
        errorMessage = 'Incorrect password. Please try again.';
        break;

      case 'auth/id-token-expired':
      case 'auth/id-token-revoked':
        errorMessage = 'Your session has expired. Please log in again.';
        break;

      case 'auth/too-many-requests':
        errorMessage = 'Too many attempts. Please try again later.';
        break;

      case 'auth/invalid-credential':
        errorMessage = 'Invalid credentials. Please check and try again.';
        break;

      case 'auth/network-request-failed':
        errorMessage = 'Network error. Please check your internet connection.';
        break;

      case 'auth/operation-not-allowed':
        errorMessage = 'This operation is not allowed. Please contact support.';
        break;

      case 'auth/weak-password':
        errorMessage = 'Password should be at least 6 characters long.';
        break;

      default:
        console.error('Unhandled Firebase Auth Error:', error);
    }

    this.toast.showErrorToast(errorMessage);
  }
}
