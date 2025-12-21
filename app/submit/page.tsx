import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { FileText, Brain, Award, Coins, AlertTriangle } from "lucide-react"
import Link from "next/link"

export default async function SubmitPage() {
    const supabase = createClient()

    const { data, error } = await supabase.auth.getUser()
    if (error || !data?.user) {
        redirect('/login')
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Submit Contribution</h1>
                <p className="text-muted-foreground mt-2">
                    Upload your work for hydrogen-holographic evaluation
                </p>
            </div>

            {/* Note about current implementation */}
            <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Demo Implementation</AlertTitle>
                <AlertDescription>
                    This is a demo interface. The full Syntheverse contribution system with AI evaluation
                    and blockchain registration would be implemented in the complete application.
                </AlertDescription>
            </Alert>

            {/* Contribution Process Overview */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Step 1: Prepare Your Work
                        </CardTitle>
                        <CardDescription>
                            Create or identify your contribution for evaluation
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                            Scientific papers, technical documentation, research findings,
                            or any intellectual contribution that advances human knowledge.
                        </p>
                        <ul className="text-sm space-y-1 ml-4">
                            <li>• PDF format preferred</li>
                            <li>• Include metadata and context</li>
                            <li>• Ensure original work</li>
                        </ul>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Brain className="h-5 w-5" />
                            Step 2: AI Evaluation
                        </CardTitle>
                        <CardDescription>
                            Hydrogen-holographic fractal scoring
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                            Your contribution is evaluated across four dimensions:
                        </p>
                        <ul className="text-sm space-y-1 ml-4">
                            <li>• <strong>Novelty:</strong> Originality and innovation</li>
                            <li>• <strong>Density:</strong> Information richness</li>
                            <li>• <strong>Coherence:</strong> Logical consistency</li>
                            <li>• <strong>Alignment:</strong> Syntheverse objectives</li>
                        </ul>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Award className="h-5 w-5" />
                            Step 3: Metallic Qualification
                        </CardTitle>
                        <CardDescription>
                            Gold, Silver, or Copper ranking
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                            Based on evaluation scores, receive a metallic qualification:
                        </p>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                <span className="text-sm"><strong>Gold:</strong> Top 10% (1.5× multiplier)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                                <span className="text-sm"><strong>Silver:</strong> Top 30% (1.2× multiplier)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-orange-600 rounded-full"></div>
                                <span className="text-sm"><strong>Copper:</strong> Qualified (1.15× multiplier)</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Coins className="h-5 w-5" />
                            Step 4: Token Rewards
                        </CardTitle>
                        <CardDescription>
                            SYNTH tokens and blockchain registration
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                            Approved contributions earn SYNTH tokens based on:
                        </p>
                        <ul className="text-sm space-y-1 ml-4">
                            <li>• Base reward + metallic amplification</li>
                            <li>• Evaluation scores across dimensions</li>
                            <li>• Current epoch allocation</li>
                        </ul>
                        <p className="text-sm text-muted-foreground mt-2">
                            <strong>$200 registration fee</strong> for on-chain anchoring
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Call to Action */}
            <Card>
                <CardContent className="pt-6">
                    <div className="text-center space-y-4">
                        <h3 className="text-xl font-semibold">Ready to Contribute?</h3>
                        <p className="text-muted-foreground">
                            Join the Syntheverse ecosystem and help evolve AI through your intellectual contributions.
                        </p>
                        <div className="flex gap-4 justify-center">
                            <Link href="/dashboard">
                                <Button variant="outline">Back to Dashboard</Button>
                            </Link>
                            <Button disabled>
                                Submit Contribution (Demo)
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Full contribution system implementation would include file upload, AI evaluation pipeline,
                            and blockchain registration functionality.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

