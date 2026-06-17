'use client';

import { Button } from '@ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Dialog, DialogContent, DialogHandle } from '@ui/dialog';
import {
  FieldGroup,
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
} from '@/components/ui/field';
import { Input } from '@ui/input';
import { userPassSchema } from '@/convex/lib/validators';
import {
  usernameAvailableQueryOptions,
  useSignInMutation,
  useSignUpMutation,
} from '@/lib/convex/auth-client';
import { cn } from '@/lib/utils';
import { useForm, useStore } from '@tanstack/react-form';
import { useQueryClient } from '@tanstack/react-query';
import React, { useMemo, useState } from 'react';
import { Promisable, SimplifyDeep } from 'type-fest';
import z from 'zod';

export const authDialogHandle =
  DialogHandle<SimplifyDeep<Omit<AuthenticateDialogCardProps, 'close'>>>();

const isSignUpToText = (isSignUp: boolean) => (isSignUp ? 'Sign up' : 'Log in');

const formSchema = z.object({
  isSignUp: z.boolean(),
  ...userPassSchema.schema.def.shape,
});

interface AuthenticateDialogCardProps {
  close?: () => Promisable<unknown>;
  defaultIsSignUp?: boolean;
  onAuth?: () => Promisable<unknown>;
  overrides?: {
    title: string;
    top?: React.ReactNode;
    bottom?: React.ReactNode;
  };
}
export function AuthenticateFormCard({
  close = () => undefined,
  defaultIsSignUp = false,
  onAuth,
  overrides,
}: AuthenticateDialogCardProps) {
  const signIn = useSignInMutation();
  const signUp = useSignUpMutation();
  const queryClient = useQueryClient();

  const form = useForm({
    formId: 'authenticate-form',
    defaultValues: {
      isSignUp: defaultIsSignUp ?? false,
      username: '',
      password: '',
    },
    validators: {
      onChangeAsyncDebounceMs: 500,
    },
    onSubmit: async ({ value }) => {
      console.log(value);
      if (value.isSignUp) {
        await signUp.mutateAsync(value);
      } else {
        await signIn.mutateAsync(value);
      }
      await onAuth?.();
      await close();
    },
  });

  const isSignUp = useStore(form.store, (state) => state.values.isSignUp);
  const modeText = useMemo(() => isSignUpToText(isSignUp), [isSignUp]);
  const otherModeText = useMemo(() => isSignUpToText(!isSignUp), [isSignUp]);
  const toggleModePrompt = useMemo(
    () => (isSignUp ? 'Already' : "Don't"),
    [isSignUp]
  );

  return (
    <>
      <CardHeader>
        <CardTitle>{overrides?.title ?? modeText}</CardTitle>
      </CardHeader>
      <CardContent>
        {overrides?.top ?? null}
        <form
          id={form.formId}
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <FieldGroup>
            <form.Field
              name="username"
              validators={{
                onChangeListenTo: ['isSignUp'],
                onChangeAsync: async ({ value, fieldApi }) => {
                  if (value.length < 3) return undefined;
                  const isSignUp = fieldApi.form.getFieldValue('isSignUp');
                  if (isSignUp) {
                    const parsed =
                      formSchema.def.shape.username.safeParse(value);
                    if (!parsed.success)
                      return parsed.error.issues.map((i) => ({
                        message: i.message,
                      }));
                  }
                  try {
                    const data = await queryClient.fetchQuery(
                      usernameAvailableQueryOptions(value)
                    );
                    console.log(value, data.available);
                    if (isSignUp !== data.available) {
                      return {
                        message: isSignUp
                          ? 'Username already taken!'
                          : 'Username does not exist!',
                      };
                    }
                  } catch (error) {
                    console.error(error);
                    // return undefined;
                  }
                  return undefined;
                },
              }}
            >
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                const formErrors = (
                  form.state.errors as unknown as Record<
                    string,
                    { message: string }
                  >[]
                )
                  .filter((err) => err && 'password' in err)
                  .map((err) => err.password)
                  .flat();
                const errors = [...field.state.meta.errors, ...formErrors];
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Username</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="gambler-1234"
                      autoComplete="off"
                      required
                    />
                    {isInvalid && <FieldError errors={errors} />}
                  </Field>
                );
              }}
            </form.Field>
            <form.Field
              name="password"
              validators={{
                onChangeListenTo: ['isSignUp'],
                onChangeAsync: async ({ value, fieldApi }) => {
                  console.log('check', value);
                  const isSignUp = fieldApi.form.getFieldValue('isSignUp');
                  if (isSignUp) {
                    const parsed =
                      formSchema.def.shape.password.safeParse(value);
                    if (!parsed.success)
                      return parsed.error.issues.map((i) => ({
                        message: i.message,
                      }));
                  }
                  return undefined;
                },
                onChangeAsyncDebounceMs: 1000,
              }}
            >
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="***"
                      aria-invalid={isInvalid}
                      required
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>
          </FieldGroup>
        </form>
        {overrides?.bottom ?? null}
      </CardContent>
      <CardFooter>
        <FieldGroup className="gap-2">
          <Field orientation="horizontal">
            <Button
              type="button"
              variant="outline"
              className="basis-1/2"
              onClick={() => (form.reset(), close())}
            >
              Cancel (esc)
            </Button>
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
            >
              {([canSubmit, isSubmitting]) => (
                <Button
                  type="submit"
                  className="basis-1/2"
                  form={form.formId}
                  aria-disabled={!canSubmit}
                >
                  {isSubmitting ? '...' : modeText}
                </Button>
              )}
            </form.Subscribe>
          </Field>
          <form.Field name="isSignUp">
            {(field) => {
              return (
                <FieldDescription className="basis-full text-center">
                  {toggleModePrompt} have an account?{' '}
                  <a onClick={() => field.setValue((is) => !is)}>
                    {otherModeText}
                  </a>
                </FieldDescription>
              );
            }}
          </form.Field>
        </FieldGroup>
      </CardFooter>
    </>
  );
}

export default function AuthenticateDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen} handle={authDialogHandle}>
      {({ payload }) => (
        <DialogContent
          className={cn('flex flex-col gap-6 sm:max-w-sm')}
          render={<Card />}
        >
          <AuthenticateFormCard
            close={() => setOpen(false)}
            defaultIsSignUp={payload?.defaultIsSignUp ?? false}
          />
        </DialogContent>
      )}
    </Dialog>
  );
}
