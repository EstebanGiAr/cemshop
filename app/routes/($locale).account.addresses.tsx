import type {CustomerAddressInput} from '@shopify/hydrogen/customer-account-api-types';
import type {
  AddressFragment,
  CustomerFragment,
} from 'customer-accountapi.generated';
import {
  data,
  Form,
  useActionData,
  useNavigation,
  useOutletContext,
  type Fetcher,
} from 'react-router';
import type {Route} from './+types/account.addresses';
import {
  UPDATE_ADDRESS_MUTATION,
  DELETE_ADDRESS_MUTATION,
  CREATE_ADDRESS_MUTATION,
} from '~/graphql/customer-account/CustomerAddressMutations';

export type ActionResponse = {
  addressId?: string | null;
  createdAddress?: AddressFragment;
  defaultAddress?: string | null;
  deletedAddress?: string | null;
  error: Record<AddressFragment['id'], string> | null;
  updatedAddress?: AddressFragment;
};

export const meta: Route.MetaFunction = () => {
  return [{title: 'CEMShop | Mis Direcciones'}];
};

export async function loader({context}: Route.LoaderArgs) {
  await context.customerAccount.handleAuthStatus();
  return {};
}

export async function action({request, context}: Route.ActionArgs) {
  const {customerAccount} = context;

  try {
    const form = await request.formData();

    const addressId = form.has('addressId')
      ? String(form.get('addressId'))
      : null;
    if (!addressId) {
      throw new Error('You must provide an address id.');
    }

    const isLoggedIn = await customerAccount.isLoggedIn();
    if (!isLoggedIn) {
      return data({error: {[addressId]: 'Unauthorized'}}, {status: 401});
    }

    const defaultAddress = form.has('defaultAddress')
      ? String(form.get('defaultAddress')) === 'on'
      : false;
    const address: CustomerAddressInput = {};
    const keys: (keyof CustomerAddressInput)[] = [
      'address1',
      'address2',
      'city',
      'company',
      'territoryCode',
      'firstName',
      'lastName',
      'phoneNumber',
      'zoneCode',
      'zip',
    ];

    for (const key of keys) {
      const value = form.get(key);
      if (typeof value === 'string') {
        address[key] = value;
      }
    }

    switch (request.method) {
      case 'POST': {
        try {
          const {data: mutData, errors} = await customerAccount.mutate(
            CREATE_ADDRESS_MUTATION,
            {variables: {address, defaultAddress, language: customerAccount.i18n.language}},
          );
          if (errors?.length) throw new Error(errors[0].message);
          if (mutData?.customerAddressCreate?.userErrors?.length) {
            throw new Error(mutData?.customerAddressCreate?.userErrors[0].message);
          }
          if (!mutData?.customerAddressCreate?.customerAddress) {
            throw new Error('Customer address create failed.');
          }
          return {error: null, createdAddress: mutData?.customerAddressCreate?.customerAddress, defaultAddress};
        } catch (error: unknown) {
          if (error instanceof Error) return data({error: {[addressId]: error.message}}, {status: 400});
          return data({error: {[addressId]: error}}, {status: 400});
        }
      }

      case 'PUT': {
        try {
          const {data: mutData, errors} = await customerAccount.mutate(
            UPDATE_ADDRESS_MUTATION,
            {variables: {address, addressId: decodeURIComponent(addressId), defaultAddress, language: customerAccount.i18n.language}},
          );
          if (errors?.length) throw new Error(errors[0].message);
          if (mutData?.customerAddressUpdate?.userErrors?.length) {
            throw new Error(mutData?.customerAddressUpdate?.userErrors[0].message);
          }
          if (!mutData?.customerAddressUpdate?.customerAddress) {
            throw new Error('Customer address update failed.');
          }
          return {error: null, updatedAddress: address, defaultAddress};
        } catch (error: unknown) {
          if (error instanceof Error) return data({error: {[addressId]: error.message}}, {status: 400});
          return data({error: {[addressId]: error}}, {status: 400});
        }
      }

      case 'DELETE': {
        try {
          const {data: mutData, errors} = await customerAccount.mutate(
            DELETE_ADDRESS_MUTATION,
            {variables: {addressId: decodeURIComponent(addressId), language: customerAccount.i18n.language}},
          );
          if (errors?.length) throw new Error(errors[0].message);
          if (mutData?.customerAddressDelete?.userErrors?.length) {
            throw new Error(mutData?.customerAddressDelete?.userErrors[0].message);
          }
          if (!mutData?.customerAddressDelete?.deletedAddressId) {
            throw new Error('Customer address delete failed.');
          }
          return {error: null, deletedAddress: addressId};
        } catch (error: unknown) {
          if (error instanceof Error) return data({error: {[addressId]: error.message}}, {status: 400});
          return data({error: {[addressId]: error}}, {status: 400});
        }
      }

      default:
        return data({error: {[addressId]: 'Method not allowed'}}, {status: 405});
    }
  } catch (error: unknown) {
    if (error instanceof Error) return data({error: error.message}, {status: 400});
    return data({error}, {status: 400});
  }
}

