import setTitle from '@/components/hooks/set-title';
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    CardFooter,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

import PaymentForm from '@/components/PaymentCard';
import { PaymentMethod } from '@/components/PaymentMethod';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/constants/axios';
import { TPaymentSchema } from '#/types/schemas';

function Billing() {
    setTitle('Billing');

    const { data, isPending: _isPending } = useQuery({
        queryKey: ['account', 'billing'],
        queryFn: async () => {
            const response = await axiosInstance.get('/account/billing');
            return response.data;
        },
    });
    return (
        <div className="grid gap-6">
            <h3 className="text-lg font-semibold">Manage your Subscription</h3>
            <div>
                <Card>
                    <CardHeader>
                        <CardTitle>Your Plan</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4">
                            <div>
                                <h3 className="text-xl font-bold">Pro Plan</h3>
                                <p className="text-muted-foreground">
                                    Unlock advanced features and tools for your
                                    business.
                                </p>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-bold">$49</span>
                                <span className="text-muted-foreground">
                                    /month
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
            <div>
                <Card>
                    <CardHeader>
                        <CardTitle>Payment Method</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {/* <div className="grid gap-4"> */}
                        <div className="grid gap-3">
                            {(data as TPaymentSchema)?.paymentMethod ? (
                                data.paymentMethod === 'card' ? (
                                    <PaymentForm
                                        number={data.card.number}
                                        name={data.card.name}
                                        expiry={data.card.expiry}
                                        cvc={data.card.cvv}
                                    />
                                ) : data.paymentMethod === 'paypal' ? (
                                    <div>Paypal</div>
                                ) : data.paymentMethod === 'applepay' ? (
                                    <div>Apple Pay</div>
                                ) : (
                                    <div>No Payment method set</div>
                                )
                            ) : (
                                <div>No Payment method set</div>
                            )}
                        </div>
                    </CardContent>
                    <CardFooter>
                        <PaymentMethod />
                    </CardFooter>
                </Card>
            </div>
            <div>
                <Card>
                    <CardHeader>
                        <CardTitle>Subscription Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4">
                            <div className="flex items-center justify-between">
                                <div>Next Billing Date</div>
                                <div>October 15, 2024</div>
                            </div>
                            <div className="flex items-center justify-between">
                                <div>Next Billing Amount</div>
                                <div className="text-2xl font-bold">$49.00</div>
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <div>Status</div>
                                <Badge variant="secondary">Active</Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default Billing;
