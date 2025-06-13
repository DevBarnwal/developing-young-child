"use client"

import * as React from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { toast } from "sonner"

export function ContactForm() {
    const [mounted, setMounted] = React.useState(false)
    const [isSubmitting, setIsSubmitting] = React.useState(false)
    const [isSuccess, setIsSuccess] = React.useState(false)
    const [formData, setFormData] = React.useState({
        name: "",
        email: "",
        message: ""
    })

    React.useEffect(() => {
        setMounted(true)
    }, [])
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        
        // Basic validation
        if (!formData.name.trim()) {
            toast.error("Please provide a name")
            return
        }
        
        if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
            toast.error("Please provide a valid email")
            return
        }
        
        if (!formData.message.trim()) {
            toast.error("Please provide a message")
            return
        }
        
        setIsSubmitting(true)
        
        // Simulate form submission with a timeout
        setTimeout(() => {
            toast.success("Message sent successfully! We'll get back to you soon.")
            setFormData({ name: '', email: '', message: '' })
            setIsSuccess(true)
            setIsSubmitting(false)
            
            // Reset success message after 3 seconds
            setTimeout(() => {
                setIsSuccess(false)
            }, 3000)
        }, 1000)
    }
    
    // If not yet mounted, show a simplified version of the form to prevent hydration mismatches
    if (!mounted) {
        return <div className="space-y-4 min-h-[200px] bg-gray-50 dark:bg-gray-900 rounded-md" />
    }

    // If form was successfully submitted, show a success message
    if (isSuccess) {
        return (
            <div className="space-y-4 p-6 bg-green-50 dark:bg-green-900/30 rounded-md text-center">
                <div className="text-2xl font-semibold text-green-600 dark:text-green-400">Thank You!</div>
                <p className="text-green-700 dark:text-green-300">Your message has been received. We'll get back to you soon.</p>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <Input
                    type="text"
                    name="name"
                    placeholder="Your Name"
                    className="w-full px-4 py-2 rounded-md border border-border bg-background/50"
                    value={formData.name}
                    onChange={handleChange}
                    required
                />
            </div>
            <div>
                <Input
                    type="email"
                    name="email"
                    placeholder="Your Email"
                    className="w-full px-4 py-2 rounded-md border border-border bg-background/50"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />
            </div>
            <div>
                <textarea
                    placeholder="Your message"
                    name="message"
                    rows={6}
                    className="w-full px-4 py-2 rounded-md border border-border bg-background/50"
                    value={formData.message}
                    onChange={handleChange}
                    required
                ></textarea>
            </div>
            <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
            >
                {isSubmitting ? "SENDING..." : "SEND MESSAGE"}
            </Button>
        </form>
    )
}
