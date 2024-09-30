import { ReactNode, useState } from 'react';
import {
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { FieldValues, UseFormReturn, Path, PathValue } from 'react-hook-form';

type TProjectSelectItem = {
    label: string;
    value: string;
};


type TProjectSelectProps<TFormValues extends FieldValues> = {
    form: UseFormReturn<TFormValues>;
    label: string;
    name: Path<TFormValues>; 
    placeholder: string;
    items: TProjectSelectItem[];
    withDeselect?: boolean;
    children?: ReactNode;
};

function ProjectSelect<TFormValues extends FieldValues>({
    form,
    label,
    name,
    placeholder,
    items,
    withDeselect,
    children,
}: Readonly<TProjectSelectProps<TFormValues>>) {
    const [key, setKey] = useState(+new Date());
    // if deselect is enabled, it must be optional in zod schema so we can set undefined
    const handleDeselect = () => {
        form.setValue(name, null as PathValue<TFormValues, Path<TFormValues>>);
        setKey(+new Date());
    };
    return (
        <FormField
            control={form.control}
            name={name}
            render={({ field }) => (
                <FormItem>

                    <FormLabel htmlFor={name}>{label}</FormLabel>
                    <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        key={key}
                    >
                        <SelectTrigger id="sport" aria-label={placeholder}>
                            <SelectValue placeholder={placeholder} />
                        </SelectTrigger>
                        <SelectContent
                            {...(withDeselect && {
                                enableDeselect: true,
                                onClickDeselect: handleDeselect,
                            })}
                            key={key}
                        >
                            {items.map((item) => (
                                <SelectItem key={item.value} value={item.value}>
                                    {item.label}
                                </SelectItem>
                            ))}
                            {children}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
}

export default ProjectSelect;
