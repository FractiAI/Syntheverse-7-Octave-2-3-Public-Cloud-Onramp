'use client'

import { useEffect, useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, RefreshCw, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react'

interface Vector3D {
    x: number
    y: number
    z: number
}

interface Node {
    id: string
    submission_hash: string
    title: string
    contributor: string
    status: string
    category?: string | null
    metals: string[]
    vector: Vector3D | null
    scores?: {
        pod_score?: number
        novelty?: number
        density?: number
        coherence?: number
        alignment?: number
    }
}

interface Edge {
    source: string
    target: string
    similarity_score: number
    distance: number
    overlap_type: string
}

interface SandboxMapData {
    nodes: Node[]
    edges: Edge[]
    metadata: {
        total_nodes: number
        total_edges: number
        vectorized_nodes: number
        coordinate_system: string
        hhf_constant: string
    }
}

export function SandboxMap3D() {
    const [data, setData] = useState<SandboxMapData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [selectedNode, setSelectedNode] = useState<Node | null>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [camera, setCamera] = useState({ x: 0, y: 0, z: 0, rotationX: 0, rotationY: 0, zoom: 1 })
    const [isDragging, setIsDragging] = useState(false)
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

    useEffect(() => {
        fetchMapData()
    }, [])

    useEffect(() => {
        if (data && canvasRef.current) {
            render3D()
        }
    }, [data, camera, selectedNode])

    async function fetchMapData() {
        setLoading(true)
        setError(null)
        try {
            const response = await fetch('/api/sandbox-map')
            if (!response.ok) {
                throw new Error(`Failed to fetch: ${response.statusText}`)
            }
            const mapData: SandboxMapData = await response.json()
            setData(mapData)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load sandbox map')
        } finally {
            setLoading(false)
        }
    }

    function render3D() {
        const canvas = canvasRef.current
        if (!canvas || !data) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // Clear canvas (canvas is guaranteed to be non-null here)
        const canvasWidth = canvas.width
        const canvasHeight = canvas.height
        ctx.clearRect(0, 0, canvasWidth, canvasHeight)

        // Get vectorized nodes
        const vectorizedNodes = data.nodes.filter(n => n.vector !== null) as Array<Node & { vector: Vector3D }>
        
        if (vectorizedNodes.length === 0) {
            ctx.fillStyle = '#666'
            ctx.font = '16px sans-serif'
            ctx.textAlign = 'center'
            ctx.fillText('No vectorized submissions yet', canvasWidth / 2, canvasHeight / 2)
            return
        }

        // Calculate bounds
        const bounds = {
            minX: Math.min(...vectorizedNodes.map(n => n.vector.x)),
            maxX: Math.max(...vectorizedNodes.map(n => n.vector.x)),
            minY: Math.min(...vectorizedNodes.map(n => n.vector.y)),
            maxY: Math.max(...vectorizedNodes.map(n => n.vector.y)),
            minZ: Math.min(...vectorizedNodes.map(n => n.vector.z)),
            maxZ: Math.max(...vectorizedNodes.map(n => n.vector.z)),
        }

        const centerX = (bounds.minX + bounds.maxX) / 2
        const centerY = (bounds.minY + bounds.maxY) / 2
        const centerZ = (bounds.minZ + bounds.maxZ) / 2

        const scale = Math.min(canvasWidth, canvasHeight) / Math.max(
            bounds.maxX - bounds.minX,
            bounds.maxY - bounds.minY,
            bounds.maxZ - bounds.minZ
        ) * 0.3 * camera.zoom

        // Project 3D to 2D (isometric projection)
        function project3D(x: number, y: number, z: number) {
            const dx = x - centerX
            const dy = y - centerY
            const dz = z - centerZ

            // Rotate around Y axis
            const cosY = Math.cos(camera.rotationY)
            const sinY = Math.sin(camera.rotationY)
            const x1 = dx * cosY - dz * sinY
            const z1 = dx * sinY + dz * cosY

            // Rotate around X axis
            const cosX = Math.cos(camera.rotationX)
            const sinX = Math.sin(camera.rotationX)
            const y1 = dy * cosX - z1 * sinX
            const z2 = dy * sinX + z1 * cosX

            // Project to 2D (isometric)
            const screenX = canvasWidth / 2 + (x1 - y1) * scale
            const screenY = canvasHeight / 2 + (x1 + y1) * 0.5 * scale - z2 * scale * 0.5

            return { x: screenX, y: screenY, depth: z2 }
        }

        // Draw edges first (so they appear behind nodes)
        ctx.strokeStyle = 'rgba(100, 100, 100, 0.3)'
        ctx.lineWidth = 1
        data.edges.forEach(edge => {
            const sourceNode = vectorizedNodes.find(n => n.submission_hash === edge.source)
            const targetNode = vectorizedNodes.find(n => n.submission_hash === edge.target)
            
            if (sourceNode && targetNode) {
                const p1 = project3D(sourceNode.vector.x, sourceNode.vector.y, sourceNode.vector.z)
                const p2 = project3D(targetNode.vector.x, targetNode.vector.y, targetNode.vector.z)
                
                ctx.beginPath()
                ctx.moveTo(p1.x, p1.y)
                ctx.lineTo(p2.x, p2.y)
                ctx.stroke()
            }
        })

        // Draw nodes
        const sortedNodes = [...vectorizedNodes].sort((a, b) => {
            const aProj = project3D(a.vector.x, a.vector.y, a.vector.z)
            const bProj = project3D(b.vector.x, b.vector.y, b.vector.z)
            return bProj.depth - aProj.depth // Draw further nodes first
        })

        sortedNodes.forEach(node => {
            const proj = project3D(node.vector.x, node.vector.y, node.vector.z)
            
            // Color by metal type
            let color = '#94a3b8' // Default (copper)
            if (node.metals.includes('gold')) {
                color = '#fbbf24' // Gold
            } else if (node.metals.includes('silver')) {
                color = '#e5e7eb' // Silver
            }

            // Size by pod_score
            const podScore = node.scores?.pod_score || 0
            const radius = Math.max(3, Math.min(12, podScore / 1000))

            // Highlight selected node
            if (selectedNode && selectedNode.submission_hash === node.submission_hash) {
                ctx.fillStyle = '#3b82f6'
                ctx.beginPath()
                ctx.arc(proj.x, proj.y, radius + 3, 0, Math.PI * 2)
                ctx.fill()
            }

            // Draw node
            ctx.fillStyle = color
            ctx.beginPath()
            ctx.arc(proj.x, proj.y, radius, 0, Math.PI * 2)
            ctx.fill()

            // Draw border
            ctx.strokeStyle = '#1e293b'
            ctx.lineWidth = 1
            ctx.stroke()

            // Draw label for selected node or high-scoring nodes
            if ((selectedNode && selectedNode.submission_hash === node.submission_hash) || podScore >= 8000) {
                ctx.fillStyle = '#1e293b'
                ctx.font = '10px sans-serif'
                ctx.textAlign = 'center'
                ctx.fillText(node.title.substring(0, 30), proj.x, proj.y - radius - 5)
            }
        })

        // Draw axes
        const axisLength = 50
        ctx.strokeStyle = '#ef4444'
        ctx.lineWidth = 2
        const origin = project3D(centerX, centerY, centerZ)
        const xAxis = project3D(centerX + axisLength, centerY, centerZ)
        ctx.beginPath()
        ctx.moveTo(origin.x, origin.y)
        ctx.lineTo(xAxis.x, xAxis.y)
        ctx.stroke()
        ctx.fillStyle = '#ef4444'
        ctx.font = '10px sans-serif'
        ctx.fillText('X (Novelty)', xAxis.x + 5, xAxis.y)

        ctx.strokeStyle = '#10b981'
        const yAxis = project3D(centerX, centerY + axisLength, centerZ)
        ctx.beginPath()
        ctx.moveTo(origin.x, origin.y)
        ctx.lineTo(yAxis.x, yAxis.y)
        ctx.stroke()
        ctx.fillStyle = '#10b981'
        ctx.fillText('Y (Density)', yAxis.x + 5, yAxis.y)

        ctx.strokeStyle = '#3b82f6'
        const zAxis = project3D(centerX, centerY, centerZ + axisLength)
        ctx.beginPath()
        ctx.moveTo(origin.x, origin.y)
        ctx.lineTo(zAxis.x, zAxis.y)
        ctx.stroke()
        ctx.fillStyle = '#3b82f6'
        ctx.fillText('Z (Coherence)', zAxis.x + 5, zAxis.y)
    }

    function handleMouseDown(e: React.MouseEvent<HTMLCanvasElement>) {
        setIsDragging(true)
        setDragStart({ x: e.clientX, y: e.clientY })
    }

    function handleMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
        if (!isDragging) return

        const dx = e.clientX - dragStart.x
        const dy = e.clientY - dragStart.y

        setCamera(prev => ({
            ...prev,
            rotationY: prev.rotationY + dx * 0.01,
            rotationX: prev.rotationX + dy * 0.01,
        }))

        setDragStart({ x: e.clientX, y: e.clientY })
    }

    function handleMouseUp() {
        setIsDragging(false)
    }

    function handleClick(e: React.MouseEvent<HTMLCanvasElement>) {
        if (!data || !canvasRef.current) return

        const rect = canvasRef.current.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        // Find closest node (simplified - would need proper 3D to 2D projection)
        const vectorizedNodes = data.nodes.filter(n => n.vector !== null) as Array<Node & { vector: Vector3D }>
        // For now, just select first node - proper implementation would calculate distance in 2D space
        if (vectorizedNodes.length > 0) {
            setSelectedNode(vectorizedNodes[0])
        }
    }

    if (loading) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center h-96">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </CardContent>
            </Card>
        )
    }

    if (error) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Sandbox Map</CardTitle>
                    <CardDescription>3D Visualization of PoC Submissions</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-destructive">{error}</div>
                    <Button onClick={fetchMapData} className="mt-4">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Retry
                    </Button>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>🌌 Holographic Hydrogen Fractal Sandbox</CardTitle>
                        <CardDescription>
                            3D Vector Map of PoC Submissions
                            {data && (
                                <span className="ml-2">
                                    ({data.metadata.vectorized_nodes} vectorized / {data.metadata.total_nodes} total)
                                </span>
                            )}
                        </CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setCamera(prev => ({ ...prev, zoom: prev.zoom * 1.2 }))}>
                            <ZoomIn className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setCamera(prev => ({ ...prev, zoom: prev.zoom / 1.2 }))}>
                            <ZoomOut className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setCamera({ x: 0, y: 0, z: 0, rotationX: 0, rotationY: 0, zoom: 1 })}>
                            <RotateCcw className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={fetchMapData}>
                            <RefreshCw className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="border rounded-lg bg-slate-50 relative">
                        <canvas
                            ref={canvasRef}
                            width={800}
                            height={600}
                            className="w-full h-auto cursor-move"
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}
                            onClick={handleClick}
                        />
                        <div className="absolute top-2 left-2 bg-white/90 px-2 py-1 rounded text-xs">
                            <div>Drag to rotate • Click to select • Scroll to zoom</div>
                        </div>
                    </div>

                    {selectedNode && (
                        <div className="border rounded-lg p-4 bg-slate-50">
                            <h3 className="font-semibold mb-2">{selectedNode.title}</h3>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                    <span className="text-muted-foreground">Contributor:</span> {selectedNode.contributor}
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Status:</span> {selectedNode.status}
                                </div>
                                {selectedNode.vector && (
                                    <>
                                        <div>
                                            <span className="text-muted-foreground">X (Novelty):</span> {selectedNode.vector.x.toFixed(2)}
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">Y (Density):</span> {selectedNode.vector.y.toFixed(2)}
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">Z (Coherence):</span> {selectedNode.vector.z.toFixed(2)}
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">Pod Score:</span> {selectedNode.scores?.pod_score || 'N/A'}
                                        </div>
                                    </>
                                )}
                            </div>
                            <div className="mt-2 flex gap-1">
                                {selectedNode.metals.map(metal => (
                                    <Badge key={metal} variant="outline">{metal}</Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="text-xs text-muted-foreground">
                        <div>Coordinate System: {data?.metadata.coordinate_system}</div>
                        <div>HHF Constant: {data?.metadata.hhf_constant}</div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

