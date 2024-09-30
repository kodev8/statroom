import { useState, SVGProps } from 'react';
// import { Card, CardTitle } from "../components/ui/card"
import { IPlan, ISubscription } from '#/types/subscription';
import { Button } from '@/components/ui/button';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';
import setTitle from '@/components/hooks/set-title';
import { useLoaderData } from 'react-router-dom';
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from '@/components/ui/table';

// validate the Subscription type


const planCardVariants = cva(
    'flex flex-col items-center justify-between p-6 mx-auto max-w-lg text-center text-gray-900 bg-white rounded-lg border shadow',
    {
        variants: {
            popularity: {
                default:
                    'dark:border-gray-600 xl:p-8 dark:bg-gray-800 dark:text-white',
                popular:
                    'border-blue-500 scale-110 shadow-lg dark:border-blue-500 dark:bg-blue-500 dark:text-white',
            },
        },
        defaultVariants: {
            popularity: 'default',
        },
    }
);

type PlanCardProps = IPlan & {
    className?: string;
    displayAnnual?: boolean;
};

export const PlanCard = ({
    title,
    reason,
    month_price,
    annual_price,
    className,
    popularity = 'default',
    displayAnnual = false,
    features,
    team_size,
    require_setup,
    hidden_fees,
    included_future_updates,
    api_access,
    api_requests_hourly_limit,
    support,
    premium_support,
}: PlanCardProps) => {
    return (
        <div className={cn(planCardVariants({ popularity, className }))}>
            {popularity === 'popular' && (
                <span className="text-xs font-semibold mb-2 text-blue-500 bg-blue-100 p-3 rounded-md mx-auto w-fit dark:text-blue-300">
                    Most popular
                </span>
            )}

            <div>
                {/* Title */}
                <h3 className="mb-4 text-2xl font-semibold">{title}</h3>
                <p className="font-light text-gray-500 sm:text-lg dark:text-gray-400">
                    {reason}
                </p>

                {/* Price */}
                <div className="flex justify-center items-baseline my-8">
                    <span className="mr-2 text-5xl font-extrabold">
                        {displayAnnual ? annual_price : month_price}{' '}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                        /{displayAnnual ? 'year' : 'month'}
                    </span>
                </div>

                {/* Feature List */}
                <ul className="mb-8 space-y-4 text-left">
                    {features.map((feature) => (
                        <SubscriptionFeature key={feature} feature={feature} />
                    ))}
                </ul>
            </div>

            {/* Additional Details */}
            <ul className="mb-4 space-y-2">
                {team_size && (
                    <li>
                        <strong>Team Size: </strong>Up to {team_size} members
                    </li>
                )}
                {require_setup && (
                    <li>
                        <strong>Requires Setup: </strong>Yes
                    </li>
                )}
                {hidden_fees && (
                    <li>
                        <strong>Hidden Fees: </strong>None
                    </li>
                )}
                {included_future_updates && (
                    <li>
                        <strong>Future Updates: </strong>Included
                    </li>
                )}
                {api_access && (
                    <li>
                        <strong>API Access: </strong>Yes
                    </li>
                )}
                {api_access && api_requests_hourly_limit && (
                    <li>
                        <strong>API Requests Limit: </strong>
                        {api_requests_hourly_limit} requests/hour
                    </li>
                )}

                {premium_support ? (
                    <li>
                        <strong>Support: </strong> Premium
                    </li>
                ) : (
                    support && (
                        <li>
                            <strong>Support: </strong> Standard
                        </li>
                    )
                )}
            </ul>

            <Button {...(popularity === 'popular' && { variant: 'blue' })}>
                Get started
            </Button>
        </div>
    );
};

// Icons for Check and X
function CheckIcon(_props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            {..._props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M20 6 9 17l-5-5" />
        </svg>
    );
}

function XIcon(_props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {..._props}

        >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
        </svg>
    );
}

type FeatureTableProps = {
    plans: IPlan[];
};