export default function Addresses() {
  const {customer} = useOutletContext<{customer: CustomerFragment}>();
  const {defaultAddress, addresses} = customer;

  return (
    <div>
      <div className="cs-account-page-header">
        <span className="cs-eyebrow">Cuenta</span>
        <h2>Mis direcciones</h2>
      </div>

      <div className="cs-form-section">
        <h3>Nueva dirección</h3>
        <NewAddressForm key={addresses.nodes.length} />
      </div>

      {addresses.nodes.length > 0 && (
        <div>
          <div
            className="cs-eyebrow"
            style={{marginBottom: 16, display: 'block'}}
          >
            Direcciones guardadas
          </div>
          <ExistingAddresses
            addresses={addresses}
            defaultAddress={defaultAddress}
          />
        </div>
      )}
    </div>
  );
}

function NewAddressForm() {
  const newAddress = {
    address1: '',
    address2: '',
    city: '',
    company: '',
    territoryCode: '',
    firstName: '',
    id: 'new',
    lastName: '',
    phoneNumber: '',
    zoneCode: '',
    zip: '',
  } as CustomerAddressInput;

  return (
    <AddressForm
      addressId={'NEW_ADDRESS_ID'}
      address={newAddress}
      defaultAddress={null}
    >
      {({stateForMethod}) => (
        <div className="cs-form-actions">
          <button
            disabled={stateForMethod('POST') !== 'idle'}
            formMethod="POST"
            type="submit"
            className="cs-btn cs-btn--primary"
          >
            {stateForMethod('POST') !== 'idle' ? 'Guardando…' : 'Guardar dirección'}
          </button>
        </div>
      )}
    </AddressForm>
  );
}

function ExistingAddresses({
  addresses,
  defaultAddress,
}: Pick<CustomerFragment, 'addresses' | 'defaultAddress'>) {
  return (
    <div>
      {addresses.nodes.map((address) => (
        <div key={address.id} className="cs-address-card">
          <div className="cs-address-card-header">
            <h4>
              {[address.firstName, address.lastName].filter(Boolean).join(' ') ||
                'Dirección'}
            </h4>
            {defaultAddress?.id === address.id && (
              <span className="cs-address-default-badge">Predeterminada</span>
            )}
          </div>
          <AddressForm
            addressId={address.id}
            address={address}
            defaultAddress={defaultAddress}
          >
            {({stateForMethod}) => (
              <div className="cs-form-actions">
                <button
                  disabled={stateForMethod('PUT') !== 'idle'}
                  formMethod="PUT"
                  type="submit"
                  className="cs-btn cs-btn--ghost"
                >
                  {stateForMethod('PUT') !== 'idle' ? 'Guardando…' : 'Guardar'}
                </button>
                <button
                  disabled={stateForMethod('DELETE') !== 'idle'}
                  formMethod="DELETE"
                  type="submit"
                  className="cs-btn cs-btn--danger"
                >
                  {stateForMethod('DELETE') !== 'idle' ? 'Eliminando…' : 'Eliminar'}
                </button>
              </div>
            )}
          </AddressForm>
        </div>
      ))}
    </div>
  );
}

