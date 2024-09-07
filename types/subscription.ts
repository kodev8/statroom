export interface IPlan {
    title: string;
    reason: string;
    month_price: number;
    annual_price: number; 
    features: string[];
    popularity?: 'default' | 'popular' | undefined | null;
    team_size?: number;
    require_setup?: boolean;
    hidden_fees?: boolean;
    individual_configuration?: boolean;
    team_configuration?: boolean;
    team_size_configuration?: boolean;
    team_size_limit?: number;
    included_future_updates?: boolean;
    api_access?: boolean;
    api_requests_hourly_limit?: number;
    support?: boolean;
    premium_support?: boolean;
}

export interface ISubscription {
    slug: string;
    target: string;
    long_description: string;
    short_description: string;
    plans: IPlan[];
}