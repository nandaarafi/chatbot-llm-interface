import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { auth } from '@/lib/auth';
import { getDocumentsByUserId } from '@/lib/db/query/document';
import { headers } from 'next/headers';

export async function GET() {
  try {
	const session = await auth.api.getSession({
		headers: await headers(),
	});
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const documents = await getDocumentsByUserId(session.user.id);
    
    return NextResponse.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
