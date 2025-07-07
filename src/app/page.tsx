"use client"

import Image from "next/image"
import Link from "next/link"
import { Brain, Sparkles, ArrowRight } from "lucide-react"
import { Suspense } from "react";

import Header from "@/components/landing-page/Header";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function Page() {
  return (
    <>
      <Suspense fallback={<div>Loading Header...</div>}> {/* Wrap Header in Suspense */}
        <Header />
      </Suspense>
      <main>
        <div className="flex min-h-screen flex-col bg-background">
          {/* Header */}
          <header className="container mx-auto flex items-center justify-between px-4 py-6">
            <div className="flex items-center gap-2">
              {/* <Image 
                src="/mindscribe.png" 
                alt="Mindscribe Logo" 
                width={40} 
                height={40} 
                className="h-10 w-10" 
              /> */}
              {/* <span className="text-xl font-bold text-foreground">Mindscribe</span> */}
            </div>
          </header>

          {/* Main Content */}
          <main className="flex flex-1 flex-col">
            {/* Hero Section */}
            <section className="container mx-auto flex flex-1 flex-col items-center justify-center px-4 py-12 text-center">
              {/* Feature Badge */}
              <div className="flex justify-center mb-8">
              <button
                  className="
                    flex items-center gap-2 rounded-full
                    bg-blue-50 px-6 py-2 text-blue-600
                    transition-colors hover:bg-blue-100
                    dark:bg-blue-900 dark:text-blue-100 dark:hover:bg-blue-800
                  "
                >
                  <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-100" />
                  <span>AI-Powered Notes</span>
                </button>
              </div>

              <Button
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"

                  onClick={() => {
                    toast.success("Success notification from Sonner!");
                  }}
              >
                Test Toast Notification
              </Button>

              {/* Main Heading */}
              <h1 className="max-w-4xl text-5xl font-bold leading-tight tracking-tight md:text-6xl text-foreground">
                Transform Your Notes
                <br />
                Into Knowledge with
                <br />
                <span className="text-blue-600 dark:text-blue-300">Mindscribe</span>
              </h1>
              {/* Subheading */}
              <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-text">
                Join our community of productive professionals and be the first to access 
                AI-powered tools for taking smarter notes and organizing your thoughts.
              </p>

              {/* CTA Section */}
              <div className="mt-12 w-full max-w-md space-y-4 mx-auto">
                <div className="flex justify-center w-full">
                  {/* <ButtonLead extraStyle="w-full max-w-md" /> */}
                </div>
                
                {/* Feature Highlight */}
                <div className="flex items-center justify-center gap-2 text-sm text-muted-text">
  <Brain className="h-4 w-4 text-blue-600 dark:text-blue-300" />
  <span>Early access members get exclusive AI features</span>
</div>
              </div>
              
              {/* Social Proof */}
              <div className="mt-12 flex flex-col items-center gap-3">
                {/* <TestimonialsAvatars /> */}
                <p className="text-sm text-muted-text font-medium">
                  Joined by 10,000+ productive professionals
                </p>
              </div>
            </section>
          </main>
          {/* <Pricing /> */}
        </div>
      </main>
      {/* <Footer /> */}
    </>
  );
}