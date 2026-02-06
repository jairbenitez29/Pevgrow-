import { NextResponse } from "next/server";
import axios from 'axios';

export async function GET() {
  const results: any = {
    timestamp: new Date().toISOString(),
    env: {
      PRESTASHOP_API_URL: process.env.PRESTASHOP_API_URL ? '✓ Set' : '✗ Missing',
      PRESTASHOP_API_KEY: process.env.PRESTASHOP_API_KEY ? '✓ Set' : '✗ Missing',
      PRESTASHOP_HTACCESS_USER: process.env.PRESTASHOP_HTACCESS_USER ? '✓ Set' : '✗ Missing',
      PRESTASHOP_HTACCESS_PASSWORD: process.env.PRESTASHOP_HTACCESS_PASSWORD ? '✓ Set' : '✗ Missing',
    },
    tests: []
  };

  const apiUrl = process.env.PRESTASHOP_API_URL || 'https://ps9.pevgrow.com/api';
  const apiKey = process.env.PRESTASHOP_API_KEY || '';
  const htUser = process.env.PRESTASHOP_HTACCESS_USER || 'dev';
  const htPass = process.env.PRESTASHOP_HTACCESS_PASSWORD || '';

  // Test 1: Sin autenticación
  try {
    const res = await axios.get(`${apiUrl}/products?output_format=JSON&limit=1`, {
      timeout: 10000,
      validateStatus: () => true
    });
    results.tests.push({
      test: 'Sin autenticación',
      status: res.status,
      statusText: res.statusText,
      headers: res.headers['www-authenticate'] || 'none'
    });
  } catch (e: any) {
    results.tests.push({
      test: 'Sin autenticación',
      error: e.message,
      code: e.code
    });
  }

  // Test 2: Solo con API Key
  try {
    const res = await axios.get(`${apiUrl}/products?output_format=JSON&limit=1`, {
      timeout: 10000,
      auth: { username: apiKey, password: '' },
      validateStatus: () => true
    });
    results.tests.push({
      test: 'Solo API Key',
      status: res.status,
      statusText: res.statusText,
      dataPreview: typeof res.data === 'object' ? JSON.stringify(res.data).substring(0, 100) : 'not JSON'
    });
  } catch (e: any) {
    results.tests.push({
      test: 'Solo API Key',
      error: e.message,
      code: e.code
    });
  }

  // Test 3: Con credenciales htaccess en URL + API Key
  try {
    const url = new URL(apiUrl);
    const urlWithAuth = `${url.protocol}//${encodeURIComponent(htUser)}:${encodeURIComponent(htPass)}@${url.host}${url.pathname}/products?output_format=JSON&limit=1`;

    const res = await axios.get(urlWithAuth, {
      timeout: 10000,
      auth: { username: apiKey, password: '' },
      validateStatus: () => true
    });
    results.tests.push({
      test: 'htaccess en URL + API Key',
      status: res.status,
      statusText: res.statusText,
      dataPreview: typeof res.data === 'object' ? JSON.stringify(res.data).substring(0, 200) : 'not JSON'
    });
  } catch (e: any) {
    results.tests.push({
      test: 'htaccess en URL + API Key',
      error: e.message,
      code: e.code
    });
  }

  return NextResponse.json(results, { status: 200 });
}
