import { NextResponse } from 'next/server';
import { createDocument, getDocumentByUserId } from '@/lib/db/query/document';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { randomUUID } from 'crypto';

export const maxDuration = 60; // Set max duration to 60 seconds

// Helper function to handle fetch with retries
async function fetchWithRetry(url: string, options: RequestInit, retries = 3, delay = 1000): Promise<Response> {
  try {
    // Force IPv4 by using 127.0.0.1 instead of localhost
    const ipv4Url = url.replace('localhost', '127.0.0.1');
    const response = await fetch(ipv4Url, options);
    return response;
  } catch (error) {
    if (retries > 0) {
      console.log(`Retrying... ${retries} attempts left`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchWithRetry(url, options, retries - 1, delay);
    }
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    // Verify user is authenticated
    const session = await auth.api.getSession({
      headers: await headers() // you need to pass the headers object.
    })
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    // Prepare form data for Python backend
    const uploadFormData = new FormData();
    files.forEach((file) => {
      uploadFormData.append('files', file);
    });

    // Upload files to Python backend with retry mechanism
    const pythonBackendUrl = 'http://127.0.0.1:8000/upload/';
    let response;
    
    try {
      response = await fetchWithRetry(pythonBackendUrl, {
        method: 'POST',
        body: uploadFormData,
      });
    } catch (error) {
      console.error('Failed to connect to Python backend:', error);
      return NextResponse.json(
        { 
          error: 'Failed to connect to the processing service',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 502 } // Bad Gateway
      );
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error from Python backend:', errorText);
      return NextResponse.json(
        { 
          error: 'Failed to process files',
          details: errorText
        },
        { status: response.status }
      );
    }

    let uploadedFiles;
    try {
      uploadedFiles = await response.json();
    } catch (error) {
      console.error('Failed to parse Python backend response:', error);
      return NextResponse.json(
        { error: 'Invalid response from processing service' },
        { status: 500 }
      );
    }

    const userId = session.user.id;
    const insertedFiles = [];

    // Save each file to the database
    for (const fileData of uploadedFiles) {
      try {
        const newFile = await createDocument({
          id: fileData.id,
          userId,
          name: fileData.file_name,
          s3Key: fileData.id,
          metadata: fileData.metadata,
          processed: true,
          createdAt: new Date(fileData.created_at),
        });
        insertedFiles.push(newFile);
      } catch (dbError) {
        console.error('Error saving file to database:', dbError);
        // Continue with other files even if one fails
      }
    }

    if (insertedFiles.length === 0) {
      return NextResponse.json(
        { error: 'Failed to save files to database' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      files: insertedFiles,
      message: `${insertedFiles.length} file(s) uploaded successfully`
    });
  } catch (error) {
    console.error('Error in upload API:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET endpoint to list user's files
export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers() // you need to pass the headers object.
    })
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userFiles = await getDocumentByUserId(session.user.id);
    return NextResponse.json({ files: userFiles });
  } catch (error) {
    console.error('Error fetching files:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}