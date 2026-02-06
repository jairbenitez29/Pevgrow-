import { NextResponse } from 'next/server';
import PrestaShopService from '@/lib/prestashop/PrestaShopService';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, firstname, lastname } = body;

    // Validation
    if (!email || !password || !firstname || !lastname) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }

    if (password.length < 5) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 5 caracteres' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingCustomers = await PrestaShopService.getCustomers({ filter: { email } });

    if (existingCustomers && existingCustomers.length > 0) {
      return NextResponse.json(
        { error: 'Este email ya está registrado' },
        { status: 409 }
      );
    }

    // Create new customer
    // NOTE: PrestaShop requires password to be sent as plain text
    // The API will handle the hashing
    const customerData = {
      email,
      passwd: password,
      firstname,
      lastname,
      active: 1,
      newsletter: 0,
      optin: 0,
    };

    const newCustomer = await PrestaShopService.createCustomer(customerData);

    if (!newCustomer || !newCustomer.id) {
      return NextResponse.json(
        { error: 'Error al crear la cuenta' },
        { status: 500 }
      );
    }

    // Return user data
    return NextResponse.json({
      success: true,
      user: {
        id: newCustomer.id,
        email: newCustomer.email,
        firstname: newCustomer.firstname || '',
        lastname: newCustomer.lastname || '',
        token: Buffer.from(`${newCustomer.id}:${newCustomer.email}`).toString('base64'),
      },
    });
  } catch (error: any) {
    console.error('Error en registro:', error);

    return NextResponse.json(
      { error: error.message || 'Error al crear la cuenta' },
      { status: 500 }
    );
  }
}
