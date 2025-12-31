/**
 * Financial Alignment PoC Button Component
 * Expands to show contribution level options from Stripe products
 */

'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { CreditCard, ChevronDown, Loader2, AlertTriangle } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'

interface FinancialAlignmentProduct {
    id: string
    name: string
    description: string
    price_id: string | null
    amount: number
    currency: string
}

export function FinancialAlignmentButton() {
    const [products, setProducts] = useState<FinancialAlignmentProduct[]>([])
    const [loading, setLoading] = useState(true)
    const [processing, setProcessing] = useState<string | null>(null)
    const [isOpen, setIsOpen] = useState(false)
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState<FinancialAlignmentProduct | null>(null)

    useEffect(() => {
        async function fetchProducts() {
            try {
                const response = await fetch('/api/financial-alignment/products')
                if (response.ok) {
                    const data = await response.json()
                    setProducts(data.products || [])
                } else {
                    console.error('Failed to fetch Financial Alignment products')
                }
            } catch (err) {
                console.error('Error fetching products:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchProducts()
    }, [])

    async function handleSupport(product: FinancialAlignmentProduct) {
        if (!product.price_id) {
            alert('Price not available for this product')
            return
        }

        // Close dropdown menu first
        setIsOpen(false)
        
        // Show confirmation dialog with clear, non-promissory support language
        setSelectedProduct(product)
        setConfirmDialogOpen(true)
    }

    async function confirmSupport() {
        if (!selectedProduct || !selectedProduct.price_id) {
            return
        }

        setConfirmDialogOpen(false)
        setProcessing(selectedProduct.id)
        try {
            const response = await fetch('/api/financial-alignment/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    product_id: selectedProduct.id,
                    price_id: selectedProduct.price_id,
                })
            })

            let data: any
            try {
                const text = await response.text()
                if (!text) {
                    throw new Error(`Empty response from server (status: ${response.status})`)
                }
                data = JSON.parse(text)
            } catch (parseError) {
                throw new Error(`Invalid response from server (status: ${response.status})`)
            }

            if (!response.ok) {
                const errorMessage = data.message || data.error || `Failed to initiate checkout (${response.status})`
                throw new Error(errorMessage)
            }

            if (!data.checkout_url || typeof data.checkout_url !== 'string') {
                throw new Error('Invalid checkout URL received from server')
            }

            if (!data.checkout_url.startsWith('http://') && !data.checkout_url.startsWith('https://')) {
                throw new Error(`Invalid checkout URL format`)
            }

            // Redirect to Stripe checkout for payment
            console.log('Redirecting to Stripe checkout:', data.checkout_url)
            window.location.href = data.checkout_url
        } catch (err) {
            console.error('Support checkout error:', err)
            const errorMessage = err instanceof Error ? err.message : 'Failed to start ecosystem support checkout'
            alert(`Checkout Error: ${errorMessage}`)
            setProcessing(null)
            // Don't close dialog on error so user can try again
        }
    }

    function cancelSupport() {
        setConfirmDialogOpen(false)
        setSelectedProduct(null)
        setProcessing(null) // Reset processing state
    }

    const formatAmount = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount)
    }

    if (loading) {
        return (
            <button className="cockpit-lever" disabled>
                <Loader2 className="inline h-4 w-4 mr-2 animate-spin" />
                Loading...
            </button>
        )
    }

    if (products.length === 0) {
        return null // Don't show button if no products available
    }

    return (
        <>
            <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
                <DropdownMenuTrigger asChild>
                <button className="cockpit-lever">
                    <CreditCard className="inline h-4 w-4 mr-2" />
                    Ecosystem Support
                    <ChevronDown className="inline h-4 w-4 ml-2" />
                </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                    align="end" 
                    className="bg-[var(--cockpit-obsidian)] border-[var(--keyline-primary)] min-w-[320px] max-h-[600px] p-0 [&>div]:overflow-y-auto [&>div]:overflow-x-hidden"
                    sideOffset={8}
                    style={{ 
                        maxHeight: '85vh',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column'
                    }}
                >
                    <div className="p-3 border-b border-[var(--keyline-primary)] bg-[var(--cockpit-obsidian)] flex-shrink-0">
                        <div className="cockpit-label text-xs mb-1">Select Support Level</div>
                        <div className="cockpit-text text-xs">
                            Voluntary support for infrastructure, research, and ecosystem operations
                        </div>
                    </div>
                    <div 
                        className="overflow-y-auto overflow-x-hidden flex-1 min-h-0"
                        style={{ 
                            maxHeight: 'calc(85vh - 120px)',
                            WebkitOverflowScrolling: 'touch',
                            scrollbarWidth: 'thin',
                            scrollbarColor: 'var(--hydrogen-amber) var(--cockpit-carbon)'
                        }}
                    >
                        {products.map((product) => {
                            const description = product.name || 'Support Level'
                            
                            return (
                                <div key={product.id} className="border-b border-[var(--keyline-primary)] last:border-b-0">
                                    <div className="p-3 hover:bg-[var(--cockpit-carbon)]">
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium cockpit-text text-sm">{description}</div>
                                            </div>
                                            <div className="flex-shrink-0">
                                                {processing === product.id ? (
                                                    <Loader2 className="h-4 w-4 animate-spin text-[var(--hydrogen-amber)]" />
                                                ) : (
                                                    <span className="cockpit-number text-sm whitespace-nowrap">{formatAmount(product.amount)}</span>
                                                )}
                                            </div>
                                            <div className="flex-shrink-0">
                                                <button
                                                    onClick={() => handleSupport(product)}
                                                    disabled={processing === product.id || !product.price_id}
                                                    className="cockpit-lever text-xs py-1.5 px-3 whitespace-nowrap"
                                                >
                                                    {processing === product.id ? (
                                                        <>
                                                            <Loader2 className="inline h-3 w-3 mr-1 animate-spin" />
                                                            Processing
                                                        </>
                                                    ) : (
                                                        <>
                                                            <CreditCard className="inline h-3 w-3 mr-1" />
                                                            Support
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* ERC-20 Alignment Confirmation Dialog */}
            <Dialog 
                open={confirmDialogOpen} 
                onOpenChange={(open) => {
                    setConfirmDialogOpen(open)
                    if (!open) {
                        // Reset state when dialog closes
                        setSelectedProduct(null)
                        setProcessing(null)
                    }
                }}
            >
                <DialogContent className="bg-[var(--cockpit-obsidian)] border-[var(--keyline-primary)] max-w-2xl max-h-[90vh] flex flex-col p-0">
                    <div className="p-6 pb-4">
                        <DialogHeader>
                            <DialogTitle className="cockpit-title text-xl flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-[var(--hydrogen-amber)]" />
                                Ecosystem Support (Voluntary)
                            </DialogTitle>
                            <DialogDescription className="cockpit-text">
                                Important: please read these terms before proceeding
                            </DialogDescription>
                        </DialogHeader>
                    </div>
                    
                    {/* Scrollable content area */}
                    <div className="flex-1 overflow-y-auto px-6 pb-4 space-y-4">
                        {selectedProduct && (
                            <div className="p-4 border border-[var(--keyline-primary)] bg-[var(--cockpit-carbon)] rounded">
                                <div className="cockpit-label mb-2">Contribution Level</div>
                                <div className="cockpit-title text-lg">{selectedProduct.name}</div>
                                <div className="cockpit-number mt-1">{formatAmount(selectedProduct.amount)}</div>
                            </div>
                        )}

                        <div className="p-4 border border-[var(--hydrogen-amber)] bg-[rgba(255,215,0,0.05)] rounded">
                            <div className="cockpit-label mb-3 text-[var(--hydrogen-amber)]">Clear Terms</div>
                            <div className="cockpit-text space-y-3 text-sm">
                                <p>
                                    <strong>VOLUNTARY SUPPORT:</strong> This payment is a voluntary contribution to help
                                    fund infrastructure, research, and ecosystem operations.
                                </p>
                                <p>
                                    <strong>NOT A PURCHASE / NOT A TOKEN SALE:</strong> This is <strong>not</strong> a purchase,
                                    investment, or exchange of money for ERC‑20 tokens. There is no expectation of profit or return.
                                </p>
                                <p>
                                    <strong>EXPERIMENTAL SANDBOX:</strong> Syntheverse is an experimental, non-custodial sandbox.
                                    Participation does not confer ownership, equity, profit rights, or guaranteed access.
                                </p>
                                <p>
                                    <strong>SYNTH ROLE (INTERNAL ONLY):</strong> SYNTH is a fixed-supply internal coordination marker.
                                    Any recognition (if enabled) is optional, post hoc, and discretionary—separate from payment.
                                </p>
                                <p className="text-xs text-muted-foreground pt-2 border-t border-[var(--keyline-primary)]">
                                    By proceeding, you acknowledge the above terms.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Sticky footer with action buttons */}
                    <DialogFooter className="flex flex-row gap-3 px-6 py-4 border-t border-[var(--keyline-primary)] bg-[var(--cockpit-carbon)]">
                        <button
                            onClick={cancelSupport}
                            className="cockpit-lever flex-1 sm:flex-initial"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={confirmSupport}
                            disabled={processing === selectedProduct?.id}
                            className="cockpit-lever bg-[var(--hydrogen-amber)] text-black hover:bg-[var(--hydrogen-amber)]/90 flex-1 sm:flex-initial font-semibold"
                        >
                            {processing === selectedProduct?.id ? (
                                <>
                                    <Loader2 className="inline h-4 w-4 mr-2 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <CreditCard className="inline h-4 w-4 mr-2" />
                                    Proceed to Payment
                                </>
                            )}
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}

