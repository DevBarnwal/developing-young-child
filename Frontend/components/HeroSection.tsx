"use client"

import * as React from "react"
import { Button } from "./ui/button"
import { Carousel } from "./Carousel"
import Link from "next/link"
import { Brain, Heart, Book } from "lucide-react"
import image1 from "@/public/images/hero-1.jpg"
import image2 from "@/public/images/hero-2.jpg"
import image3 from "@/public/images/hero-3.jpg"

const carouselItems = [
    {
        image: image1.src,
        title: "Early Childhood Development",
        description: "Give your child the right stimulation at the right time for optimal development"
    },
    {
        image: image2.src,
        title: "Parent Education",
        description: "Learn how to create an enriching home environment for your child's growth"
    },
    {
        image: image3.src,
        title: "Door-to-Door Support",
        description: "Get personalized guidance and support through our home visit programs"
    }
]

export function HeroSection() {
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    // Avoid hydration mismatch by rendering a placeholder until mounted
    if (!mounted) {
        return <section className="relative min-h-[600px] bg-gray-100" />
    }

    return (
        <section className="relative">
            <Carousel items={carouselItems} />                    

            {/* Auth buttons */}
            <div className="absolute top-4 right-4 z-10 flex gap-2">
                <Link href="/login">
                    <Button size="sm" variant="ghost" className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm">
                        Parent Login
                    </Button>
                </Link>
                <Link href="/register">
                    <Button size="sm" className="bg-primary hover:bg-primary/90">
                        Join Us
                    </Button>
                </Link>
            </div>            
        </section>
    )
}
