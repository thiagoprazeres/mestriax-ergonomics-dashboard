export interface Client {
  id: string;
  name: string;
  slug: string;
}

export interface Unit {
  id: string;
  name: string;
  slug: string;
  clientSlug: string;
  location: string;
}
