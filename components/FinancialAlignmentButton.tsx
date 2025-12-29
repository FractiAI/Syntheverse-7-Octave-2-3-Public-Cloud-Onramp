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

    async function handleRegister(product: FinancialAlignmentProduct) {
        if (!product.price_id) {
            alert('Price not available for this product')
            return
        }

        // Show confirmation dialog with ERC-20 alignment language
        setSelectedProduct(product)
        setConfirmDialogOpen(true)
    }

    async function confirmRegister() {
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
                    amount: selectedProduct.amount
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
                const errorMessage = data.message || data.error || `Failed to initiate registration (${response.status})`
                throw new Error(errorMessage)
            }

            if (!data.checkout_url || typeof data.checkout_url !== 'string') {
                throw new Error('Invalid checkout URL received from server')
            }

            if (!data.checkout_url.startsWith('http://') && !data.checkout_url.startsWith('https://')) {
                throw new Error(`Invalid checkout URL format`)
            }

            window.location.href = data.checkout_url
        } catch (err) {
            console.error('Registration error:', err)
            const errorMessage = err instanceof Error ? err.message : 'Failed to register Financial Alignment PoC'
            alert(`Registration Error: ${errorMessage}`)
            setProcessing(null)
        }
    }

    function cancelRegister() {
        setConfirmDialogOpen(false)
        setSelectedProduct(null)
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
                    Financial Alignment Contribution
                    <ChevronDown className="inline h-4 w-4 ml-2" />
                </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-[var(--cockpit-obsidian)] border-[var(--keyline-primary)] min-w-[320px] p-0">
                    <div className="p-3 border-b border-[var(--keyline-primary)]">
                        <div className="cockpit-label text-xs mb-1">Select Contribution Level</div>
                        <div className="cockpit-text text-xs">Choose your level and register on blockchain</div>
                    </div>
                    {products.map((product) => (
                        <div key={product.id} className="border-b border-[var(--keyline-primary)] last:border-b-0">
                            <div className="p-3 hover:bg-[var(--cockpit-carbon)]">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex-1">
                                        <div className="font-medium cockpit-text">{product.name}</div>
                                        {product.description && (
                                            <div className="text-xs text-muted-foreground mt-1">{product.description}</div>
                                        )}
                                    </div>
                                    <div className="ml-4">
                                        {processing === product.id ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <span className="cockpit-number text-sm">{formatAmount(product.amount)}</span>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleRegister(product)}
                                    disabled={processing === product.id || !product.price_id}
                                    className="cockpit-lever w-full text-sm py-2 mt-2"
                                >
                                    {processing === product.id ? (
                                        <>
                                            <Loader2 className="inline h-4 w-4 mr-2 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <CreditCard className="inline h-4 w-4 mr-2" />
                                            Register on Blockchain Now
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>

            {/* ERC-20 Alignment Confirmation Dialog */}
            <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
                <DialogContent className="bg-[var(--cockpit-obsidian)] border-[var(--keyline-primary)] max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="cockpit-title text-xl flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-[var(--hydrogen-amber)]" />
                            ERC-20 Financial Alignment PoC Contribution
                        </DialogTitle>
                        <DialogDescription className="cockpit-text">
                            Important: Please read and acknowledge the following terms before proceeding
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4 mt-4">
                        {selectedProduct && (
                            <div className="p-4 border border-[var(--keyline-primary)] bg-[var(--cockpit-carbon)] rounded">
                                <div className="cockpit-label mb-2">Contribution Level</div>
                                <div className="cockpit-title text-lg">{selectedProduct.name}</div>
                                <div className="cockpit-number mt-1">{formatAmount(selectedProduct.amount)}</div>
                            </div>
                        )}

                        <div className="p-4 border border-[var(--hydrogen-amber)] bg-[rgba(255,215,0,0.05)] rounded">
                            <div className="cockpit-label mb-3 text-[var(--hydrogen-amber)]">
                                ERC-20 Token Alignment Purpose & Restrictions
                            </div>
                            <div className="cockpit-text space-y-3 text-sm">
                                <p>
                                    <strong>ALIGNMENT PURPOSE ONLY:</strong> This Financial Alignment PoC contribution 
                                    receives ERC-20 tokens (SYNTH) on the Hard Hat L1 blockchain for the sole purpose 
                                    of <strong>alignment with the Syntheverse ecosystem</strong> and participation in 
                                    the Motherlode Blockmine collective intelligence network.
                                </p>
                                <p>
                                    <strong>NOT FOR OWNERSHIP:</strong> These ERC-20 tokens do <strong>NOT</strong> represent 
                                    equity, ownership, shares, or any form of financial interest in any entity, organization, 
                                    or project. They are utility tokens for alignment and participation purposes only.
                                </p>
                                <p>
                                    <strong>NO EXTERNAL TRADING:</strong> These ERC-20 tokens are <strong>NON-TRANSFERABLE</strong> 
                                    and <strong>NON-TRADEABLE</strong> on external exchanges, marketplaces, or trading platforms. 
                                    They cannot be sold, transferred, or exchanged for other cryptocurrencies, fiat currency, 
                                    or any other assets outside the Syntheverse ecosystem.
                                </p>
                                <p>
                                    <strong>ECOSYSTEM UTILITY ONLY:</strong> These tokens function exclusively within the 
                                    Syntheverse ecosystem for participation, governance (if applicable), and alignment tracking 
                                    within the Motherlode Blockmine network. They have no external monetary value.
                                </p>
                                <p className="text-xs text-muted-foreground pt-2 border-t border-[var(--keyline-primary)]">
                                    By proceeding with this contribution, you acknowledge that you understand these tokens 
                                    are for alignment purposes only, do not represent ownership, and cannot be traded externally.
                                </p>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="flex gap-2 mt-6">
                        <button
                            onClick={cancelRegister}
                            className="cockpit-lever"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={confirmRegister}
                            className="cockpit-lever bg-[var(--hydrogen-amber)] text-black hover:bg-[var(--hydrogen-amber)]/90"
                        >
                            <CreditCard className="inline h-4 w-4 mr-2" />
                            Proceed to Payment
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}

