import { NextRequest, NextResponse } from 'next/server'

// Type for the form data
interface ContactFormData {
  name: string
  email: string
  message: string
}

// Form validation function
const validateFormData = (data: ContactFormData) => {
  const errors: Partial<Record<keyof ContactFormData, string>> = {}

  if (!data.name || data.name.trim() === '') {
    errors.name = 'Please provide a name'
  }

  if (!data.email || data.email.trim() === '') {
    errors.email = 'Please provide an email'
  } else if (!/\S+@\S+\.\S+/.test(data.email)) {
    errors.email = 'Please provide a valid email'
  }

  if (!data.message || data.message.trim() === '') {
    errors.message = 'Please provide a message'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

// Main handler function
export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const data: ContactFormData = await request.json()
    
    // Validate the form data
    const { isValid, errors } = validateFormData(data)
    
    if (!isValid) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid input data: ' + Object.values(errors)[0]
        }, 
        { status: 400 }
      )
    }
    
    // In a real application, you would store the data in a database or send an email
    console.log('Form submission received:', data)
    
    // Return success response
    return NextResponse.json({ 
      success: true,
      message: 'Form submitted successfully' 
    })
    
  } catch (error) {
    console.error('Contact form submission error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process form submission' },
      { status: 500 }
    )
  }
}
