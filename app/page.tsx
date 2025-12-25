import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import Link from "next/link"
import { Check, Coins, UserCheck, Database, Award, TrendingUp, Brain, Zap } from "lucide-react"
import Stripe from 'stripe'

// Types
interface StripeProduct {
  id: string;
  name: string;
  description: string | null;
  features: string[];
  price: Stripe.Price;
}

// This makes the page dynamic instead of static
export const revalidate = 3600 // Revalidate every hour

async function getStripeProducts(): Promise<StripeProduct[]> {
  // Handle missing Stripe key during build
  if (!process.env.STRIPE_SECRET_KEY) {
    return [];
  }

  try {
    // Sanitize the Stripe key - remove whitespace and invalid characters
    const sanitizedKey = process.env.STRIPE_SECRET_KEY.trim().replace(/\s+/g, '');
    
    const stripe = new Stripe(sanitizedKey, {
      apiVersion: '2024-06-20'
    });

    const products = await stripe.products.list({
      active: true,
      expand: ['data.default_price']
    });

    return products.data.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description,
      features: product.metadata?.features ? JSON.parse(product.metadata.features) : [],
      price: product.default_price as Stripe.Price
    }));
  } catch (error) {
    console.error('Error fetching Stripe products:', error);
    return [];
  }
}

export default async function LandingPage() {
  const products = await getStripeProducts();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="w-full py-20 lg:py-32 xl:py-40">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none font-bold">
                Syntheverse
              </h1>
              <p className="text-xl text-muted-foreground md:text-2xl max-w-[700px]">
                Proof of Contribution System powered by hydrogen-holographic fractal evaluation
              </p>
            </div>
            <div className="space-x-4">
              <Link href="/signup">
                <Button size="lg" className="px-8">Get Started</Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="px-8">Sign In</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
        <div className="container px-4 md:px-6">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-12">
            Core Features
          </h2>
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="border-0 bg-card/50">
              <CardContent className="p-6">
                <div className="flex flex-col items-center space-y-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <Brain className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">AI-Powered Evaluation</h3>
                  <p className="text-muted-foreground text-center">
                    Hydrogen holographic fractal scoring across novelty, density, coherence, and alignment dimensions
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-card/50">
              <CardContent className="p-6">
                <div className="flex flex-col items-center space-y-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <Award className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">Metallic Amplifications</h3>
                  <p className="text-muted-foreground text-center">
                    Gold, Silver, and Copper qualifications. Certain combinations (e.g., Gold+Silver+Copper: 1.5×) produce amplifications
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-card/50">
              <CardContent className="p-6">
                <div className="flex flex-col items-center space-y-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <Database className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">Archive-First Storage</h3>
                  <p className="text-muted-foreground text-center">
                    All contributions stored immediately for redundancy detection and AI training
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-card/50">
              <CardContent className="p-6">
                <div className="flex flex-col items-center space-y-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <Coins className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">SYNTH Token Rewards</h3>
                  <p className="text-muted-foreground text-center">
                    Blockchain-anchored token allocations based on PoC scores and available tokens at registration time
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-card/50">
              <CardContent className="p-6">
                <div className="flex flex-col items-center space-y-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <UserCheck className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">Secure Authentication</h3>
                  <p className="text-muted-foreground text-center">
                    Supabase-powered auth with Google, GitHub OAuth and email/password options
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-card/50">
              <CardContent className="p-6">
                <div className="flex flex-col items-center space-y-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <Zap className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">Real-time Dashboard</h3>
                  <p className="text-muted-foreground text-center">
                    Live evaluation status, contribution metrics, and ecosystem impact visualization
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
              Alignment Tiers
            </h2>
            <p className="text-muted-foreground md:text-xl max-w-[600px]">
              Optional contribution packages for enhanced ecosystem participation
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
            {products.map((product) => (
              <Card key={product.id} className="relative">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {product.name}
                    {product.name.toLowerCase().includes('gold') && (
                      <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                    )}
                    {product.name.toLowerCase().includes('silver') && (
                      <div className="w-2 h-2 bg-gray-400 rounded-full" />
                    )}
                    {product.name.toLowerCase().includes('copper') && (
                      <div className="w-2 h-2 bg-orange-600 rounded-full" />
                    )}
                  </CardTitle>
                  <CardDescription>{product.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold mb-4">
                    {product.price.unit_amount
                      ? `$${(product.price.unit_amount / 100).toFixed(0)}`
                      : 'Custom'}
                  </p>
                  <ul className="space-y-2">
                    {product.features?.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm">
                        <Check className="mr-2 h-4 w-4 text-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Link href={`/signup?plan=${product.id}`} className="w-full">
                    <Button className="w-full">Get Started</Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
          <div className="text-center mt-8">
            <p className="text-muted-foreground">
              All evaluation submissions are <strong>free</strong>. Tokens are allocated when PoCs are approved and registered on-chain.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                Join the Syntheverse
              </h2>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                Contribute to the evolution of AI through hydrogen-holographic evaluation.
                Your work becomes part of the training data for the next generation of intelligent systems.
              </p>
            </div>
            <div className="space-x-4">
              <Link href="/signup">
                <Button size="lg" className="px-8">Start Contributing</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
