import { PaypalIcon } from '@/components/Icons';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { DialogTrigger } from '@radix-ui/react-dialog';
import { AppleIcon, CirclePlusIcon } from 'lucide-react';
import React from 'react';

type enumPaymentMethod = 'card' | 'paypal' | 'apple';
export function PaymentMethod() {
    const [activeMethod, setActiveMethod] =
        React.useState<enumPaymentMethod>('card');

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button className="ml-auto">
                    <CirclePlusIcon className="mr-2" size={16} />
                    Add a new Payment method
                </Button>
            </DialogTrigger>

            <DialogContent className="grid gap-6 min-h-[70%]">
                <DialogHeader>
                    <DialogTitle>Payment Method</DialogTitle>
                    <DialogDescription>
                        Add a new payment method to your account.
                    </DialogDescription>
                </DialogHeader>
                <RadioGroup
                    defaultValue="card"
                    onValueChange={(value) =>
                        setActiveMethod(value as enumPaymentMethod)
                    }
                    className="grid grid-cols-3 gap-4 "
                >
                    <div>
                        <RadioGroupItem
                            value="card"
                            id="card"
                            className="peer sr-only"
                        />
                        <Label
                            htmlFor="card"
                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                className="mb-3 h-6 w-6"
                            >
                                <rect
                                    width="20"
                                    height="14"
                                    x="2"
                                    y="5"
                                    rx="2"
                                />
                                <path d="M2 10h20" />
                            </svg>
                            Card
                        </Label>
                    </div>
                    <div>
                        <RadioGroupItem
                            value="paypal"
                            id="paypal"
                            className="peer sr-only"
                        />
                        <Label
                            htmlFor="paypal"
                            className="flex flex-col gap-2 items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                        >
                            <PaypalIcon height={30} width={30} />
                            Paypal
                        </Label>
                    </div>
                    <div>
                        <RadioGroupItem
                            value="apple"
                            id="apple"
                            className="peer sr-only"
                        />
                        <Label
                            htmlFor="apple"
                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                        >
                            <AppleIcon className="mb-3 h-6 w-6" />
                            Apple
                        </Label>
                    </div>
                </RadioGroup>

                {activeMethod === 'card' && (
                    <>
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" placeholder="First Last" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="number">Card number</Label>
                            <Input id="number" placeholder="" />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="month">Expires</Label>
                                <Select>
                                    <SelectTrigger id="month">
                                        <SelectValue placeholder="Month" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">
                                            January
                                        </SelectItem>
                                        <SelectItem value="2">
                                            February
                                        </SelectItem>
                                        <SelectItem value="3">March</SelectItem>
                                        <SelectItem value="4">April</SelectItem>
                                        <SelectItem value="5">May</SelectItem>
                                        <SelectItem value="6">June</SelectItem>
                                        <SelectItem value="7">July</SelectItem>
                                        <SelectItem value="8">
                                            August
                                        </SelectItem>
                                        <SelectItem value="9">
                                            September
                                        </SelectItem>
                                        <SelectItem value="10">
                                            October
                                        </SelectItem>
                                        <SelectItem value="11">
                                            November
                                        </SelectItem>
                                        <SelectItem value="12">
                                            December
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="year">Year</Label>
                                <Select>
                                    <SelectTrigger id="year">
                                        <SelectValue placeholder="Year" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Array.from({ length: 10 }, (_, i) => (
                                            <SelectItem
                                                key={i}
                                                value={`${new Date().getFullYear() + i}`}
                                            >
                                                {new Date().getFullYear() + i}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="cvc">CVC</Label>
                                <Input id="cvc" placeholder="CVC" />
                            </div>
                        </div>
                    </>
                )}

                {activeMethod === 'paypal' && (
                    <div className="h-full">
                        <Label htmlFor="paypal">
                            Enter your paypal email id
                        </Label>
                        <Input placeholder="Paypal" />
                    </div>
                )}

                {activeMethod === 'apple' && (
                    <div className="h-full">
                        <Label htmlFor="apple">Enter your apple email id</Label>
                        <Input placeholder="Apple Pay" />
                    </div>
                )}
                <DialogFooter>
                    <Button className="w-full mt-auto">Continue</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
