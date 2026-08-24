import type {CustomerFragment} from 'customer-accountapi.generated';
import type {CustomerUpdateInput} from '@shopify/hydrogen/customer-account-api-types';
import {CUSTOMER_UPDATE_MUTATION} from '~/graphql/customer-account/CustomerUpdateMutation';
import {
  data,
  Form,
  useActionData,
  useNavigation,
  useOutletContext,
} from 'react-router';
import type {Route} from './+types/account.profile';

export type ActionResponse = {
  error: string | null;
  customer: CustomerFragment | null;
};

export const meta: Route.MetaFunction = () => {
  return [{title: 'CEMShop | Mi Perfil'}];
};

export async function loader({context}: Route.LoaderArgs) {
  await context.customerAccount.handleAuthStatus();
  return {};
}

export async function action({request, context}: Route.ActionArgs) {
  const {customerAccount} = context;

  if (request.method !== 'PUT') {
    return data({error: 'Method not allowed'}, {status: 405});
  }

  const form = await request.formData();

  try {
    const customer: CustomerUpdateInput = {};
    const validInputKeys = ['firstName', 'lastName'] as const;
    for (const [key, value] of form.entries()) {
      if (!validInputKeys.includes(key as any)) continue;
      if (typeof value === 'string' && value.length) {
        customer[key as (typeof validInputKeys)[number]] = value;
      }
    }

    const {data: mutationData, errors} = await customerAccount.mutate(
      CUSTOMER_UPDATE_MUTATION,
      {
        variables: {
          customer,
          language: customerAccount.i18n.language,
        },
      },
    );

    if (errors?.length) throw new Error(errors[0].message);

    if (!mutationData?.customerUpdate?.customer) {
      throw new Error('Customer profile update failed.');
    }

    return {
      error: null,
      customer: mutationData?.customerUpdate?.customer,
    };
  } catch (error: any) {
    return data({error: error.message, customer: null}, {status: 400});
  }
}

export default function AccountProfile() {
  const account = useOutletContext<{customer: CustomerFragment}>();
  const {state} = useNavigation();
  const action = useActionData<ActionResponse>();
  const customer = action?.customer ?? account?.customer;
  const isUpdating = state !== 'idle';

  return (
    <div>
      <div className="cs-account-page-header">
        <span className="cs-eyebrow">Cuenta</span>
        <h2>Mi perfil</h2>
      </div>

      <Form method="PUT">
        <div className="cs-form-section">
          <h3>Información personal</h3>

          <div className="cs-form-grid-2">
            <div className="cs-field">
              <label htmlFor="firstName">Nombre</label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                autoComplete="given-name"
                placeholder="Tu nombre"
                aria-label="Nombre"
                defaultValue={customer.firstName ?? ''}
                minLength={2}
              />
            </div>
            <div className="cs-field">
              <label htmlFor="lastName">Apellido</label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                autoComplete="family-name"
                placeholder="Tu apellido"
                aria-label="Apellido"
                defaultValue={customer.lastName ?? ''}
                minLength={2}
              />
            </div>
          </div>

          {action?.error && (
            <div className="cs-form-error">{action.error}</div>
          )}

          {action?.customer && !action?.error && (
            <div className="cs-form-success">Perfil actualizado correctamente.</div>
          )}

          <div className="cs-form-actions">
            <button
              type="submit"
              disabled={isUpdating}
              className="cs-btn cs-btn--primary"
            >
              {isUpdating ? 'Guardando…' : 'Guardar cambios'}
            </button>
          </div>
        </div>
      </Form>
    </div>
  );
}
