import { type SidebarItem } from './sidebar';

export const sectionItems: SidebarItem[] = [
  {
    key: 'overview',
    title: 'Overview',
    items: [
      {
        key: 'home',
        href: '/',
        icon: 'solar:home-2-bold-duotone',
        title: 'Home'
      },
      {
        key: 'shipments',
        href: '/dashboard/shipments',
        icon: 'solar:box-minimalistic-bold-duotone',
        title: 'Shipments'
      }
    ]
  }
];

export const sectionItemsWithTeams: SidebarItem[] = [...sectionItems];
