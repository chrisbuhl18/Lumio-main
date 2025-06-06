import { cn } from "@/lib/utils"
import { Mail, Phone, Facebook, Linkedin, Instagram, Twitter } from "lucide-react"
import SignatureHeadshot from "./signature-headshot"

interface SignatureMockupProps {
  className?: string
}

export default function SignatureMockup({ className }: SignatureMockupProps) {
  return (
    <div className={cn("relative pt-10", className)}>
      {/* Desktop version - only visible on md and up */}
      <div className="hidden md:block">
        {/* Laptop frame */}
        <div className="w-[600px] mx-auto">
          <div className="bg-gray-800 h-[400px] rounded-xl p-3 shadow-xl">
            <div className="bg-white h-full w-full rounded-lg overflow-hidden relative">
              {/* Email client interface */}
              <div className="h-full flex flex-col">
                {/* Email client header */}
                <div className="h-12 bg-gray-100 border-b flex items-center px-4">
                  <div className="flex space-x-2 mr-4">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                  <div className="flex-1 flex items-center justify-center">
                    <div className="w-64 h-6 bg-gray-200 rounded-full"></div>
                  </div>
                </div>

                {/* Email client sidebar and content */}
                <div className="flex-1 flex">
                  {/* Sidebar */}
                  <div className="w-[150px] bg-gray-50 p-3 border-r">
                    <div className="w-full h-8 bg-misty-rose rounded-lg mb-3"></div>
                    <div className="space-y-2">
                      <div className="w-full h-6 bg-gray-200 rounded"></div>
                      <div className="w-full h-6 bg-gray-200 rounded"></div>
                      <div className="w-full h-6 bg-english-violet/20 rounded"></div>
                      <div className="w-full h-6 bg-gray-200 rounded"></div>
                      <div className="w-full h-6 bg-gray-200 rounded"></div>
                    </div>
                  </div>

                  {/* Email content */}
                  <div className="flex-1 p-6">
                    {/* Email header - Simplified */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <div className="w-6 h-6 bg-gray-200 rounded-full mr-2"></div>
                          <div>
                            <div className="text-xs font-bold">Sarah Johnson</div>
                            <div className="text-xs text-gray-500">sarah@golumio.co</div>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">10:45 AM</div>
                      </div>
                      <div className="text-xs font-bold">Re: Project Update</div>
                    </div>

                    {/* Email body - Reduced to 2 lines */}
                    <div className="text-xs mb-4">
                      <p className="mb-2">Hi there,</p>
                      <p>Thank you for your email. I've attached the project details as requested.</p>
                    </div>

                    {/* Email signature */}
                    <div className="border-t pt-4">
                      <div className="flex items-start">
                        {/* Left column with animated headshot and social icons */}
                        <div className="mr-6 flex-shrink-0 flex flex-col items-center">
                          {/* Animated headshot - made larger */}
                          <SignatureHeadshot size="md" className="mb-3" />

                          {/* Social icons moved under the GIF */}
                          <div className="flex items-center space-x-2">
                            <div className="w-5 h-5 bg-english-violet/80 rounded-full flex items-center justify-center">
                              <Facebook className="h-3 w-3 text-white" />
                            </div>
                            <div className="w-5 h-5 bg-english-violet/80 rounded-full flex items-center justify-center">
                              <Linkedin className="h-3 w-3 text-white" />
                            </div>
                            <div className="w-5 h-5 bg-english-violet/80 rounded-full flex items-center justify-center">
                              <Instagram className="h-3 w-3 text-white" />
                            </div>
                            <div className="w-5 h-5 bg-english-violet/80 rounded-full flex items-center justify-center">
                              <Twitter className="h-3 w-3 text-white" />
                            </div>
                          </div>
                        </div>

                        {/* Right column with signature text */}
                        <div className="flex flex-col space-y-1 pt-1">
                          <div className="font-bold text-english-violet text-base">SARAH JOHNSON</div>
                          <div className="text-sm text-gray-600">Marketing Director // Lumio</div>

                          <div className="flex items-center text-sm text-gray-600 mt-1">
                            <Mail className="h-4 w-4 mr-2" />
                            <span>sarah@golumio.co</span>
                          </div>

                          <div className="flex items-center text-sm text-gray-600">
                            <Phone className="h-4 w-4 mr-2" />
                            <span>(555) 123-4567</span>
                          </div>

                          <div className="text-sm text-gray-500 mt-1">Make Memorable Emails</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-800 h-[10px] w-[80%] mx-auto rounded-b-xl"></div>
          <div className="bg-gray-700 h-[10px] w-[60%] mx-auto rounded-b-lg"></div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-misty-rose rounded-full opacity-70 z-0"></div>
        <div className="absolute -top-4 -right-4 w-20 h-20 bg-periwinkle rounded-full opacity-70 z-0"></div>
      </div>

      {/* Mobile version - only visible below md */}
      <div className="md:hidden">
        {/* Centered laptop frame for mobile - maximized width */}
        <div className="w-full max-w-[320px] mx-auto">
          <div className="bg-gray-800 h-[280px] rounded-lg p-2 shadow-lg">
            <div className="bg-white h-full w-full rounded-md overflow-hidden relative">
              {/* Email client interface - simplified */}
              <div className="h-full flex flex-col">
                {/* Email client header */}
                <div className="h-8 bg-gray-100 border-b flex items-center px-2">
                  <div className="flex space-x-1 mr-2">
                    <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  </div>
                  <div className="flex-1 flex items-center justify-center">
                    <div className="w-32 h-4 bg-gray-200 rounded-full"></div>
                  </div>
                </div>

                {/* Email content - simplified but larger */}
                <div className="flex-1 p-3">
                  {/* Email header */}
                  <div className="mb-2">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-gray-200 rounded-full mr-1"></div>
                        <div className="text-xs font-bold">Sarah Johnson</div>
                      </div>
                      <div className="text-[10px] text-gray-500">10:45 AM</div>
                    </div>
                    <div className="text-xs font-bold">Re: Project Update</div>
                  </div>

                  {/* Email body - one line */}
                  <div className="text-xs mb-3">
                    <p>Thank you for your email.</p>
                  </div>

                  {/* Email signature - larger and more prominent */}
                  <div className="border-t pt-3">
                    <div className="flex items-start">
                      {/* Left column with animated headshot - larger size for mobile */}
                      <div className="mr-3 flex-shrink-0">
                        <SignatureHeadshot size="md" className="mb-2" />

                        {/* Add social icons below the headshot */}
                        <div className="flex items-center space-x-1 justify-center">
                          <div className="w-4 h-4 bg-english-violet/80 rounded-full flex items-center justify-center">
                            <Facebook className="h-2.5 w-2.5 text-white" />
                          </div>
                          <div className="w-4 h-4 bg-english-violet/80 rounded-full flex items-center justify-center">
                            <Linkedin className="h-2.5 w-2.5 text-white" />
                          </div>
                          <div className="w-4 h-4 bg-english-violet/80 rounded-full flex items-center justify-center">
                            <Instagram className="h-2.5 w-2.5 text-white" />
                          </div>
                          <div className="w-4 h-4 bg-english-violet/80 rounded-full flex items-center justify-center">
                            <Twitter className="h-2.5 w-2.5 text-white" />
                          </div>
                        </div>
                      </div>

                      {/* Right column with signature text - larger text */}
                      <div className="flex flex-col space-y-1 pt-1">
                        <div className="font-bold text-english-violet text-sm">SARAH JOHNSON</div>
                        <div className="text-xs text-gray-600">Marketing Director // Lumio</div>

                        <div className="flex items-center text-xs text-gray-600 mt-1">
                          <Mail className="h-3 w-3 mr-1" />
                          <span>sarah@golumio.co</span>
                        </div>

                        <div className="flex items-center text-xs text-gray-600">
                          <Phone className="h-3 w-3 mr-1" />
                          <span>(555) 123-4567</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-800 h-[8px] w-[80%] mx-auto rounded-b-lg"></div>
          <div className="bg-gray-700 h-[8px] w-[60%] mx-auto rounded-b-md"></div>
        </div>

        {/* Decorative elements - centered positioning */}
        <div className="absolute -bottom-3 -left-3 w-16 h-16 bg-misty-rose rounded-full opacity-70 z-0"></div>
        <div className="absolute -top-3 -right-3 w-16 h-16 bg-periwinkle rounded-full opacity-70 z-0"></div>
      </div>
    </div>
  )
}
