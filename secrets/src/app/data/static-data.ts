export const vibrantColors = [
  '#007bff', // Electric Blue
  '#ff007f', // Neon Pink
  '#32ff7e', // Lime Green
  '#ff5733', // Sunset Orange
  '#ffcc00', // Bright Yellow
  '#9b59b6', // Purple Vibe
];

export const bottomTabs = [
  {
    name: 'Home',
    route: 'dashboard',
    icon: 'home-outline',
    iconActive: 'home',
    active: true,
  },
  {
    name: 'Folders',
    route: 'my-folders',
    icon: 'folder-open-outline',
    iconActive: 'folder-open',
    active: false,
  },
  {
    name: 'Add',
    route: 'add-secret',
    icon: 'add-outline',
    iconActive: 'add',
    active: false,
  },
  {
    name: 'Favorites',
    route: 'favorites',
    icon: 'heart-outline',
    iconActive: 'heart',
    active: false,
  },
  {
    name: 'Profile',
    route: 'profile',
    icon: 'person-outline',
    iconActive: 'person',
    active: false,
  },
];

export const profileExtrasOne = [
  {
    name: 'Two-step verification',
    icon: 'key',
  },
  {
    name: 'Archives',
    icon: 'archive',
    route: 'archives',
  },
];

export const profileExtrasTwo = [
  {
    name: 'About us',
    icon: 'people',
  },
  {
    name: 'Help',
    icon: 'information-circle',
  },
  {
    name: 'Feedback',
    icon: 'mail',
  },
  {
    name: 'Sign out',
    icon: 'log-out',
  },
];
