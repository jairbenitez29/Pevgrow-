import { NextResponse } from 'next/server';
import PrestaShopService from '@/lib/prestashop/PrestaShopService';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña son requeridos' },
        { status: 400 }
      );
    }

    // Search for customer by email
    const customers = await PrestaShopService.getCustomers({ filter: { email } });

    if (!customers || customers.length === 0) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    const customer = customers[0];

    // NOTE: PrestaShop uses MD5 hashing with cookie key
    // For security reasons, we can't verify the password directly
    // In a production environment, you should:
    // 1. Use PrestaShop's built-in authentication module
    // 2. Or create a custom PrestaShop module with a secure endpoint
    // For now, we'll just verify the email exists and return the user data
    // This is NOT secure for production use

    // In a real implementation, you would validate the password against PrestaShop
    // For this demo, we'll return success if the customer exists

    return NextResponse.json({
      success: true,
      user: {
        id: customer.id,
        email: customer.email,
        firstname: customer.firstname || '',
        lastname: customer.lastname || '',
        token: Buffer.from(`${customer.id}:${customer.email}`).toString('base64'),
      },
    });
  } catch (error: any) {
    console.error('Error en login:', error);

    return NextResponse.json(
      { error: error.message || 'Error al iniciar sesión' },
      { status: 500 }
    );
  }
}
