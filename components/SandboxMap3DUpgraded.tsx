/**
 * Upgraded 3D Sandbox Map Component
 * 
 * Full Three.js implementation with nested fractal layers, visual encoding,
 * and interactive features (click to view details, allocate tokens, register PoC)
 */

'use client'

import { Suspense, useState, useEffect, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Grid } from '@react-three/drei'
import * as THREE from 'three'
import { PoCNode } from './3d/PoCNode'
import { PoCDetailPanel } from './3d/PoCDetailPanel'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
        redundancy?: number
    }
    registered?: boolean
    allocated?: boolean
}

interface SandboxMapData {
    nodes: Node[]
    edges: Array<{
        source: string
        target: string
        similarity_score: number
        distance: number
        overlap_type: string
    }>
    metadata: {
        total_nodes: number
        total_edges: number
        vectorized_nodes: number
        coordinate_system: string
        hhf_constant: string
    }
}

export function SandboxMap3DUpgraded() {
    const [data, setData] = useState<SandboxMapData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [selectedNode, setSelectedNode] = useState<string | null>(null)
    
    useEffect(() => {
        fetchMapData()
    }, [])
    
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
    
    // Calculate camera bounds based on nodes
    const bounds = useMemo(() => {
        if (!data || data.nodes.length === 0) {
            return { min: [-50, -50, -50], max: [50, 50, 50], center: [0, 0, 0], range: 100 }
        }
        
        const vectorizedNodes = data.nodes.filter(n => n.vector !== null)
        if (vectorizedNodes.length === 0) {
            return { min: [-50, -50, -50], max: [50, 50, 50], center: [0, 0, 0], range: 100 }
        }
        
        const xs = vectorizedNodes.map(n => (n.vector as Vector3D).x)
        const ys = vectorizedNodes.map(n => (n.vector as Vector3D).y)
        const zs = vectorizedNodes.map(n => (n.vector as Vector3D).z)
        
        const minX = Math.min(...xs)
        const maxX = Math.max(...xs)
        const minY = Math.min(...ys)
        const maxY = Math.max(...ys)
        const minZ = Math.min(...zs)
        const maxZ = Math.max(...zs)
        
        const centerX = (minX + maxX) / 2
        const centerY = (minY + maxY) / 2
        const centerZ = (minZ + maxZ) / 2
        
        const range = Math.max(maxX - minX, maxY - minY, maxZ - minZ)
        const padding = range * 0.3
        
        return {
            min: [minX - padding, minY - padding, minZ - padding],
            max: [maxX + padding, maxY + padding, maxZ + padding],
            center: [centerX, centerY, centerZ],
            range
        }
    }, [data])
    
    // Create axes helper once (must be before early returns)
    const axesHelper = useMemo(() => new THREE.AxesHelper(50), [])
    
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
    
    if (!data || data.nodes.length === 0) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <p className="text-muted-foreground">No PoC submissions yet</p>
                        <p className="text-sm text-muted-foreground mt-2">
                            Submit your first contribution to see it on the map
                        </p>
                    </div>
                </CardContent>
            </Card>
        )
    }
    
    const vectorizedNodes = data.nodes.filter(n => n.vector !== null)
    
    return (
        <div className="relative w-full h-[800px]">
            <Canvas>
                <Suspense fallback={null}>
                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 10, 10]} intensity={1} />
                    <pointLight position={[-10, -10, -10]} intensity={0.5} />
                    
                    {/* Grid helper */}
                    <Grid args={[100, 100]} cellColor="#6b7280" sectionColor="#9ca3af" />
                    
                    {/* Axes helper */}
                    <primitive object={axesHelper} />
                    
                    {/* Render PoC nodes */}
                    {vectorizedNodes.map((node) => {
                        const vector = node.vector as Vector3D
                        return (
                            <PoCNode
                                key={node.submission_hash}
                                position={[vector.x, vector.y, vector.z]}
                                submissionHash={node.submission_hash}
                                title={node.title}
                                density={node.scores?.density || 0}
                                novelty={node.scores?.novelty || 0}
                                coherence={node.scores?.coherence || 0}
                                metals={node.metals}
                                qualified={(node.scores?.pod_score || 0) >= 8000}
                                allocated={node.allocated || false}
                                registered={node.registered || false}
                                onClick={setSelectedNode}
                                selected={selectedNode === node.submission_hash}
                            />
                        )
                    })}
                    
                    <OrbitControls
                        enableDamping
                        dampingFactor={0.05}
                        minDistance={(bounds.range || 100) * 0.3}
                        maxDistance={(bounds.range || 100) * 5}
                        target={[bounds.center[0], bounds.center[1], bounds.center[2]]}
                    />
                </Suspense>
            </Canvas>
            
            {/* Controls */}
            <div className="absolute top-4 left-4 flex gap-2">
                <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={fetchMapData}
                    title="Refresh map data"
                >
                    <RefreshCw className="h-4 w-4" />
                </Button>
            </div>
            
            {/* Info overlay */}
            <div className="absolute bottom-4 left-4 bg-black/70 text-white text-xs p-3 rounded">
                <div>Nodes: {data.nodes.length} ({data.metadata.vectorized_nodes} vectorized)</div>
                <div>Edges: {data.edges.length}</div>
                <div className="mt-2 text-[10px] opacity-75">
                    Coordinate System: {data.metadata.coordinate_system}
                </div>
            </div>
            
            {/* Detail Panel */}
            {selectedNode && (
                <PoCDetailPanel
                    submissionHash={selectedNode}
                    onClose={() => setSelectedNode(null)}
                />
            )}
        </div>
    )
}