export function AddressForm({
  addressId,
  address,
  defaultAddress,
  children,
}: {
  addressId: AddressFragment['id'];
  address: CustomerAddressInput;
  defaultAddress: CustomerFragment['defaultAddress'];
  children: (props: {
    stateForMethod: (method: 'PUT' | 'POST' | 'DELETE') => Fetcher['state'];
  }) => React.ReactNode;
}) {
  const {state, formMethod} = useNavigation();
  const action = useActionData<ActionResponse>();
  const error = action?.error?.[addressId];
  const isDefaultAddress = defaultAddress?.id === addressId;

  return (
    <Form id={addressId}>
      <input type="hidden" name="addressId" defaultValue={addressId} />

      <div className="cs-form-grid-2" style={{marginBottom: 16}}>
        <div className="cs-field">
          <label htmlFor={`${addressId}-firstName`}>Nombre*</label>
          <input
            aria-label="Nombre"
            autoComplete="given-name"
            defaultValue={address?.firstName ?? ''}
            id={`${addressId}-firstName`}
            name="firstName"
            placeholder="Nombre"
            required
            type="text"
          />
        </div>
        <div className="cs-field">
          <label htmlFor={`${addressId}-lastName`}>Apellido*</label>
          <input
            aria-label="Apellido"
            autoComplete="family-name"
            defaultValue={address?.lastName ?? ''}
            id={`${addressId}-lastName`}
            name="lastName"
            placeholder="Apellido"
            required
            type="text"
          />
        </div>
      </div>

      <div className="cs-field" style={{marginBottom: 16}}>
        <label htmlFor={`${addressId}-company`}>Empresa</label>
        <input
          aria-label="Empresa"
          autoComplete="organization"
          defaultValue={address?.company ?? ''}
          id={`${addressId}-company`}
          name="company"
          placeholder="Empresa (opcional)"
          type="text"
        />
      </div>

      <div className="cs-field" style={{marginBottom: 16}}>
        <label htmlFor={`${addressId}-address1`}>Dirección*</label>
        <input
          aria-label="Dirección línea 1"
          autoComplete="address-line1"
          defaultValue={address?.address1 ?? ''}
          id={`${addressId}-address1`}
          name="address1"
          placeholder="Calle y número"
          required
          type="text"
        />
      </div>

      <div className="cs-field" style={{marginBottom: 16}}>
        <label htmlFor={`${addressId}-address2`}>Dirección 2</label>
        <input
          aria-label="Dirección línea 2"
          autoComplete="address-line2"
          defaultValue={address?.address2 ?? ''}
          id={`${addressId}-address2`}
          name="address2"
          placeholder="Piso, departamento, etc. (opcional)"
          type="text"
        />
      </div>

      <div className="cs-form-grid-3" style={{marginBottom: 16}}>
        <div className="cs-field">
          <label htmlFor={`${addressId}-city`}>Ciudad*</label>
          <input
            aria-label="Ciudad"
            autoComplete="address-level2"
            defaultValue={address?.city ?? ''}
            id={`${addressId}-city`}
            name="city"
            placeholder="Ciudad"
            required
            type="text"
          />
        </div>
        <div className="cs-field">
          <label htmlFor={`${addressId}-zoneCode`}>Provincia / Estado*</label>
          <input
            aria-label="Provincia/Estado"
            autoComplete="address-level1"
            defaultValue={address?.zoneCode ?? ''}
            id={`${addressId}-zoneCode`}
            name="zoneCode"
            placeholder="Provincia"
            required
            type="text"
          />
        </div>
        <div className="cs-field">
          <label htmlFor={`${addressId}-zip`}>Código postal*</label>
          <input
            aria-label="Código postal"
            autoComplete="postal-code"
            defaultValue={address?.zip ?? ''}
            id={`${addressId}-zip`}
            name="zip"
            placeholder="28001"
            required
            type="text"
          />
        </div>
      </div>

      <div className="cs-form-grid-2" style={{marginBottom: 8}}>
        <div className="cs-field">
          <label htmlFor={`${addressId}-territoryCode`}>País*</label>
          <input
            aria-label="Código de país"
            autoComplete="country"
            defaultValue={address?.territoryCode ?? ''}
            id={`${addressId}-territoryCode`}
            name="territoryCode"
            placeholder="ES"
            required
            type="text"
            maxLength={2}
          />
        </div>
        <div className="cs-field">
          <label htmlFor={`${addressId}-phone`}>Teléfono</label>
          <input
            aria-label="Teléfono"
            autoComplete="tel"
            defaultValue={address?.phoneNumber ?? ''}
            id={`${addressId}-phone`}
            name="phoneNumber"
            placeholder="+34 600 000 000"
            pattern="^\+?[1-9]\d{3,14}$"
            type="tel"
          />
        </div>
      </div>

      <div className="cs-checkbox-row">
        <input
          defaultChecked={isDefaultAddress}
          id={`${addressId}-defaultAddress`}
          name="defaultAddress"
          type="checkbox"
        />
        <label htmlFor={`${addressId}-defaultAddress`}>
          Establecer como dirección predeterminada
        </label>
      </div>

      {error && <div className="cs-form-error">{error}</div>}

      {children({
        stateForMethod: (method) => (formMethod === method ? state : 'idle'),
      })}
    </Form>
  );
}
