import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';
import { useState } from 'react';
import { FieldValues, Path, PathValue, UseFormReturn } from 'react-hook-form';

const names = [
    'Brooklynn',
    'Caleb',
    'Alexander',
    'Emery',
    'Chase',
    'Christian',
];

const generateAvatars = (names: string[], style: string) => {
    return names.map((name) => {
        return {
            value: `https://api.dicebear.com/9.x/${style}/svg?seed=${name}`,
            label: name,
        };
    });
};

const userAvatars = generateAvatars(names, 'adventurer');
const teamAvatars = generateAvatars(names, 'icons');

type TAvatarPick = {
    value: string;
    label: string;
};

type AvatarPickerProps<TFormValues extends FieldValues> = {
    form: UseFormReturn<TFormValues>;
    mode: 'team' | 'user';
    name: Path<TFormValues>;
};

function AvatarPicker<TFormValues extends FieldValues>({ 
    form, 
    mode,
    name 
}: Readonly<AvatarPickerProps<TFormValues>>) {
    const [open, setOpen] = useState(false);
    const [selectedAvatar, setSelectedAvatar] = useState<TAvatarPick | null>(
        null
    );

    const avatars = mode === 'team' ? teamAvatars : userAvatars;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild onClick={() => setOpen(true)}>
                <div className="flex flex-col justify-center items-center gap-4">
                    <Button type="button" variant="outline">
                        Choose an avatar
                    </Button>
                    {selectedAvatar && (
                        <Avatar>
                            <AvatarImage
                                src={selectedAvatar.value}
                                alt="Avatar"
                                className="rounded-full h-12"
                            />
                            <AvatarFallback>
                                {selectedAvatar.label}
                            </AvatarFallback>
                        </Avatar>
                    )}
                </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Choose an avatar</DialogTitle>
                    <DialogDescription>
                        This is the avatar that will be displayed for your{' '}
                        {mode === 'team' ? 'team' : 'account'}.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-2">
                    {avatars.map((avatar) => (
                        <Button
                            asChild
                            key={avatar.label}
                            size="icon"
                            variant="ghost"
                            type="button"
                            className="cursor-pointer rounded-full"
                            onClick={() => {
                                form.setValue(
                                    name, 
                                    avatar.value as PathValue<TFormValues, Path<TFormValues>>, 
                                    {
                                        shouldDirty: true,
                                    }
                                );
                                setSelectedAvatar(avatar);
                                setOpen(false);
                            }}
                        >
                            <Avatar>
                                <AvatarImage
                                    src={avatar.value}
                                    alt="Avatar"
                                    className=""
                                />
                                <AvatarFallback>{avatar.label}</AvatarFallback>
                            </Avatar>
                        </Button>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default AvatarPicker;