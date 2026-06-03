'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHandle,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  FieldGroup,
  Field,
  FieldLabel,
  FieldDescription,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { userPrivateInfo } from '@/convex/shared/models';
import useAuthInfo from '@/hooks/use-auth-info';
import useToggle from '@/hooks/use-toggle';
import {
  authClient,
  useAnonymousSignInMutation,
  useSignInMutation,
  useSignOutMutation,
  useSignUpMutation,
} from '@/lib/convex/auth-client';
import { Awaitable, Simplify } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useAuth } from 'kitcn/react';
import { LogIn } from 'lucide-react';
import { useForm } from '@tanstack/react-form';
import { useMemo, useState } from 'react';
import { UserAvatar } from '../user/avatar';

export const destructiveConfirmationDialogHandle =
  DialogHandle<
    Simplify<Omit<DestructiveConfirmationDialogContentProps, 'close'>>
  >();

interface DestructiveConfirmationDialogContentProps {
  close: () => void;
  children?: React.ReactNode;
  formId: string;
  confirmText: string;
  onConfirm?: () => Awaitable<any>;
}
const defaultProps: Omit<DestructiveConfirmationDialogContentProps, 'close'> = {
  formId: "destructive-confirmation",
  confirmText: "Confirm",
};
export function DestructiveConfirmationDialogContent({
  close,
  children,
  formId,
  confirmText,
  onConfirm
}: DestructiveConfirmationDialogContentProps) {
  const form = useForm({
    formId: `${formId}-confirmation`,
    onSubmit: async (arg) => {
      if (onConfirm) await onConfirm();
      close();
    },
  });

  return (
    <DialogContent
      className={cn('flex flex-col gap-6 sm:max-w-sm')}
      render={<Card />}
    >
      <CardHeader>
        <CardTitle>
          Are you sure?
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form
          id={form.formId}
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <FieldGroup>
            {!!children ? (
              <FieldLabel>
                {children}
              </FieldLabel>
            ) : null}
            <Field orientation="responsive">
              <Button variant="secondary" onClick={() => close()}>
                Cancel
              </Button>
              <Button type="submit" variant="destructive" form={form.formId}>
                {confirmText}
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </DialogContent>
  );
}

export default function DestructiveConfirmationDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen} handle={destructiveConfirmationDialogHandle}>
      {({ payload }) => (
        <DestructiveConfirmationDialogContent
          close={() => setOpen(false)}
          {...{
            ...defaultProps,
            ...payload,
          }}
        />
      )}
    </Dialog>
  );
}
