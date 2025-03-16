export const LoginCred = {
  username: 'rahul',
  password: '0000',
};

export const collection = {
  SECRETS: 'secrets',
  USERS: 'users',
  FOLDERS: 'folders',
  NOTIFICATIONS: 'notifications',
  FEEDBACK: 'feedback',
};

export const storage = {
  IS_LOGGED_IN: 'IS_LOGGED_IN',
  SELECTED_SORT: 'SELECTED_SORT',
};

export const messages = {
  GENERAL_ERROR: 'Something Went Wrong, Please try again',
  INVALID_FORM: 'Please fill all the fields',
  INVALID_FULL_NAME: 'Full Name cannot contain special characters or numbers',
  PASSWORD_STRENGTH_ERROR:
    'Oops! Your password needs more strength. Add a mix of uppercase letters, numbers, and special characters.',
  NO_SECRETS: "No secrets added yet. Tap '+ Add' to create your first secret!",
  API_ERROR_MESSAGE: 'Something went wrong! please refresh or try again later.',
  NO_FOLDERS: 'No folders added yet. Create one now!',
  NO_FAVORITES: 'No secrets have been added to favorites yet.',
  FOLDER_NOT_FOUND: "The Folder you're looking for is Not Found",
  NO_SECRETS_IN_FOLDER: "This folder is empty. Click '+' to add a secret.",
  NO_SECRETS_IN_SHARED_FOLDER: 'This Shared folder is empty.',
  NO_ARCHIVES: 'No secrets have been added to Archive yet.',
  NO_SHARED_FOLDER: 'No folders have been shared with you yet.',
  NO_NOTIFICATION_TEXT: 'There are no new Notifications for you.',
  NO_SECRETS_FOUND_ON_SEARCH:
    'Looks like there are no secrets matching your search.',
  EMAIL_VERIFICAION_PENDING:
    'A verification email has been sent to your email address. Please check your inbox (and spam folder) and click the link to verify before logging in.',
  EMAIL_VERIFICATION_RESENT: 'Resent Email Verification Successfully!',
  EMAIL_VERIFIED: 'Your email has been successfully verified! Please Login Now',
};

export const passwordHealth = {
  veryWeak: {
    regex: /^.{1,3}$/,
    color: '#D32F2F',
    width: '25',
    info: 'Too short, must be at least 4 characters.',
    label: 'Very Weak',
  },
  weak: {
    regex: /^(?=.*[a-zA-Z0-9])[a-zA-Z0-9]{4,7}$/,
    color: '#FF3B30',
    width: '33.33',
    info: 'Add numbers & special characters to improve security.',
    label: 'Weak',
  },
  medium: {
    regex: /^(?=.*[a-zA-Z])(?=.*\d|.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    color: '#FFCC00',
    width: '66.66',
    info: 'Strong, but missing either a number, a special character, or an uppercase letter.',
    label: 'Medium',
  },
  strong: {
    regex:
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    color: '#34C759',
    width: '100',
    info: ' Great! Your password is highly secure.',
    label: 'Strong',
  },
};
