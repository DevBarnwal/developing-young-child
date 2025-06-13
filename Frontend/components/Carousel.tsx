"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "./ui/button"

interface CarouselProps {
  items: {
    image: string
    title: string
    description: string
  }[]
}

export function Carousel({ items }: CarouselProps) {
  const [mounted, setMounted] = React.useState(false)
  const [current, setCurrent] = React.useState(0)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const previousSlide = () => {
    setCurrent(current === 0 ? items.length - 1 : current - 1)
  }

  const nextSlide = () => {
    setCurrent(current === items.length - 1 ? 0 : current + 1)
  }

  React.useEffect(() => {
    const timer = setInterval(nextSlide, 5000) // Auto-advance every 5 seconds
    return () => clearInterval(timer)
  }, [current])
  // Avoid hydration mismatch by not rendering until mounted
  if (!mounted) {
    return <div className="relative w-full h-[600px] overflow-hidden bg-gray-100" />
  }

  return (
    <div className="relative w-full h-[600px] overflow-hidden">
      {/* Carousel items */}
      {items.map((item, index) => (
        <div
          key={index}
          className={`absolute w-full h-full transition-all duration-700 ease-in-out transform ${
            index === current ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
          }`}
        >
          <div className="relative w-full h-full">
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-4">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">{item.title}</h2>
              <p className="text-lg md:text-xl max-w-2xl">{item.description}</p>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation buttons */}      <Button
        variant="outline"
        size="icon"
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white hidden md:flex"
        onClick={previousSlide}
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white hidden md:flex"
        onClick={nextSlide}
      >
        <ChevronRight className="h-6 w-6" />
      </Button>

      {/* Dots indicator */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {items.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-all ${
              index === current ? "bg-white w-4" : "bg-white/50"
            }`}
            onClick={() => setCurrent(index)}
          />
        ))}
      </div>
    </div>
  )
}
