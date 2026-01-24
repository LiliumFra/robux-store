import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
  });

  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (order.user_id !== session.userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  return NextResponse.json({ order });
}
