'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { type FormEvent, useState } from 'react';

import { Button } from '@/components/ui/button';
import { useCRPC } from '@/lib/convex/crpc';

export default function ConvexMessagesPage() {
  const crpc = useCRPC();
  const [draft, setDraft] = useState('');
  const messagesQuery = useQuery(crpc.messages.list.queryOptions());
  const createMessage = useMutation(crpc.messages.create.mutationOptions());

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const body = draft.trim();
    if (!body) return;

    try {
      await createMessage.mutateAsync({ body });
      setDraft('');
    } catch {}
  }

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-2xl flex-col gap-6 px-6 py-10 text-sm">
      <header className="space-y-2">
        <p className="font-mono text-xs tracking-[0.2em] text-muted-foreground uppercase">
          kitcn
        </p>
        <h1 className="text-2xl font-medium tracking-tight">Messages</h1>
        <p className="max-w-xl leading-6 text-muted-foreground">
          This page is a tiny live query and mutation over kitcn. Start the
          backend, send a message, and watch the list update.
        </p>
      </header>

      <form className="flex flex-col gap-3 sm:flex-row" onSubmit={handleSubmit}>
        <input
          className="min-h-10 flex-1 rounded-md border border-border bg-background px-3 py-2 transition-colors outline-none focus:border-primary"
          maxLength={120}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Write a message"
          value={draft}
        />
        <Button
          disabled={createMessage.isPending || draft.trim().length === 0}
          type="submit"
        >
          {createMessage.isPending ? 'Saving...' : 'Add message'}
        </Button>
      </form>

      {messagesQuery.isPending ? (
        <p className="text-muted-foreground">Loading messages...</p>
      ) : messagesQuery.isError ? (
        <div className="rounded-md border border-dashed border-border px-4 py-3 leading-6 text-muted-foreground">
          Backend not ready. Start <code>kitcn dev</code> and refresh.
        </div>
      ) : messagesQuery.data.length === 0 ? (
        <div className="rounded-md border border-dashed border-border px-4 py-6 text-muted-foreground">
          No messages yet. Add the first one.
        </div>
      ) : (
        <ul className="space-y-3">
          {messagesQuery.data.map((message) => (
            <li
              className="rounded-md border border-border bg-background px-4 py-3"
              key={message.id}
            >
              <div className="flex items-start justify-between gap-3">
                <p className="leading-6">{message.body}</p>
                <time className="shrink-0 font-mono text-xs text-muted-foreground">
                  {message.createdAt.toLocaleTimeString()}
                </time>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
