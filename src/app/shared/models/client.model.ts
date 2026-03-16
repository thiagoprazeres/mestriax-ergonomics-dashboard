export interface Client {
  name: string;
  slug: string;
  logoUrl?: string;
}

export interface Unit {
  name: string;
  slug: string;
  clientSlug: string;
  location: string;
}
