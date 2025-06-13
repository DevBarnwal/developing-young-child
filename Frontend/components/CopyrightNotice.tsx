"use client"

export function CopyrightNotice() {
    const currentYear = new Date().getFullYear()
    
    return (
        <p className="text-sm text-muted-foreground text-center">
            © {currentYear} NGO Platform. All rights reserved.
        </p>
    )
}
