import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { name } = data
    
    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Name is required' },
        { status: 400 }
      )
    }
    
    // This is a stub implementation
    // In a real application, you would forward this request to your backend API
    // The actual update should happen in your backend server that handles authentication
    
    return NextResponse.json({ 
      success: true,
      message: 'Profile updated successfully',
      data: { name }
    })
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}
