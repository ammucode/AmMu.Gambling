import AuthenticateDialog from './blocks/auth/authenticate-dialog';
import DestructiveConfirmationDialog from './blocks/dialogs/destructive-confirmation';

export function DialogRoots() {
  return (
    <>
      <AuthenticateDialog />
      <DestructiveConfirmationDialog />
    </>
  );
}
