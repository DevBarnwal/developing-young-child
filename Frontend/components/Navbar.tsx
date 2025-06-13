"use client"

import * as React from "react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { CircleCheckIcon, CircleHelpIcon, CircleIcon, HeartHandshakeIcon, UsersIcon, GlobeIcon, Moon, Sun, Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"

const programs: { title: string; href: string; description: string }[] = [
  {
    title: "Early Education",
    href: "/programs/education",
    description:
      "Comprehensive early childhood education programs for ages 0-8 years.",
  },
  {
    title: "Parent Education",
    href: "/programs/parent-education",
    description:
      "Empowering parents with knowledge and tools for early childhood development.",
  },
  {
    title: "Development Tracking",
    href: "/programs/development",
    description:
      "Monitor and track children's cognitive, motor, and social development.",
  },
  {
    title: "Volunteer Training",
    href: "/programs/volunteer",
    description: "Training and resources for our door-to-door service volunteers.",
  },
  {
    title: "Home Learning",
    href: "/programs/home-learning",
    description:
      "Creating effective home learning environments for early development.",
  },
  {
    title: "Community Outreach",
    href: "/programs/community",
    description:
      "Building awareness about early childhood development in communities.",
  },
]

function ListItem({
  className,
  title,
  children,
  href,
  ...props
}: React.ComponentPropsWithoutRef<"a"> & {
  title: string
  href: string
}) {
  return (
    <NavigationMenuLink asChild>
      <Link
        href={href}
        className={cn(
          "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
          className
        )}
        {...props}
      >
        <div className="text-sm font-medium leading-none">{title}</div>
        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
          {children}
        </p>
      </Link>
    </NavigationMenuLink>
  )
}

// Add loading state components
const LoadingSpinner = () => (
  <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
)

export function NavigationMenuDemo() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const handleNavigation = async (href: string) => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 200)) // Simulate navigation delay
      window.location.href = href
    } catch (error) {
      console.error('Navigation failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="fixed flex top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between w-full max-w-screen-xl mx-auto px-4 h-16">
        {/* Logo/Brand with improved accessibility */}
        <Link href="/" className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary rounded-md" aria-label="Home">
          <HeartHandshakeIcon className="h-6 w-6 text-primary" />
          <span className="font-semibold hidden sm:inline">ChildCare</span>
        </Link>

        {/* Desktop Navigation with loading states */}
        <div className="hidden md:flex items-center flex-1 justify-center">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger 
                  className="h-10 px-4 py-2"
                  disabled={isLoading}
                >
                  Programs
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                    {programs.map((program) => (
                        <div
                        key={program.href}
                        className="block space-y-1 rounded-md p-3 leading-none"
                        >
                        <div className="text-sm font-medium leading-none">{program.title}</div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                          {program.description}
                        </p>
                        </div>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link 
                    href="/children" 
                    className={cn(navigationMenuTriggerStyle())}
                  >
                    {isLoading ? <LoadingSpinner /> : "Children"}
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link 
                    href="/visits/new" 
                    className={cn(navigationMenuTriggerStyle())}
                  >
                    {isLoading ? <LoadingSpinner /> : "Record Visit"}
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link 
                    href="/activities" 
                    className={cn(navigationMenuTriggerStyle())}
                  >
                    Activities
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link 
                    href="/milestones" 
                    className={cn(navigationMenuTriggerStyle())}
                  >
                    Milestones
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Theme toggle and mobile menu with improved accessibility */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="focus:ring-2 focus:ring-primary"
            aria-label={theme === "light" ? "Switch to dark theme" : "Switch to light theme"}
          >
            {theme === "light" ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
          </Button>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden focus:ring-2 focus:ring-primary"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="fixed inset-x-0 top-16 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
          <nav className="flex flex-col p-4 border-t">
            {programs.map((program) => (
              <Link
                key={program.href}
                href={program.href}
                className="px-4 py-2 text-sm hover:bg-accent rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                {program.title}
              </Link>
            ))}
            <Link
              href="/children"
              className="px-4 py-2 text-sm hover:bg-accent rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              Children
            </Link>
            <Link
              href="/visits/new"
              className="px-4 py-2 text-sm hover:bg-accent rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              Record Visit
            </Link>
            <Link
              href="/activities"
              className="px-4 py-2 text-sm hover:bg-accent rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              Activities
            </Link>
            <Link
              href="/milestones"
              className="px-4 py-2 text-sm hover:bg-accent rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              Milestones
            </Link>
          </nav>
        </div>
      )}
    </div>
  )
}
