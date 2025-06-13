"use client"

import * as React from "react"
import { HeroSection } from "@/components/HeroSection"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"
import { Brain, Users, HomeIcon, Heart, GraduationCap, BookOpen, Star, Activity, Clock } from "lucide-react"
import Link from "next/link"
import image1 from "@/public/images/hero-1.jpg"

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } }
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
}

const MilestoneCard = ({ age, milestones }: { age: string; milestones: string[] }) => (
  <motion.div
    variants={fadeInUp}
    className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg"
  >
    <h3 className="text-xl font-bold text-primary mb-4">{age}</h3>
    <ul className="space-y-2">
      {milestones.map((milestone, index) => (
        <li key={index} className="flex items-start gap-2">
          <Star className="h-5 w-5 text-primary mt-1" />
          <span className="text-gray-600 dark:text-gray-300">{milestone}</span>
        </li>
      ))}
    </ul>
  </motion.div>
)

const ActivityCard = ({ icon: Icon, title, description, duration }: { icon: any; title: string; description: string; duration: string }) => (
  <motion.div
    variants={fadeInUp}
    className="group relative overflow-hidden rounded-lg shadow-lg bg-white dark:bg-gray-900 p-6"
    whileHover={{ scale: 1.02 }}
    transition={{ duration: 0.2 }}
  >
    <div className="flex items-center gap-4 mb-4">
      <div className="p-2 rounded-full bg-primary/10">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          {duration}
        </div>
      </div>
    </div>
    <p className="text-gray-600 dark:text-gray-300">{description}</p>
  </motion.div>
)

export default function Home() {
  const [mounted, setMounted] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(true)
  
  React.useEffect(() => {
    setMounted(true)
    const timer = setTimeout(() => setIsLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])
  
  if (!mounted) {
    return <div className="min-h-screen bg-gray-100 dark:bg-gray-900" />
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black p-6">
        <div className="container mx-auto">
          <Skeleton className="h-[400px] w-full rounded-lg mb-12" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-[200px] w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <main className="bg-white dark:bg-black">
      <HeroSection />

      {/* Development Milestones Section */}
      <section className="py-20 px-6 bg-gray-50 dark:bg-black">
        <div className="container mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-bold text-center mb-6 text-gray-900 dark:text-white"
          >
            Key Development Milestones
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto"
          >
            Understanding your child's developmental stages helps provide the right support at the right time
          </motion.p>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            <MilestoneCard
              age="0-2 Years"
              milestones={[
                "Responds to sounds and faces",
                "Starts crawling and walking",
                "Begins forming simple words",
                "Shows curiosity in surroundings"
              ]}
            />
            <MilestoneCard
              age="2-5 Years"
              milestones={[
                "Develops language skills",
                "Shows emotional awareness",
                "Improves motor skills",
                "Engages in imaginative play"
              ]}
            />
            <MilestoneCard
              age="5-8 Years"
              milestones={[
                "Enhanced social interactions",
                "Better problem-solving",
                "Improved coordination",
                "Growing independence"
              ]}
            />
          </motion.div>
          <div className="text-center mt-8">
            <Link href="/milestones">
              <Button variant="outline" size="lg">
                View All Milestones
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Parent Activities Section */}
      <section className="py-20 px-6 bg-white dark:bg-black">
        <div className="container mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-bold text-center mb-6 text-gray-900 dark:text-white"
          >
            Activities for Parents
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto"
          >
            Simple yet effective activities you can do at home to support your child's development
          </motion.p>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            <ActivityCard
              icon={Brain}
              title="Cognitive Games"
              description="Fun puzzles and memory games that enhance your child's thinking and problem-solving skills"
              duration="15-20 minutes"
            />
            <ActivityCard
              icon={Activity}
              title="Motor Skill Activities"
              description="Physical activities that help develop both fine and gross motor skills"
              duration="20-30 minutes"
            />
            <ActivityCard
              icon={BookOpen}
              title="Story Time"
              description="Interactive storytelling sessions that boost language and imagination"
              duration="10-15 minutes"
            />
          </motion.div>
          <div className="text-center mt-8">
            <Link href="/activities">
              <Button variant="outline" size="lg">
                Explore All Activities
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-6 dark:bg-black bg-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="container mx-auto text-center"
        >
          <h2 className="text-3xl text-black dark:text-white md:text-4xl font-bold mb-6">
            Begin Your Child's Development Journey
          </h2>
          <p className="text-xl text-black dark:text-white mb-8 max-w-2xl mx-auto">
            Join ChildCare to get personalized guidance and support for your child's early development
          </p>
          <div className="space-x-4">
            <Button
              size="lg"
              variant="default"
              className="bg-primary hover:bg-primary/90"
              asChild
            >
              <Link href="/register">
                Get Started
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="dark:border-gray-300 dark:text-gray-300 dark:hover:bg-gray-700"
              asChild
            >
              <Link href="/parent-resources">
                View Resources
              </Link>
            </Button>
          </div>
        </motion.div>
      </section>
    </main>
  )
}
