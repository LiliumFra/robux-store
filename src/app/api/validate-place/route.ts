import { NextResponse } from 'next/server';

// ============================================================================
// Roblox Place ID Validation
// Validates that a Place ID exists and retrieves game info
// ============================================================================

interface RobloxGameInfo {
  id: number;
  rootPlaceId: number;
  name: string;
  description: string;
  creator: {
    id: number;
    name: string;
    type: string;
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const placeId = searchParams.get('placeId');

    if (!placeId || isNaN(parseInt(placeId))) {
      return NextResponse.json({ 
        valid: false, 
        error: 'Place ID inválido' 
      }, { status: 400 });
    }

    // First, get the universe ID from the place ID
    const universeResponse = await fetch(
      `https://apis.roblox.com/universes/v1/places/${placeId}/universe`,
      { headers: { 'Accept': 'application/json' } }
    );

    if (!universeResponse.ok) {
      return NextResponse.json({ 
        valid: false, 
        error: 'Place ID no encontrado en Roblox' 
      });
    }

    const universeData = await universeResponse.json();
    const universeId = universeData.universeId;

    // Now get the game details
    const gameResponse = await fetch(
      `https://games.roblox.com/v1/games?universeIds=${universeId}`,
      { headers: { 'Accept': 'application/json' } }
    );

    if (!gameResponse.ok) {
      return NextResponse.json({ 
        valid: false, 
        error: 'No se pudo obtener información del juego' 
      });
    }

    const gameData = await gameResponse.json();
    const game = gameData.data?.[0] as RobloxGameInfo | undefined;

    if (!game) {
      return NextResponse.json({ 
        valid: false, 
        error: 'Juego no encontrado' 
      });
    }

    return NextResponse.json({
      valid: true,
      game: {
        id: game.id,
        name: game.name,
        creator: game.creator?.name || 'Desconocido'
      }
    });

  } catch (error) {
    console.error('[Validate Place] Error:', error);
    return NextResponse.json({ 
      valid: false, 
      error: 'Error validando Place ID' 
    }, { status: 500 });
  }
}
