declare module '*.css';
declare module '*.scss';

declare type Order = {
  uuid: string;
  orderNumber?: string;
  display?: string;
  fulfillerStatus?: string | null;
};
