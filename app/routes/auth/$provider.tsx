import type { ActionArgs} from "@remix-run/node";
import { redirect } from "@remix-run/node"
import invariant from "tiny-invariant";
import { authenticator } from '~/utils/auth.server';

export const loader = () => redirect('/login');

export const action = ({ request, params }: ActionArgs) => {
    invariant(params.provider, 'provider is a required parameter')
    return authenticator.authenticate(params.provider, request);
  }