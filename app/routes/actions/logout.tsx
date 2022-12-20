import type { ActionFunction} from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { getUserSession } from '~/utils/user.session.server';

export const action: ActionFunction = async ({ request }) => {
  const userSession = await getUserSession(request);

  try {
    return redirect('/', {
      headers: { 'Set-Cookie': await userSession.destroy() },
    });
  } catch {
    return redirect('/');
  }
};

export default action;
