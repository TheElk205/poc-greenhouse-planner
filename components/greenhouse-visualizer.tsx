"use client"

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface GreenhouseVisualizerProps {
  initialRow1?: string
  initialRow2?: string
}

export default function GreenhouseVisualizer({ 
  initialRow1 = "[1-8]", 
  initialRow2 = "[9-17]" 
}: GreenhouseVisualizerProps) {
  const [row1Input, setRow1Input] = useState(initialRow1)
  const [row2Input, setRow2Input] = useState(initialRow2)
  const [row1Numbers, setRow1Numbers] = useState<number[]>([1, 2, 3, 4, 5, 6, 7, 8])
  const [row2Numbers, setRow2Numbers] = useState<number[]>([9, 10, 11, 12, 13, 14, 15, 16, 17])
  const [platformX, setPlatformX] = useState(50) // percentage position
  const [isDragging, setIsDragging] = useState(false)
  const [targetColumn, setTargetColumn] = useState<string>("")
  const pathRef = useRef<HTMLDivElement>(null)

  const parseRanges = (rangeStr: string): number[] => {
    const numbers: number[] = []
    const ranges = rangeStr.match(/\[(\d+)-(\d+)\]/g)
    
    if (ranges) {
      ranges.forEach(range => {
        const match = range.match(/\[(\d+)-(\d+)\]/)
        if (match) {
          const start = parseInt(match[1])
          const end = parseInt(match[2])
          for (let i = start; i <= end; i++) {
            numbers.push(i)
          }
        }
      })
    }
    
    return numbers
  }

  const handleRow1Update = () => {
    const newNumbers = parseRanges(row1Input)
    if (newNumbers.length > 0) {
      setRow1Numbers(newNumbers)
    }
  }

  const handleRow2Update = () => {
    const newNumbers = parseRanges(row2Input)
    if (newNumbers.length > 0) {
      setRow2Numbers(newNumbers)
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
    updatePlatformPosition(e)
  }

  const updatePlatformPosition = (e: React.MouseEvent | MouseEvent) => {
    if (!pathRef.current) return
    
    const rect = pathRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100))
    setPlatformX(percentage)
  }

  useEffect(() => {
    if (!isDragging) return

    const handleGlobalMouseMove = (e: MouseEvent) => {
      e.preventDefault()
      updatePlatformPosition(e)
    }
    
    const handleGlobalMouseUp = () => {
      setIsDragging(false)
    }
    
    document.addEventListener('mousemove', handleGlobalMouseMove)
    document.addEventListener('mouseup', handleGlobalMouseUp)
    
    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove)
      document.removeEventListener('mouseup', handleGlobalMouseUp)
    }
  }, [isDragging])

  const calculatePath = () => {
    const targetCol = parseInt(targetColumn)
    if (isNaN(targetCol)) return null

    // Check if target column exists in either row
    const inRow1 = row1Numbers.includes(targetCol)
    const inRow2 = row2Numbers.includes(targetCol)
    
    if (!inRow1 && !inRow2) {
      return { error: "Column not found in either row", row: undefined, direction: undefined, columnsToSkip: undefined, targetColumnNumber: undefined }
    }

    const results = []

    if (inRow1) {
      // Calculate platform position as index within Row 1
      const platformIndex = (platformX / 100) * (row1Numbers.length - 1)
      const targetIndex = row1Numbers.indexOf(targetCol)
      const plantsToSkip = Math.abs(targetIndex - platformIndex)
      
      results.push({
        row: 1,
        direction: targetIndex > platformIndex ? "right" : "left",
        columnsToSkip: Math.round(plantsToSkip),
        targetColumnNumber: targetCol,
        error: undefined
      })
    }

    if (inRow2) {
      // Calculate platform position as index within Row 2
      const platformIndex = (platformX / 100) * (row2Numbers.length - 1)
      const targetIndex = row2Numbers.indexOf(targetCol)
      const plantsToSkip = Math.abs(targetIndex - platformIndex)
      
      results.push({
        row: 2,
        direction: targetIndex > platformIndex ? "right" : "left",
        columnsToSkip: Math.round(plantsToSkip),
        targetColumnNumber: targetCol,
        error: undefined
      })
    }

    // Return the closest option
    return results.reduce((closest, current) => 
      current.columnsToSkip < closest.columnsToSkip ? current : closest
    )
  }

  const pathCalculation = calculatePath()

  const renderPlantRow = (rowIndex: number, numbers: number[]) => {
    return (
      <div className="flex justify-between w-full">
        {numbers.map((num, index) => (
          <div
            key={`${rowIndex}-${index}`}
            className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-md hover:bg-green-600 transition-colors relative"
          >
            <div className="w-10 h-10 bg-green-700 rounded-full flex items-center justify-center">
              <div className="w-6 h-6 bg-green-800 rounded-full"></div>
            </div>
            <div className="absolute -bottom-6 text-xs font-bold text-gray-700 bg-white px-1 rounded shadow">
              {num}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4 text-center">Greenhouse Planner</h2>
        
        <div className="space-y-4 mb-8">
          <div className="flex items-center gap-4 justify-center">
            <label htmlFor="row1" className="text-sm font-medium w-20">
              Row 1:
            </label>
            <Input
              id="row1"
              type="text"
              placeholder="[1-4][8-20]"
              value={row1Input}
              onChange={(e) => setRow1Input(e.target.value)}
              className="w-40"
            />
            <Button onClick={handleRow1Update} size="sm">
              Update
            </Button>
          </div>
          
          <div className="flex items-center gap-4 justify-center">
            <label htmlFor="row2" className="text-sm font-medium w-20">
              Row 2:
            </label>
            <Input
              id="row2"
              type="text"
              placeholder="[1-4][8-20]"
              value={row2Input}
              onChange={(e) => setRow2Input(e.target.value)}
              className="w-40"
            />
            <Button onClick={handleRow2Update} size="sm">
              Update
            </Button>
          </div>
          
          <div className="flex items-center gap-4 justify-center">
            <label htmlFor="targetColumn" className="text-sm font-medium w-20">
              Target:
            </label>
            <Input
              id="targetColumn"
              type="number"
              placeholder="Column #"
              value={targetColumn}
              onChange={(e) => setTargetColumn(e.target.value)}
              className="w-24"
            />
          </div>
          
          <div className="text-center text-xs text-gray-600">
            Format: [start-end][start-end] e.g., [1-4][8-20]
          </div>
        </div>
      </div>

      <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-6">
        <div className="space-y-8">
          <div className="bg-amber-100 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4 text-center text-amber-800">
              Row 1 ({row1Numbers.length} plants)
            </h3>
            <div className="mb-4">
              {renderPlantRow(0, row1Numbers)}
            </div>
          </div>

          <div 
            ref={pathRef}
            className="bg-stone-300 rounded-lg p-4 min-h-[60px] relative cursor-crosshair"
            onMouseDown={handleMouseDown}
          >
            {/* Platform */}
            <div
              className={`absolute w-12 h-8 bg-orange-500 rounded-lg shadow-lg flex items-center justify-center cursor-move ${
                isDragging ? 'scale-110 shadow-xl' : 'hover:scale-105'
              }`}
              style={{
                left: `${platformX}%`,
                transform: 'translateX(-50%)',
                top: '50%',
                marginTop: '-16px'
              }}
              onMouseDown={handleMouseDown}
            >
              <div className="text-white text-xs font-bold">📦</div>
            </div>
          </div>

          <div className="bg-amber-100 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4 text-center text-amber-800">
              Row 2 ({row2Numbers.length} plants)
            </h3>
            <div className="mb-4">
              {renderPlantRow(1, row2Numbers)}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 text-center text-sm text-gray-600 space-y-1">
        <div>Total plants: {row1Numbers.length + row2Numbers.length}</div>
        <div>Platform position: {Math.round(platformX)}%</div>
        
        {pathCalculation && !pathCalculation.error && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2">Path Calculation:</h4>
            <div className="text-blue-700 space-y-1">
              <div>🎯 Target Column: {targetColumn}</div>
              <div>📍 Check Row {pathCalculation.row}</div>
              <div>👉 Direction: Go {pathCalculation.direction}</div>
              <div>📏 Columns to skip: {pathCalculation.columnsToSkip}</div>
            </div>
          </div>
        )}
        
        {pathCalculation?.error && (
          <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="text-red-700">❌ {pathCalculation.error}</div>
          </div>
        )}
      </div>
    </div>
  )
}