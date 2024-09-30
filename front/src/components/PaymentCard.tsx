import React, { useState } from 'react';
import Cards, { ReactCreditCardsProps } from 'react-credit-cards-2';
import 'react-credit-cards-2/dist/es/styles-compiled.css';
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

import { PencilLine, Trash2Icon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
// import { useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { cardPaymentSchema, TCardPaymentSchema } from '../../../types/schemas';
import {
    TooltipProvider,
    Tooltip,
    TooltipTrigger,
    TooltipContent,
} from '@/components/ui/tooltip';
import clsx from 'clsx';

type PaymentFormProps = ReactCreditCardsProps & {
    number: string;
    editable?: boolean;
    expiry: string;
    cvc: string;
};

const PaymentForm = ({
    number = '',
    expiry = '',
    cvc = '',
    name = '',
    focused,
    editable,
}: PaymentFormProps) => {
    const [state, setState] = useState({
        number,
        expiry,
        cvc,
        name,
        focused,
    });

    // use when implementing payment system
    // const _form = useForm<TCardPaymentSchema>({
    //     resolver: zodResolver(cardPaymentSchema),
    //     defaultValues: {
    //         number: state.number,
    //         name: state.name,
    //         expiry: state.expiry,
    //         cvv: state.cvc,
    //     },
    // });

    const [edit, setEdit] = useState(editable);

    const creditCardize = (value: string) => {
        let foo = value.split('-').join('').replace(/\s/g, '');
        if (foo.length > 0) {
            const reg = foo.match(/.{1,4}/g);
            if (reg) {
                foo = reg.join('-');
            }
        }
        if (foo.length > 19) {
            foo = foo.substring(0, 19);
        }
        return foo;
    };

    const datify = (value: string) => {
        let foo = value.replace(/\s/g, '');
        foo = value.split('/').join('').replace(/\s/g, '');
        if (foo.length > 0) {
            const reg = foo.match(/.{1,2}/g);
            if (reg) {
                foo = reg.join('/');
            }
        }
        foo = foo.substring(0, 5);
        return foo;
    };

    const handleInputChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = evt.target;
        let resValue = value;
        if (name === 'cvc') {
            resValue = value.replace(/\s/g, '').substring(0, 3);
        } else if (evt.target.name === 'expiry') {
            resValue = datify(value);
        } else if (evt.target.name === 'number') {
            // place - every 4 digits
            resValue = creditCardize(value);
        }

        setState((prev) => ({ ...prev, [name]: resValue }));
    };

    const handleInputFocus = (evt: React.FocusEvent<HTMLInputElement>) => {
        console.log(evt.target.name, 'focused');
        setState((prev) => ({ ...prev, focus: evt.target.name }));
    };

    return (
        <div
            className={clsx('grid gap-3', {
                'grid-cols-1': !edit,
                'lg:grid-cols-2': edit,
            })}
        >
            <div className="m-6 relative ">
                {!edit && (
                    <div className="flex gap-2 absolute top-2 right-[33%] z-[10]">
                        <Button
                            variant="ghost"
                            size={'icon'}
                            onClick={() => setEdit(true)}
                            className=" h-6 w-6"
                        >
                            <PencilLine className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            size="icon"
                                            variant="destructive"
                                            className="h-6 w-6"
                                        >
                                            <AlertDialogTrigger asChild>
                                                <span>
                                                    <Trash2Icon className="h-4 w-4" />
                                                </span>
                                            </AlertDialogTrigger>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="right">
                                        Remove Payment method
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>
                                        Are you absolutely sure?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                        <div className="grid gap-2">
                                            This action cannot be undone. This
                                            will permanently delete your project
                                            (project-name) and remove its data
                                            from our servers.
                                            <Input placeholder="Type the project name to confirm" />
                                        </div>
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>
                                        Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                        className="disabled:bg-red-300 bg-red-500 hover:bg-red-600"
                                        // disabled={projectNameVerification !== project.name}
                                        // onClick={() => deletProjectMutation.mutate()}
                                    >
                                        Confirm delete
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                )}
                <Cards
                    number={state.number.replace(/-/g, '')}
                    name={state.name}
                    expiry={state.expiry}
                    cvc={state.cvc}
                    focused={state.focused}
                />
            </div>

            <div className="grid gap-3">
                {edit && (
                    <form className="grid lg:grid-cols-2 gap-2">
                        <Input
                            type="text"
                            name="number"
                            placeholder="Card Number"
                            value={state.number}
                            onChange={handleInputChange}
                            onFocus={handleInputFocus}
                            className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <Input
                            type="text"
                            name="name"
                            placeholder="Name"
                            value={state.name}
                            onChange={handleInputChange}
                            onFocus={handleInputFocus}
                        />

                        <Input
                            type="text"
                            name="expiry"
                            placeholder="MM/YY Expiry"
                            value={state.expiry}
                            onChange={handleInputChange}
                            onFocus={handleInputFocus}
                        />
                        <Input
                            type="number"
                            name="cvc"
                            placeholder="CVC"
                            value={state.cvc}
                            onChange={handleInputChange}
                            onFocus={handleInputFocus}
                            className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                    </form>
                )}

                {edit && (
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => setEdit(false)}
                    >
                        Save
                    </Button>
                )}
            </div>
        </div>
    );
};

export default PaymentForm;
