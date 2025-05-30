"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import Script from "next/script"

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    product: "",
    emailProvider: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Send the form data to our API route
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to send message")
      }

      // Show success toast
      toast({
        title: "Message sent!",
        description: "We'll get back to you as soon as possible.",
      })

      // Reset form
      setFormData({
        name: "",
        email: "",
        company: "",
        product: "",
        emailProvider: "",
        message: "",
      })
    } catch (error) {
      console.error("Error submitting form:", error)
      toast({
        title: "Something went wrong",
        description: error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-2xl text-english-violet">Contact Us</CardTitle>
        <CardDescription>
          Fill out the form below or chat with our AI assistant to get in touch with our team.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="form" className="w-full">
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="form">Traditional Form</TabsTrigger>
            <TabsTrigger value="ai">AI Assistant</TabsTrigger>
          </TabsList>

          <TabsContent value="form">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Your name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    name="company"
                    placeholder="Your company"
                    value={formData.company}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="product">Product Interest</Label>
                  <Select value={formData.product} onValueChange={(value) => handleSelectChange("product", value)}>
                    <SelectTrigger id="product">
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="avatars">Email Avatars</SelectItem>
                      <SelectItem value="signatures">Email Signatures</SelectItem>
                      <SelectItem value="both">Both Products</SelectItem>
                      <SelectItem value="not-sure">Not Sure Yet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="emailProvider">Email Provider</Label>
                <Select
                  value={formData.emailProvider}
                  onValueChange={(value) => handleSelectChange("emailProvider", value)}
                >
                  <SelectTrigger id="emailProvider">
                    <SelectValue placeholder="Select your email provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="google">Google (Gmail, Google Workspace)</SelectItem>
                    <SelectItem value="outlook">Microsoft (Outlook, Office 365)</SelectItem>
                    <SelectItem value="other">Other Provider</SelectItem>
                    <SelectItem value="unknown">I Don't Know</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Your Message</Label>
                <Textarea
                  id="message"
                  name="message"
                  placeholder="Tell us about your needs or ask us a question..."
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-english-violet hover:bg-english-violet/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...
                  </>
                ) : (
                  "Send Message"
                )}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="ai" className="min-h-[300px]">
            <div className="w-full">
              <div className="mb-4 text-center">
                <p className="text-gray-900">
                  Chat with our AI assistant to help you with your inquiry. It will collect the same information as the
                  form in a conversational way.
                </p>
              </div>

              <div className="w-full h-300px flex items-center justify-center">
                <p className="text-gray-500">
                  The AI assistant will appear as a chat widget in the bottom right corner of the page.
                  <br />
                  <br />
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>

      {/* Load the ElevenLabs script and widget */}
      <Script
        id="elevenlabs-script"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            // Create the widget element
            const widget = document.createElement('elevenlabs-convai');
            widget.setAttribute('agent-id', 'BE6kueB9nSdDyR6AhH1y');
            document.body.appendChild(widget);
            
            // Load the script
            const script = document.createElement('script');
            script.src = 'https://elevenlabs.io/convai-widget/index.js';
            script.async = true;
            document.body.appendChild(script);
          `,
        }}
      />
    </Card>
  )
}
