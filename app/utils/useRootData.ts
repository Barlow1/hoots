// this is needed by things the root needs, so to avoid circular deps we have to
// put it in its own file which is silly I know...

import type { LoaderData } from '../root';
// eslint-disable-next-line import/no-cycle
import { handle } from '../root';
import { useMatchLoaderData } from './useMatchLoaderData';

export const useRootData = () => useMatchLoaderData<LoaderData>(handle.id);
export function useUser() {
  const { user } = useRootData();
  return user;
}

export function useMentorProfile() {
  const { mentorProfile } = useRootData();
  return mentorProfile;
}
export function useRequiredUser() {
  const { user } = useRootData();
  if (!user) throw new Error('User is required when using useUser');
  return user;
}
