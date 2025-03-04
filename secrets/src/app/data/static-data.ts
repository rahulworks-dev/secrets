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
    route: 'folders?tab=myFolders',
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
    name: 'About Secrets',
    icon: 'people',
    route: 'about-secrets',
  },
  {
    name: 'Help',
    icon: 'information-circle',
  },
  {
    name: 'Feedback',
    icon: 'mail',
    route: 'feedback',
  },
  {
    name: 'Sign out',
    icon: 'log-out',
  },
];

export const sortingList = [
  {
    icon: 'settings-outline',
    icon_active: 'settings',
    name: 'Default',
  },
  {
    icon: 'calendar-outline',
    icon_active: 'calendar',
    name: 'Created Date',
    sort_criteria: 'descending',
    ascending_text: 'Oldest First',
    descending_text: 'Newest First',
  },
  {
    icon: 'calendar-outline',
    icon_active: 'calendar',
    name: 'Modified Date',
    sort_criteria: 'descending',
    ascending_text: 'Oldest First',
    descending_text: 'Newest First',
  },
  {
    icon: 'text-outline',
    icon_active: 'text',
    name: 'Title',
    sort_criteria: 'ascending',
    ascending_text: 'A-Z',
    descending_text: 'Z-A',
  },
];
