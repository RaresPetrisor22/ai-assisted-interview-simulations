export const WISHLIST_LIMIT = 10;
export const NOTE_MAX_LENGTH = 200;

export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 50;

export const CAR_STATUSES = ['available', 'pending', 'sold'];
export const FUEL_TYPES = ['petrol', 'diesel', 'hybrid', 'electric'];
export const BODY_TYPES = ['sedan', 'hatchback', 'suv', 'wagon', 'pickup', 'coupe'];
export const USER_ROLES = ['buyer', 'seller'];

export const CAR_SORT_OPTIONS = {
  price_asc: { price: 1, _id: 1 },
  price_desc: { price: -1, _id: 1 },
  year_desc: { year: -1, _id: 1 },
  mileage_asc: { mileage: 1, _id: 1 },
};
