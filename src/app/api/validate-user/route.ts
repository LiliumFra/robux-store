import { NextResponse } from 'next/server';

// ============================================================================
// Roblox Username Validation
// Validates that a Roblox username exists and retrieves user info
// ============================================================================

interface RobloxUserInfo {
  id: number;
  name: string;
  displayName: string;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    if (!username || username.length < 3) {
      return NextResponse.json({ 
        valid: false, 
        error: 'Usuario inválido (mínimo 3 caracteres)' 
      }, { status: 400 });
    }

    // Validate username format (alphanumeric and underscore only)
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return NextResponse.json({ 
        valid: false, 
        error: 'Usuario inválido (solo letras, números y guión bajo)' 
      });
    }

    // Use Roblox Users API to validate username
    const response = await fetch(
      'https://users.roblox.com/v1/usernames/users',
      {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          usernames: [username],
          excludeBannedUsers: true
        })
      }
    );

    if (!response.ok) {
      console.error('[Validate User] Roblox API error:', response.status);
      return NextResponse.json({ 
        valid: false, 
        error: 'Error validando usuario con Roblox' 
      });
    }

    const data = await response.json();
    const user = data.data?.[0] as RobloxUserInfo | undefined;

    if (!user) {
      return NextResponse.json({ 
        valid: false, 
        error: 'Usuario no encontrado en Roblox' 
      });
    }

    // Check if the username matches (case-insensitive)
    if (user.name.toLowerCase() !== username.toLowerCase()) {
      return NextResponse.json({
        valid: true,
        user: {
          id: user.id,
          name: user.name,
          displayName: user.displayName
        },
        warning: `Usuario correcto es: ${user.name}`
      });
    }

    return NextResponse.json({
      valid: true,
      user: {
        id: user.id,
        name: user.name,
        displayName: user.displayName
      }
    });

  } catch (error) {
    console.error('[Validate User] Error:', error);
    return NextResponse.json({ 
      valid: false, 
      error: 'Error validando usuario' 
    }, { status: 500 });
  }
}
