import Link from "next/link"
import { HeartHandshake, Mail, Globe, Facebook, Twitter, Instagram, Phone, MapPin, Clock } from "lucide-react"
import { ContactForm } from "./ContactForm"
import { CopyrightNotice } from "./CopyrightNotice"
import { Button } from "./ui/button"

export function Footer() {
    return (
        <footer className="w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t">
            {/* Contact Form and Map Section */}
            <div className="mx-auto px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Contact Information */}
                    <div className="space-y-6 ">
                        <h2 className="text-2xl font-semibold">Get in Touch</h2>
                        <div className="space-y-4 ">
                            <div className="flex justify-center items-center gap-3">
                                <MapPin className="h-5 w-5 text-primary" />
                                <p className="text-muted-foreground">
                                    ChildCare India Foundation<br />
                                    Near SB Phule Police Station, Chinchwad<br />
                                    Pune, Maharashtra 411033
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <Phone className="h-5 w-5 text-primary" />
                                <p className="text-muted-foreground">+91 98220 56725</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <Mail className="h-5 w-5 text-primary" />
                                <p className="text-muted-foreground">info@childcare.co</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <Clock className="h-5 w-5 text-primary" />
                                <p className="text-muted-foreground">Mon - Sat: 9:00 AM - 6:00 PM</p>
                            </div>
                        </div>
                        <div className="flex gap-4 pt-4">
                            <Button variant="ghost" size="icon" className="rounded-full" asChild>
                                <a href="https://facebook.com/spacece" target="_blank" rel="noopener noreferrer">
                                    <Facebook className="h-5 w-5" />
                                </a>
                            </Button>
                            <Button variant="ghost" size="icon" className="rounded-full" asChild>
                                <a href="https://twitter.com/spacece" target="_blank" rel="noopener noreferrer">
                                    <Twitter className="h-5 w-5" />
                                </a>
                            </Button>
                            <Button variant="ghost" size="icon" className="rounded-full" asChild>
                                <a href="https://instagram.com/spacece" target="_blank" rel="noopener noreferrer">
                                    <Instagram className="h-5 w-5" />
                                </a>
                            </Button>
                        </div>
                    </div>
                    
                    
                    {/* Contact Form */}
                    <div className="rounded-lg bg-card p-6 shadow-sm">
                        <h2 className="text-2xl font-semibold mb-6">Contact Us</h2>
                        <ContactForm />
                    </div>
                </div>
            </div>

            {/* Main Footer Content */}
            <div className="border-t py-6 sm:py-8 px-4 sm:px-6 md:px-8">
                <div className="container mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {/* About Section */}
                        <div className="space-y-4">
                            <div className=" gap-2 items-center">
                                <HeartHandshake className="h-6 w-6 text-primary" />
                                <h3 className="text-lg font-semibold">ChildCare</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Providing the right stimulation at the right time for children aged 0-8 years through comprehensive early childhood development programs.
                            </p>
                        </div>

                        {/* Quick Links */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                            <ul className="space-y-2">
                                <li>
                                    <Link
                                        href="/about"
                                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        About Us
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/programs"
                                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        Our Programs
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/milestones"
                                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        Development Milestones
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/children"
                                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        Track Progress
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Get Involved */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Get Involved</h3>
                            <ul className="space-y-2">
                                <li>
                                    <Link
                                        href="/volunteer"
                                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        Become a Volunteer
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/parent-resources"
                                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        Parent Resources
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/training"
                                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        Training Programs
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/support"
                                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        Support Our Mission
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Resources */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Resources</h3>
                            <ul className="space-y-2">
                                <li>
                                    <Link
                                        href="/activities"
                                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        Development Activities
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/blog"
                                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        Early Education Blog
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/success-stories"
                                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        Success Stories
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/faq"
                                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        FAQs
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Copyright Notice */}
            <div className="border-t py-4 px-4 sm:px-6 md:px-8">
                <div className="container mx-auto text-center text-sm text-muted-foreground">
                    <CopyrightNotice />
                    <p className="mt-2">
                        Registered under the Maharashtra Public Trust Act Registration No: E-7670
                    </p>
                </div>
            </div>
        </footer>
    )
}
