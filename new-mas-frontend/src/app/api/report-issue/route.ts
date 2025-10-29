import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import axios from 'axios';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    
    const { name, email, issueType, description, attachment } = body;

    // Validate required fields
    if (!name || !email || !issueType || !description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Prepare issue data for backend API
    const issueData = {
      name,
      email,
      issueType,
      description,
      attachment: attachment || null,
      userId: session?.user?.id || null,
      isLoggedIn: !!session,
      submittedAt: new Date().toISOString(),
    };

    // Send to backend API using axios
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backendUrl) {
      throw new Error('Backend URL not configured');
    }

    const backendResponse = await axios.post(`${backendUrl}/api/issues`, issueData, {
      headers: {
        'Content-Type': 'application/json',
        // Include auth token if user is logged in
        ...(session?.backendToken && {
          'Authorization': `Bearer ${session.backendToken}`
        })
      }
    });

    const backendResult = backendResponse.data;

    return NextResponse.json(
      { 
        success: true, 
        message: 'Issue report submitted successfully',
        issueId: backendResult.id || backendResult.issueId,
        data: backendResult
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error submitting issue report:', error);
    
    // Handle axios errors specifically
    if (axios.isAxiosError(error)) {
      let errorMessage = 'Backend API error';
      let statusCode = 502;
      
      if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        errorMessage = 'Backend service is currently unavailable. Please try again later.';
        statusCode = 503;
      } else if (error.response) {
        // Server responded with error status
        errorMessage = error.response.data?.message || error.message || 'Backend API error';
        statusCode = error.response.status;
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = 'Unable to connect to backend service. Please try again later.';
        statusCode = 503;
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: statusCode }
      );
    }
    
    // Handle other errors
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
