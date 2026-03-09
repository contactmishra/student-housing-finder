export interface Filters {
    city: string;
    budgetMin: number;
    budgetMax: number;
    roomType: 'single' | 'shared' | 'studio' | 'any';
    furnished: 'yes' | 'no' | 'any';
    listingType: 'private' | 'agency' | 'both';
}

export interface Opportunity {
    title: string;
    price: number;               // €/month
    zone: string;
    size_mq: number | null;
    room_type: 'single' | 'shared' | 'studio' | string;
    furnished: boolean | null;
    listing_type: 'private' | 'agency';
    agency_name: string | null;  // null = private landlord
    description: string;         // first 250 chars
    url: string;
    source: 'idealista' | 'immobiliare';
    scraped_at: string;          // ISO timestamp
}

export type Listing = Opportunity; // Alias to match previous usage
