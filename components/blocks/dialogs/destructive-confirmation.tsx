'use client';

import { Button } from '@ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@ui/card';
import { Dialog, DialogContent, DialogHandle } from '@ui/dialog';
import { FieldGroup, Field, FieldLabel } from '@ui/field';
import { cn } from '@/lib/utils';
import { useForm } from '@tanstack/react-form';
import { useState } from 'react';
import { Promisable, SimplifyDeep } from 'type-fest';

export const destructiveConfirmationDialogHandle =
  DialogHandle<
    SimplifyDeep<Omit<DestructiveConfirmationDialogContentProps, 'close'>>
  >();

interface DestructiveConfirmationDialogContentProps {
  close: () => void;
  children?: React.ReactNode;
  formId: string;
  confirmText: string;
  onConfirm?: () => Promisable<unknown>;
}
const defaultProps: Omit<DestructiveConfirmationDialogContentProps, 'close'> = {
  formId: 'destructive-confirmation',
  confirmText: 'Confirm',
};
export function DestructiveConfirmationDialogContent({
  close,
  children,
  formId,
  confirmText,
  onConfirm,
}: DestructiveConfirmationDialogContentProps) {
  const form = useForm({
    formId: `${formId}-confirmation`,
    onSubmit: async () => {
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
        <CardTitle>Are you sure?</CardTitle>
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
            {!!children ? <FieldLabel>{children}</FieldLabel> : null}
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
    <Dialog
      open={open}
      onOpenChange={setOpen}
      handle={destructiveConfirmationDialogHandle}
    >
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