// Main Component accepting an array of plans
export function FeatureTable({ plans }: Readonly<FeatureTableProps>) {
    // Ensure Pro contains all features of Basic, and Enterprise contains all features of Pro
    const enhancedPlans = plans.map((plan, idx: number) => {
        if (idx > 0) {
            // Include all features from the previous (lower-tier) plan
            const previousPlanFeatures = new Set(plans[idx - 1]?.features);
            plan.features = Array.from(
                new Set([...previousPlanFeatures, ...plan.features])
            );
        }
        return plan;
    });

    // Extract all unique features from the plans
    const allFeatures = [
        ...new Set(enhancedPlans.flatMap((plan) => plan.features)),
    ];

    return (
        <div className="bg-[#ffffff] dark:bg-[#000000] p-8">
            <div className="max-w-7xl mx-auto">
                <div className="overflow-hidden rounded-lg shadow-md dark:bg-[#1f2937]">
                    <div className="align-middle inline-block min-w-full">
                        <Table className="min-w-full">
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="text-left">
                                        Feature
                                    </TableHead>
                                    {enhancedPlans.map((plan) => (
                                        <TableHead key={plan.title}>
                                            {plan.title}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {allFeatures.map((feature) => (
                                    <TableRow key={feature}>
                                        <TableCell>{feature}</TableCell>
                                        {enhancedPlans.map((plan) => (
                                            <TableCell key={plan.title}>
                                                {plan.features.includes(
                                                    feature
                                                ) ? (
                                                    <CheckIcon className="w-4 h-4 text-green-500" />
                                                ) : (
                                                    <XIcon className="w-4 h-4 text-red-500" />
                                                )}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        </div>
    );
}

const SubscriptionFeature = ({
    feature,
    highlight,
}: {
    feature: string;
    highlight?: string;
}) => {
    return (
        <li className="flex items-center space-x-3">
            {/* Icon */}
            <svg
                className="flex-shrink-0 w-5 h-5 text-green-500 dark:text-green-400"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                ></path>
            </svg>
            <span>
                {feature}:{' '}
                {highlight && <span className="font-semibold">36 months</span>}
            </span>
        </li>
    );
};
const Subscriptions = () => {
    // const { slug } = useParams();
    // const SubscriptionDetails = SubscriptionData[Subscription as keyof typeof SubscriptionData];
    // const [activePlan, setActivePlan] = useState<Partial<ISubscription>>({});
    const [displayFeatureComparison, setDisplayFeatureComparison] =
        useState(false);
    const [displayAnnual, setDisplayAnnual] = useState(false);
    const activePlan = useLoaderData() as ISubscription;
    setTitle(activePlan.target);

    return (
        <div>
            <section className="bg-white dark:bg-gray-900">
                <div className=" px-4 mx-auto max-w-screen-xl lg:px-6">
                    <div className="mx-auto max-w-screen-md text-center mb-8 lg:mb-12">
                        <h2 className="mb-4 text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white">
                            {activePlan?.target}
                        </h2>
                        <p className="mb-5 font-light text-gray-500 sm:text-xl dark:text-gray-400">
                            {activePlan?.long_description}
                        </p>
                        <label className="inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                value=""
                                className="sr-only peer"
                                onClick={() => setDisplayAnnual(!displayAnnual)}
                            />
                            <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                            <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                                Show annual prices
                            </span>
                        </label>
                    </div>
                    <div className="py-8 space-y-8 lg:grid lg:grid-cols-3 sm:gap-6 xl:gap-10 lg:space-y-0">
                        {activePlan?.plans?.map((plan) => (
                            <PlanCard
                                key={plan.title}
                                {...plan}
                                displayAnnual={displayAnnual}
                            />
                        ))}
                    </div>
                    <ClickDiv
                        className="my-12 flex items-center justify-center text-blue-400 hover:underline cursor-pointer"
                        onClick={() =>
                            setDisplayFeatureComparison(
                                !displayFeatureComparison
                            )
                        }
                    >
                        Show full plan comparison{' '}
                        <ChevronRight
                            width={16}
                            className={cn('ml-2 transition-all', {
                                'transform rotate-90': displayFeatureComparison,
                            })}
                        ></ChevronRight>
                    </ClickDiv>
                    {displayFeatureComparison && (
                        <FeatureTable plans={activePlan?.plans} />
                    )}
                </div>
            </section>
        </div>
    );
};
const ClickDiv = ({
    children,
    ...props
}: {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
}) => {
    return <span {...props}>{children}</span>;
};

export default Subscriptions;
