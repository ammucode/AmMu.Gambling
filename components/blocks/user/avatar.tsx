import { Avatar, AvatarFallback, AvatarImage } from '@ui/avatar';
import { Skeleton } from '@ui/skeleton';
import { userPrivateInfo } from '@/convex/shared/models';

type UserAvatarProps =
  | {
      loading: true;
      user: undefined;
    }
  | {
      loading?: boolean;
      user?: userPrivateInfo;
    };
export function UserAvatar(props: UserAvatarProps) {
  if (props.loading) {
    return (
      <>
        <Skeleton className="h-8 w-8 rounded-lg" />
        <div className="grid flex-1 gap-1 text-left text-sm leading-tight">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-3 w-24" />
        </div>
      </>
    );
  }

  const { user } = props;
  // if (!user) return null;
  const name = user?.displayUsername ?? 'No Account';
  const username = user?.username;
  const initials = user?.displayUsername
    ? user.displayUsername
        .split(/\s+/)
        .map((s) => s.charAt(0).toUpperCase())
        .join('')
    : '';
  return (
    <>
      <Avatar className="h-8 w-8 rounded-lg">
        <AvatarImage src={user?.image} alt={name} />
        <AvatarFallback className="">{initials}</AvatarFallback>
      </Avatar>
      <div className="grid flex-1 text-left text-sm leading-tight">
        <span className="truncate font-medium">{name}</span>
        <span className="truncate text-xs">{username}</span>
      </div>
    </>
  );
}
