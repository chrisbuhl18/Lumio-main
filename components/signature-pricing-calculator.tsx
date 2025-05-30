"use client"

/**
 * @component SignaturePricingCalculator
 * @version 1.2.0
 * @description
 * Pricing calculator for email signatures that handles variant selection based on user count.
 *
 * CRITICAL COMPONENT: This component directly impacts checkout functionality and revenue.
 * Any changes should be thoroughly tested with actual Shopify variants.
 *
 * @lastModified 2023-04-16
 * @changelog
 * - 1.0.0: Initial implementation
 * - 1.1.0: Fixed variant selection to correctly match user count with Shopify variants
 * - 1.2.0: Updated display title logic to use product ID/handle instead of price ranges
 */

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"
import type { ShopifyProduct } from "@/lib/shopify"
import { createCart } from "@/lib/shopify"
import AnimationExamples from "@/components/animation-examples"

interface PricingOption {
  id: string
  name: string
  description: string
  price: number
  handle?: string
}

interface SignaturePricingCalculatorProps {
  title: string
  description: ReactNode
  products: ShopifyProduct[] | null
}

// Default price per user
const USER_PRICE = 50

export default function SignaturePricingCalculator({
  title,
  description,
  products: initialProducts,
}: SignaturePricingCalculatorProps) {
  const [products, setProducts] = useState<ShopifyProduct[] | null>(initialProducts)
  const [animationPackages, setAnimationPackages] = useState<PricingOption[]>([])
  const [selectedAnimation, setSelectedAnimation] = useState<string>("")
  const [userCount, setUserCount] = useState<number>(1)
  const [totalPrice, setTotalPrice] = useState<number>(0)
  const [isCustomPricing, setIsCustomPricing] = useState<boolean>(false)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  // Fetch products if not provided
  useEffect(() => {
    async function fetchProducts() {
      if (initialProducts) {
        setProducts(initialProducts)
        return
      }

      setLoading(true)
      try {
        // CRITICAL: This GraphQL query must include selectedOptions to properly match variants with user counts
        const response = await fetch("/api/shopify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: `
             query GetProductsByCollection($title: String!) {
               collections(first: 1, query: $title) {
                 edges {
                   node {
                     title
                     products(first: 10) {
                       edges {
                         node {
                           id
                           title
                           description
                           handle
                           variants(first: 20) {
                             edges {
                               node {
                                 id
                                 title
                                 priceV2 {
                                   amount
                                   currencyCode
                                 }
                                 availableForSale
                                 selectedOptions {
                                   name
                                   value
                                 }
                               }
                             }
                           }
                         }
                       }
                     }
                   }
                 }
               }
             }
           `,
            variables: {
              title: "Email Signatures",
            },
          }),
        })

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`)
        }

        const data = await response.json()

        if (data.error) {
          throw new Error(data.error)
        }

        if (
          !data.data ||
          !data.data.collections ||
          !data.data.collections.edges ||
          data.data.collections.edges.length === 0
        ) {
          throw new Error("Collection not found")
        }

        const collection = data.data.collections.edges[0].node

        if (!collection.products || !collection.products.edges || collection.products.edges.length === 0) {
          throw new Error(`No products found in collection`)
        }

        // Transform the response to a simpler format
        const fetchedProducts = collection.products.edges.map((edge: any) => {
          const product = edge.node
          return {
            id: product.id,
            title: product.title,
            description: product.description,
            handle: product.handle,
            variants: product.variants.edges.map((variantEdge: any) => {
              const variant = variantEdge.node
              return {
                id: variant.id,
                title: variant.title,
                price: variant.priceV2.amount,
                available: variant.availableForSale,
                selectedOptions: variant.selectedOptions,
              }
            }),
          }
        })

        setProducts(fetchedProducts)
      } catch (error) {
        console.error("Error fetching products:", error)
        setError(`Error fetching products: ${error instanceof Error ? error.message : String(error)}`)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [initialProducts])

  // Process products when they're available
  useEffect(() => {
    if (!products) return

    try {
      // Format products for the calculator
      const formattedPackages = products!.map((product) => {
        // Get the base price from the first variant
        const basePrice = product.variants.length > 0 ? Number.parseFloat(product.variants[0].price) : 0

        return {
          id: product.id,
          name: product.title,
          description: product.description,
          price: basePrice,
          handle: product.handle,
        }
      })

      setAnimationPackages(formattedPackages)
    } catch (error) {
      console.error("Error processing products:", error)
      setError(`Error: ${error instanceof Error ? error.message : String(error)}`)
    }
  }, [products])

  // Calculate total price
  useEffect(() => {
    const selectedPackage = animationPackages.find((p) => p.id === selectedAnimation)
    if (!selectedPackage) {
      setTotalPrice(0)
      return
    }

    if (userCount > 50) {
      setIsCustomPricing(true)
    } else {
      setIsCustomPricing(false)
      setTotalPrice(selectedPackage.price + USER_PRICE * userCount)
    }
  }, [selectedAnimation, userCount, animationPackages])

  /**
   * Helper function to determine the display title based on product ID or handle
   *
   * @param option - The pricing option
   * @returns The display title (Starter, Essential, or Premium)
   */
  const getDisplayTitle = (option: PricingOption): string => {
    // Check handle first (most reliable)
    if (option.handle) {
      if (option.handle.includes("starter")) return "Starter"
      if (option.handle.includes("custom")) return "Essential"
      if (option.handle.includes("premium")) return "Premium"
    }

    // Fallback to ID check
    const id = option.id.toLowerCase()
    if (id.includes("starter")) return "Starter"
    if (id.includes("custom") || id.includes("essential")) return "Essential"
    if (id.includes("premium")) return "Premium"

    // Fallback to name
    if (option.name === "Starter" || option.name === "Essential" || option.name === "Premium") {
      return option.name
    }

    // Last resort: determine by price
    if (option.price <= 950) return "Starter"
    if (option.price <= 1450) return "Essential"
    return "Premium"
  }

  /**
   * CRITICAL FUNCTION: Finds the variant ID that matches the user count
   *
   * This function is responsible for selecting the correct Shopify variant based on the user count.
   * It's critical for ensuring the correct price is charged at checkout.
   *
   * @param product - The Shopify product containing variants
   * @param userCount - The number of users selected
   * @returns The variant ID that matches the user count, or null if no match is found
   */
  const findVariantForUserCount = (product: ShopifyProduct, userCount: number): string | null => {
    if (!product || !product.variants || product.variants.length === 0) {
      console.error("Invalid product or no variants available", product)
      return null
    }

    // For user counts > 50, use the specific Custom Quote variant IDs
    if (userCount > 50) {
      console.log(`Using Custom Quote variant for user count > 50: ${userCount}`)

      // Determine which product this is (Starter, Essential, Premium)
      const productType = getDisplayTitle({
        id: product.id,
        name: product.title,
        description: product.description || "",
        price: 0,
        handle: product.handle,
      })

      // Use the specific variant ID based on product type
      if (productType === "Premium") {
        console.log("Using Premium Custom Quote variant ID: 44872062795961")
        return "gid://shopify/ProductVariant/44872062795961"
      } else if (productType === "Essential") {
        console.log("Using Essential Custom Quote variant ID: 44872056373433")
        return "gid://shopify/ProductVariant/44872056373433"
      } else if (productType === "Starter") {
        console.log("Using Starter Custom Quote variant ID: 44872043167929")
        return "gid://shopify/ProductVariant/44872043167929"
      }

      // If we couldn't determine the product type, fall back to the first variant
      console.warn("Could not determine product type for custom quote, using first variant")
      return product.variants[0].id
    }

    // Try to find an exact match for the user count
    console.log(`Looking for exact match for user count: ${userCount}`)
    const exactMatch = product.variants.find((variant) => {
      if (!variant.selectedOptions) return false
      return variant.selectedOptions.some(
        (option) => option.name === "User Count" && option.value === userCount.toString(),
      )
    })

    if (exactMatch) {
      console.log(`Found exact match variant: ${exactMatch.id}`)
      return exactMatch.id
    }

    console.log(`No exact match found, looking for closest match below ${userCount}`)
    // If no exact match, find the closest match below the requested count
    const validVariants = product.variants
      .filter((variant) => {
        if (!variant.selectedOptions) return false
        const countOption = variant.selectedOptions.find((option) => option.name === "User Count")
        if (!countOption) return false
        const count = Number.parseInt(countOption.value, 10)
        return !isNaN(count) && count <= userCount
      })
      .sort((a, b) => {
        const aCount = extractUserCount(a)
        const bCount = extractUserCount(b)
        return bCount - aCount // Sort in descending order
      })

    if (validVariants.length > 0) {
      console.log(`Using closest match variant: ${validVariants[0].id} (${extractUserCount(validVariants[0])} users)`)
      return validVariants[0]?.id || null
    }

    // Fallback to the first variant if no match is found
    console.log(`No matching variant found, using first variant: ${product.variants[0].id}`)
    return product.variants[0].id
  }

  /**
   * Helper function to extract user count from variant
   *
   * @param variant - The Shopify variant
   * @returns The user count as a number, or 0 if not found
   */
  const extractUserCount = (variant: any): number => {
    if (!variant.selectedOptions) return 0

    const countOption = variant.selectedOptions.find((option: any) => option.name === "User Count")
    if (!countOption) return 0

    const count = Number.parseInt(countOption.value, 10)
    return isNaN(count) ? 0 : count
  }

  /**
   * CRITICAL FUNCTION: Handles the "Get Started" button click
   *
   * This function is responsible for finding the correct variant and creating the cart.
   * It's critical for ensuring the correct product is added to the cart.
   *
   * DO NOT MODIFY without thorough testing with actual Shopify variants.
   */
  const handleGetStarted = async () => {
    setIsSubmitting(true)
    setError(null)

    try {
      // Find the selected animation package
      const selectedPackage = animationPackages.find((p) => p.id === selectedAnimation)
      if (!selectedPackage) {
        throw new Error("Selected package not found")
      }

      // Find the product in the original products array
      const product = products?.find((p) => p.id === selectedAnimation)
      if (!product) {
        throw new Error("Product not found")
      }

      // Find the variant that matches the user count
      const variantId = findVariantForUserCount(product, userCount)
      if (!variantId) {
        throw new Error(`No variant found for user count: ${userCount}`)
      }

      console.log(`Selected variant ID: ${variantId} for user count: ${userCount}`)

      // Create custom attributes for the cart
      const customAttributes = [
        {
          key: "User Count",
          value: userCount.toString(),
        },
      ]

      // Hardcoded selling plan ID for 50% deposit
      const sellingPlanId = "gid://shopify/SellingPlan/3226403001"

      // Create a cart with the selected variant and selling plan
      const cart = await createCart(variantId, 1, customAttributes, sellingPlanId)

      // Redirect to checkout
      window.location.href = cart.checkoutUrl
    } catch (error) {
      console.error("Error adding to cart:", error)
      setError(`Error: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <section id="pricing" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="heading-md text-english-violet mb-4">{title}</h2>
            <div className="text-lg text-gray-700 max-w-2xl mx-auto">{description}</div>
          </div>
          <div className="flex justify-center items-center py-20">
            <div className="animate-pulse text-xl text-english-violet">Loading pricing options...</div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="pricing" className="py-12 md:py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="heading-md text-english-violet mb-3 md:mb-4 text-3xl md:text-4xl">{title}</h2>
          <div className="text-base md:text-lg text-gray-700 max-w-xs sm:max-w-lg md:max-w-2xl mx-auto">
            {description}
          </div>
        </div>

        {error && (
          <div className="max-w-full sm:max-w-4xl mx-auto mb-6 md:mb-8">
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-3 py-2 md:px-4 md:py-3 rounded relative text-sm md:text-base">
              <strong className="font-bold">Note:</strong>
              <span className="block sm:inline"> {error}</span>
            </div>
          </div>
        )}

        <div className="max-w-full sm:max-w-2xl md:max-w-4xl mx-auto">
          {/* Pricing Options */}
          <div className="grid grid-cols-1 gap-8">
            {/* Animation Package - Business model updated to show only Starter and Premium packages */}
            <div className="bg-seasalt p-8 rounded-xl">
              <h3 className="text-2xl font-bold text-english-violet mb-6 text-center">
                Step #1: Select Animation Package
              </h3>
              <RadioGroup value={selectedAnimation} onValueChange={setSelectedAnimation} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                  {/* Sort and map the packages to ensure Starter, Essential, Premium order */}
                  {[...animationPackages]
                    .filter((option) => {
                      // Filter out the Essential package
                      const title = getDisplayTitle(option)
                      return title !== "Essential"
                    })
                    .sort((a, b) => {
                      // Order: Starter (1), Premium (2)
                      const order = { Starter: 1, Premium: 2 }
                      const aType = getDisplayTitle(a)
                      const bType = getDisplayTitle(b)
                      return (order[aType as keyof typeof order] || 99) - (order[bType as keyof typeof order] || 99)
                    })
                    .map((option) => {
                      // Get the display title based on product ID or handle
                      const displayTitle = getDisplayTitle(option)

                      return (
                        <div
                          key={option.id}
                          className={cn(
                            "flex flex-col rounded-xl border p-6 cursor-pointer transition-all",
                            selectedAnimation === option.id
                              ? "border-english-violet bg-white shadow-md"
                              : "border-transparent bg-white/50 hover:bg-white hover:shadow-sm",
                          )}
                          onClick={() => setSelectedAnimation(option.id)}
                        >
                          <div className="flex items-start mb-4">
                            <RadioGroupItem value={option.id} id={`animation-${option.id}`} className="mt-1" />
                            <div className="ml-3">
                              <Label htmlFor={`animation-${option.id}`} className="font-bold text-lg cursor-pointer">
                                {displayTitle}
                              </Label>
                              <p className="text-english-violet/70 font-medium text-lg">${option.price}</p>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 flex-grow">{option.description}</p>
                          {displayTitle === "Starter" && (
                            <AnimationExamples
                              examples={[
                                {
                                  src: "https://imagedelivery.net/nAvfNlDyCTDMbgRwQ09UKA/d4d68160-ef93-444e-6d59-509ba10ae500/150x150px",
                                  alt: "Animated flow",
                                },
                                { src: "/animations/examples/starter-spin.gif", alt: "Animated spin" },
                                { src: "/animations/examples/starter-pulse-spin.gif", alt: "Animated pulse spin" },
                              ]}
                            />
                          )}
                          {displayTitle === "Essential" && (
                            <AnimationExamples
                              examples={[
                                { src: "/animations/examples/essential-b.gif", alt: "Animated B logo" },
                                { src: "/animations/examples/essential-squares.gif", alt: "Animated squares" },
                                { src: "/animations/examples/essential-slip.gif", alt: "Animated Slip logo" },
                              ]}
                            />
                          )}
                          {displayTitle === "Premium" && (
                            <AnimationExamples
                              examples={[
                                { src: "/animations/examples/essential-slip.gif", alt: "Animated Slip logo" },
                                {
                                  src: "https://imagedelivery.net/nAvfNlDyCTDMbgRwQ09UKA/58bd7767-df02-4d72-e907-13d236d4ce00/150x150px",
                                  alt: "Animated Melalogic logo",
                                },
                                { src: "/animations/examples/premium-playpad.gif", alt: "Animated Playpad logo" },
                              ]}
                            />
                          )}
                        </div>
                      )
                    })}
                </div>
              </RadioGroup>
            </div>

            {/* User Count and Total Price side by side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* User Count */}
              <div className="bg-seasalt p-6 rounded-xl">
                <h3 className="text-2xl font-bold text-english-violet mb-6 text-center md:text-left">
                  Step #2: Select User Count
                </h3>
                <div className="rounded-xl border p-6 bg-white shadow-md">
                  <div className="flex flex-col">
                    <div className="mb-4">
                      <Label className="font-bold text-lg mb-1 block">Number of Users</Label>
                      <p className="text-sm text-gray-600 mb-3">Add the number of users in your organization</p>
                      <div className="flex items-center space-x-2">
                        <span className="text-english-violet/70 font-medium">${USER_PRICE}/user</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setUserCount(Math.max(1, userCount - 1))}
                        className="h-10 w-10 p-0 rounded-md"
                      >
                        -
                      </Button>
                      <Input
                        id="user-count"
                        type="number"
                        min="1"
                        max={100}
                        value={userCount}
                        onChange={(e) => {
                          const value = Number.parseInt(e.target.value)
                          if (!isNaN(value)) {
                            setUserCount(Math.max(1, value))
                          }
                        }}
                        className="h-10 text-center"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setUserCount(userCount + 1)
                        }}
                        className="h-10 w-10 p-0 rounded-md"
                      >
                        +
                      </Button>
                    </div>

                    {userCount > 50 ? (
                      <div className="mt-4 py-2">
                        <p className="font-medium text-english-violet">Custom Pricing Available</p>
                        <p className="text-sm text-gray-600 mt-1">Contact us for a custom quote for your team</p>
                      </div>
                    ) : (
                      <p className="mt-4 font-large text-english-violet/70">Subtotal: ${USER_PRICE * userCount}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Total Price Display - Smaller version */}
              <div
                className={cn(
                  "p-6 rounded-xl shadow-md flex flex-col justify-center transition-all duration-300",
                  selectedAnimation
                    ? "bg-gradient-to-r from-periwinkle to-misty-rose"
                    : "bg-gradient-to-r from-periwinkle/30 to-misty-rose/30 grayscale-[50%]",
                )}
              >
                <span className="text-4x1 text-english-violet/80 block mb-1">Your Total</span>
                {!selectedAnimation ? (
                  <h2 className="text-4xl font-bold text-english-violet/70">Select a Package to Continue...</h2>
                ) : isCustomPricing ? (
                  <h2 className="text-4xl font-bold text-english-violet">Custom Quote</h2>
                ) : (
                  <>
                    <h2 className="text-4xl font-bold text-english-violet mb-2 transform scale-110 px-4 pb-2">
                      ${totalPrice}
                    </h2>
                    <div className="inline-block bg-black/10 rounded-full px-6 py-2 mb-3">
                      <span className="font-medium text-english-violet">
                        50% Deposit: ${Math.round(totalPrice / 2)} today
                      </span>
                    </div>
                    <p className="text-english-violet/80 mb-2">
                      Remaining 50% will be auto-charged in 20 days or upon project completion.
                    </p>
                  </>
                )}
                <p className="text-english-violet/70 py-2">
                  All packages include installation and 2 rounds of revision. If additional revisions are needed, we'll
                  provide a personalized quote.
                </p>

                <Button
                  className="bg-english-violet hover:bg-english-violet/90 text-white px-6 py-4 text-lg rounded-full mt-6"
                  onClick={handleGetStarted}
                  disabled={isSubmitting || !selectedAnimation}
                >
                  {isSubmitting ? "Processing..." : selectedAnimation ? "Get Started" : "Select a Package"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
