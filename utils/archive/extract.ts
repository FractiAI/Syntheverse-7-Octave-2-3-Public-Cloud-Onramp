/**
 * Extract Abstract, Formulas, and Constants from PoC Submissions
 * 
 * These extracted elements are permanently stored in the archive
 * and used for finding top 3 matches when evaluating new submissions
 */

import { debug, debugError } from '@/utils/debug'

export interface ExtractedArchiveData {
    abstract: string
    formulas: string[]
    constants: string[]
}

/**
 * Extract abstract from submission text
 * Looks for "Abstract:" section or first paragraph
 */
export function extractAbstract(textContent: string, title: string): string {
    if (!textContent) {
        return title // Fallback to title if no content
    }

    const content = textContent.trim()
    
    // Look for explicit "Abstract:" section (use [\s\S] instead of . with s flag for ES2015 compatibility)
    const abstractMatch = content.match(/abstract[:\s]+([\s\S]*?)(?:\n\n|\n1\.|introduction|background|$)/i)
    if (abstractMatch && abstractMatch[1]) {
        const abstract = abstractMatch[1].trim()
        // Limit to 1000 characters
        return abstract.length > 1000 ? abstract.substring(0, 1000) + '...' : abstract
    }
    
    // Look for "Summary:" section (use [\s\S] instead of . with s flag for ES2015 compatibility)
    const summaryMatch = content.match(/summary[:\s]+([\s\S]*?)(?:\n\n|\n1\.|introduction|background|$)/i)
    if (summaryMatch && summaryMatch[1]) {
        const summary = summaryMatch[1].trim()
        return summary.length > 1000 ? summary.substring(0, 1000) + '...' : summary
    }
    
    // Extract first paragraph (up to 500 chars or first double newline)
    const firstParagraph = content.split(/\n\n/)[0]?.trim() || content.split('\n')[0]?.trim() || ''
    if (firstParagraph && firstParagraph.length > 50) {
        return firstParagraph.length > 1000 ? firstParagraph.substring(0, 1000) + '...' : firstParagraph
    }
    
    // Fallback: use title
    return title
}

/**
 * Extract formulas from submission text
 * Looks for mathematical expressions, equations, and formulas
 */
export function extractFormulas(textContent: string): string[] {
    if (!textContent) {
        return []
    }

    const formulas: string[] = []
    const content = textContent
    
    // Pattern 1: Equations with = sign (e.g., "E = mc²", "Λ^HH = R^H / L_P ≈ 1.12 × 10^22")
    const equationPattern = /([A-Za-zα-ωΑ-Ω_][A-Za-zα-ωΑ-Ω0-9_^\/×·\s\-\+\*\(\)≈=<>≤≥±∞∑∏∫√]+=+[A-Za-zα-ωΑ-Ω0-9_^\/×·\s\-\+\*\(\)≈<>≤≥±∞∑∏∫√\.]+)/g
    const equations = content.match(equationPattern)
    if (equations) {
        equations.forEach(eq => {
            const cleaned = eq.trim()
            if (cleaned.length > 3 && cleaned.length < 200 && !formulas.includes(cleaned)) {
                formulas.push(cleaned)
            }
        })
    }
    
    // Pattern 2: LaTeX-style formulas (e.g., $E=mc^2$, \frac{a}{b})
    const latexPattern = /\$([^$]+)\$|\\[a-zA-Z]+\{[^}]+\}/g
    const latexFormulas = content.match(latexPattern)
    if (latexFormulas) {
        latexFormulas.forEach(formula => {
            const cleaned = formula.trim()
            if (cleaned.length > 2 && cleaned.length < 200 && !formulas.includes(cleaned)) {
                formulas.push(cleaned)
            }
        })
    }
    
    // Pattern 3: Mathematical expressions with superscripts/subscripts (e.g., "Λ^HH", "R^H")
    const superscriptPattern = /[A-Za-z][A-Za-z0-9]*\^[A-Za-z0-9\+\-]+/g
    const superscripts = content.match(superscriptPattern)
    if (superscripts) {
        superscripts.forEach(sup => {
            const cleaned = sup.trim()
            if (cleaned.length > 2 && cleaned.length < 100 && !formulas.includes(cleaned)) {
                formulas.push(cleaned)
            }
        })
    }
    
    // Pattern 4: Constants with values (e.g., "c = 299,792,458 m/s", "Λ^HH ≈ 1.12 × 10^22")
    const constantPattern = /([A-Za-zα-ωΑ-Ω_][A-Za-zα-ωΑ-Ω0-9_^\/×·\s]+≈?\s*[\d\.\s×\^10\+\-]+)/g
    const constants = content.match(constantPattern)
    if (constants) {
        constants.forEach(constant => {
            const cleaned = constant.trim()
            if (cleaned.length > 3 && cleaned.length < 200 && !formulas.includes(cleaned)) {
                formulas.push(cleaned)
            }
        })
    }
    
    // Remove duplicates and limit to top 20 formulas (use Array.from for ES2015 compatibility)
    return Array.from(new Set(formulas)).slice(0, 20)
}

