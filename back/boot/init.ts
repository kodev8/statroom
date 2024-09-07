import SubscriptionModel from '~/models/subscription.model';
import { ISubscription } from '#/types/subscription';
import { connectToMongo } from '~/database/mongo_setup';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
dotenv.config();

export const serviceData: ISubscription[] = [
    {
        slug: 'players-coaches-teams',
        target: 'Players, Coaches & Teams',
        long_description:
            'Analyze performance, scout competitors, and fine-tune your game plan. Get started now!',
        short_description:
            'Insights and performance analysis for athletes and coaching staff.',
        plans: [
            {
                title: 'Basic',
                reason: 'For beginners',
                month_price: 11.99,
                annual_price: 119.99,
                features: [
                    'Player performance analytics',
                    'Game history tracking',
                    'Basic team scouting reports',
                ],
                team_size: 1,
                require_setup: false,
                hidden_fees: false,
                individual_configuration: true,
                team_configuration: false,
                included_future_updates: false,
                api_access: false,
                support: true,
                premium_support: false,
            },
            {
                title: 'Pro',
                reason: 'For professionals',
                month_price: 22.99,
                annual_price: 229.99,
                popularity: 'popular',
                features: [
                    'Advanced player metrics and KPIs',
                    'Detailed opponent scouting reports',
                    'Customizable team performance dashboards',
                ],
                team_size: 10,
                require_setup: true,
                hidden_fees: false,
                individual_configuration: true,
                team_configuration: true,
                team_size_configuration: true,
                team_size_limit: 10,
                included_future_updates: true,
                api_access: true,
                api_requests_hourly_limit: 500,
                support: true,
                premium_support: false,
            },
            {
                title: 'Enterprise',
                reason: 'For teams',
                month_price: 34.99,
                annual_price: 349.99,
                features: [
                    'Real-time player and team analytics',
                    'In-depth video analysis and breakdown',
                    'Custom analytics dashboard for the entire team',
                ],
                team_size: 50,
                require_setup: true,
                hidden_fees: false,
                individual_configuration: true,
                team_configuration: true,
                team_size_configuration: true,
                team_size_limit: 50,
                included_future_updates: true,
                api_access: true,
                api_requests_hourly_limit: 1000,
                support: true,
                premium_support: true,
            },
        ],
    },
    {
        slug: 'bookies-betters',
        target: 'Bookies & Betters',
        long_description:
            'Stay ahead of the competition with advanced data insights and market trends. Partner with us for smarter odds management!',
        short_description:
            'Data-driven insights for betting professionals and market traders.',
        plans: [
            {
                title: 'Basic',
                reason: 'For beginners',
                month_price: 12.99,
                annual_price: 129.99,
                features: [
                    'Basic odds comparison',
                    'Betting trend reports',
                    'Market insights for common bets',
                ],
                team_size: 1,
                require_setup: false,
                hidden_fees: false,
                individual_configuration: true,
                team_configuration: false,
                included_future_updates: false,
                api_access: false,
                support: true,
                premium_support: false,
            },
            {
                title: 'Pro',
                reason: 'For professionals',
                month_price: 24.99,
                annual_price: 249.99,
                popularity: 'popular',
                features: [
                    'Real-time odds and market shifts',
                    'Customizable betting alerts',
                    'Advanced trend and market analysis',
                ],
                team_size: 5,
                require_setup: true,
                hidden_fees: false,
                individual_configuration: true,
                team_configuration: true,
                team_size_configuration: true,
                team_size_limit: 5,
                included_future_updates: true,
                api_access: true,
                api_requests_hourly_limit: 500,
                support: true,
                premium_support: false,
            },
            {
                title: 'Enterprise',
                reason: 'For teams',
                month_price: 39.99,
                annual_price: 399.99,
                features: [
                    'Full market coverage with real-time updates',
                    'Bespoke data models for odds management',
                    'Collaboration tools for bookmaker teams',
                ],
                team_size: 25,
                require_setup: true,
                hidden_fees: false,
                individual_configuration: true,
                team_configuration: true,
                team_size_configuration: true,
                team_size_limit: 25,
                included_future_updates: true,
                api_access: true,
                api_requests_hourly_limit: 1500,
                support: true,
                premium_support: true,
            },
        ],
    },
    {
        slug: 'enthusiasts-educators',
        target: 'Enthusiasts & Educators',
        long_description:
            "Whether you're a passionate fan or an educator, dive into real-time sports analytics and data-driven insights. Elevate your knowledge—join us today!",
        short_description:
            'Sports analytics and education tools for fans and professionals alike.',
        plans: [
            {
                title: 'Basic',
                reason: 'For beginners',
                month_price: 8.99,
                annual_price: 89.99,
                features: [
                    'Basic sports statistics access',
                    'Player and team profiles',
                    'Weekly insights and trends newsletter',
                ],
                team_size: 1,
                require_setup: false,
                hidden_fees: false,
                individual_configuration: true,
                team_configuration: false,
                included_future_updates: false,
                api_access: false,
                support: true,
                premium_support: false,
            },
            {
                title: 'Pro',
                reason: 'For professionals',
                month_price: 17.99,
                annual_price: 179.99,
                popularity: 'popular',
                features: [
                    'Advanced analytics for multiple sports',
                    'Interactive learning materials',
                    'Weekly deep-dive reports and trends',
                ],
                team_size: 3,
                require_setup: true,
                hidden_fees: false,
                individual_configuration: true,
                team_configuration: true,
                team_size_configuration: true,
                team_size_limit: 3,
                included_future_updates: true,
                api_access: true,
                api_requests_hourly_limit: 300,
                support: true,
                premium_support: false,
            },
            {
                title: 'Enterprise',
                reason: 'For teams',
                month_price: 29.99,
                annual_price: 299.99,
                features: [
                    'Unlimited access to real-time analytics',
                    'Bespoke educational tools and resources',
                    'Team-based analytics projects and competitions',
                ],
                team_size: 10,
                require_setup: true,
                hidden_fees: false,
                individual_configuration: true,
                team_configuration: true,
                team_size_configuration: true,
                team_size_limit: 10,
                included_future_updates: true,
                api_access: true,
                api_requests_hourly_limit: 800,
                support: true,
                premium_support: true,
            },
        ],
    },
];

const initializeSubscriptionData = async (): Promise<void> => {
    try {
        await SubscriptionModel.deleteMany({});
        await SubscriptionModel.insertMany(serviceData);
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        console.log('Subscription data initialized');
    } catch (error) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        console.error('Error initializing subscription data', error);
    }
};

(async (): Promise<void> => {
    try {
        await connectToMongo();
        await initializeSubscriptionData();
    } catch (error) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        console.error('Error initializing subscription data', error);
    } finally {
        mongoose.connection.close();
        process.exit();
    }
})();
