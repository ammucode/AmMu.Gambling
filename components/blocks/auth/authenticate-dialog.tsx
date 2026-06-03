'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
  FieldError,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  passwordSchema,
  usernameSchema,
  userPassSchema,
} from '@/convex/lib/validators';
import useAuthInfo from '@/hooks/use-auth-info';
import useToggle from '@/hooks/use-toggle';
import {
  authClient,
  useAnonymousSignInMutation,
  usernameAvailableQueryOptions,
  useSignInMutation,
  useSignOutMutation,
  useSignUpMutation,
} from '@/lib/convex/auth-client';
import { Simplify } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useForm, useStore } from '@tanstack/react-form';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from 'kitcn/react';
import { LogIn } from 'lucide-react';
import { useMemo, useState } from 'react';
import z from 'zod';

export const authDialogHandle =
  DialogHandle<Simplify<Omit<AuthenticateDialogContentProps, 'close'>>>();

const isSignUpToText = (isSignUp: boolean) => (isSignUp ? 'Sign up' : 'Log in');

const formSchema = z.object({
  isSignUp: z.boolean(),
  ...userPassSchema.schema.def.shape,
});

interface AuthenticateDialogContentProps {
  close: () => void;
  defaultIsSignUp: boolean;
}
export function AuthenticateDialogContent({
  close,
  defaultIsSignUp,
}: AuthenticateDialogContentProps) {
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
      close();
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
    <DialogContent
      className={cn('flex flex-col gap-6 sm:max-w-sm')}
      render={<Card />}
    >
      <CardHeader>
        <CardTitle>{modeText}</CardTitle>
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
                    // return undefined;
                  }
                  return undefined;
                },
              }}
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                const formErrors = (form.state.errors as any)
                  .filter((err: any) => err && 'password' in err)
                  .map((err: any) => err.password)
                  .flat() as {message: string}[];
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
            />
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
              children={(field) => {
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
            />
          </FieldGroup>
        </form>
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
              children={([canSubmit, isSubmitting]) => (
                <Button
                  type="submit"
                  className="basis-1/2"
                  form={form.formId}
                  aria-disabled={!canSubmit}
                >
                  {isSubmitting ? '...' : modeText}
                </Button>
              )}
            />
          </Field>
          <form.Field
            name="isSignUp"
            children={(field) => {
              return (
                <FieldDescription className="basis-full text-center">
                  {toggleModePrompt} have an account?{' '}
                  <a onClick={() => field.setValue((is) => !is)}>
                    {otherModeText}
                  </a>
                </FieldDescription>
              );
            }}
          />
        </FieldGroup>
      </CardFooter>
    </DialogContent>
  );
}

export default function AuthenticateDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen} handle={authDialogHandle}>
      {({ payload }) => (
        <AuthenticateDialogContent
          close={() => setOpen(false)}
          defaultIsSignUp={payload?.defaultIsSignUp ?? false}
        />
      )}
    </Dialog>
  );
}