/**
 * Extract constants from submission text
 * Looks for named constants with values (e.g., "Λ^HH ≈ 1.12 × 10^22", "c = 299,792,458")
 */
export function extractConstants(textContent: string): string[] {
    if (!textContent) {
        return []
    }

    const constants: string[] = []
    const content = textContent
    
    // Pattern 1: Named constants with values (e.g., "Λ^HH ≈ 1.12 × 10^22", "c = 299,792,458 m/s")
    const namedConstantPattern = /([A-Za-zα-ωΑ-Ω_][A-Za-zα-ωΑ-Ω0-9_^\/×·\s]+[≈=]\s*[\d\.\s×\^10\+\-]+[A-Za-z\/\s]*)/g
    const namedConstants = content.match(namedConstantPattern)
    if (namedConstants) {
        namedConstants.forEach(constant => {
            const cleaned = constant.trim()
            if (cleaned.length > 3 && cleaned.length < 200 && !constants.includes(cleaned)) {
                constants.push(cleaned)
            }
        })
    }
    
    // Pattern 2: Constants in "Constant:" or "Scaling constant:" sections
    const constantSectionPattern = /(?:constant|scaling\s+constant|physical\s+constant)[:\s]+([^\n]+)/gi
    const sectionConstants = content.match(constantSectionPattern)
    if (sectionConstants) {
        sectionConstants.forEach(constant => {
            const cleaned = constant.replace(/^(?:constant|scaling\s+constant|physical\s+constant)[:\s]+/i, '').trim()
            if (cleaned.length > 3 && cleaned.length < 200 && !constants.includes(cleaned)) {
                constants.push(cleaned)
            }
        })
    }
    
    // Pattern 3: Greek letters with values (e.g., "α = 0.007", "π ≈ 3.14159")
    const greekConstantPattern = /[α-ωΑ-Ωπλμ][\s^]*[≈=]\s*[\d\.\s×\^10\+\-]+/g
    const greekConstants = content.match(greekConstantPattern)
    if (greekConstants) {
        greekConstants.forEach(constant => {
            const cleaned = constant.trim()
            if (cleaned.length > 2 && cleaned.length < 100 && !constants.includes(cleaned)) {
                constants.push(cleaned)
            }
        })
    }
    
    // Remove duplicates and limit to top 20 constants (use Array.from for ES2015 compatibility)
    return Array.from(new Set(constants)).slice(0, 20)
}

/**
 * Extract all archive data (abstract, formulas, constants) from submission
 */
export function extractArchiveData(textContent: string, title: string): ExtractedArchiveData {
    debug('ExtractArchiveData', 'Extracting archive data', { 
        title,
        contentLength: textContent?.length || 0 
    })
    
    try {
        const abstract = extractAbstract(textContent || '', title)
        const formulas = extractFormulas(textContent || '')
        const constants = extractConstants(textContent || '')
        
        debug('ExtractArchiveData', 'Extraction complete', {
            abstractLength: abstract.length,
            formulasCount: formulas.length,
            constantsCount: constants.length
        })
        
        return {
            abstract,
            formulas,
            constants
        }
    } catch (error) {
        debugError('ExtractArchiveData', 'Error extracting archive data', error)
        // Return fallback data
        return {
            abstract: title,
            formulas: [],
            constants: []
        }
    }
}

