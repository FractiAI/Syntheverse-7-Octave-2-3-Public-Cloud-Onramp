"use client"

import { useState, useTransition } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { updateUsername } from '@/app/account/actions'
import { Check, X, Loader2 } from "lucide-react"

interface UpdateUsernameFormProps {
    currentName: string
}

export function UpdateUsernameForm({ currentName }: UpdateUsernameFormProps) {
    const [name, setName] = useState(currentName)
    const [isPending, startTransition] = useTransition()
    const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' })

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setStatus({ type: null, message: '' })

        startTransition(async () => {
            const formData = new FormData()
            formData.append('name', name)
            const result = await updateUsername(formData)

            if (result.success) {
                setStatus({ type: 'success', message: 'Username updated successfully' })
                setTimeout(() => setStatus({ type: null, message: '' }), 3000)
            } else {
                setStatus({ type: 'error', message: result.error || 'Failed to update username' })
            }
        })
    }

    const hasChanges = name !== currentName

    return (
        <form onSubmit={handleSubmit} className="space-y-2">
            <div className="flex gap-2">
                <Input
                    id="username"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isPending}
                    maxLength={100}
                    className="flex-1"
                    placeholder="Enter your username"
                />
                {hasChanges && (
                    <>
                        <Button
                            type="submit"
                            size="sm"
                            disabled={isPending || !name.trim()}
                            className="shrink-0"
                        >
                            {isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Check className="h-4 w-4" />
                            )}
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={isPending}
                            onClick={() => {
                                setName(currentName)
                                setStatus({ type: null, message: '' })
                            }}
                            className="shrink-0"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </>
                )}
            </div>
            {status.type && (
                <p className={`text-xs ${status.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                    {status.message}
                </p>
            )}
            <p className="text-xs text-muted-foreground">
                This is your display name used across Syntheverse
            </p>
        </form>
    )
}

