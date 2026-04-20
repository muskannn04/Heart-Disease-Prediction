"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, TestTube, CheckCircle, XCircle, AlertTriangle } from "lucide-react"

interface TestResult {
  testCase: string
  expected: string
  results: Record<string, any>
}

interface TestData {
  testResults: TestResult[]
  accuracy: Record<string, number>
  totalTests: number
  modelsTestedCount: number
}

export default function ModelTesting() {
  const [isLoading, setIsLoading] = useState(false)
  const [testData, setTestData] = useState<TestData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const runTests = async () => {
    setIsLoading(true)
    setError(null)
    setTestData(null)

    try {
      const response = await fetch("/api/test")
      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || "Test execution failed")
      }

      setTestData(data.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 80) return "bg-green-100 text-green-800 border-green-200"
    if (accuracy >= 60) return "bg-yellow-100 text-yellow-800 border-yellow-200"
    return "bg-red-100 text-red-800 border-red-200"
  }

  const getResultIcon = (correct: boolean) => {
    return correct ? <CheckCircle className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-red-600" />
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Model Testing & Validation
          </CardTitle>
          <CardDescription>Test all available models with sample data to validate prediction accuracy</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={runTests} disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running Tests...
              </>
            ) : (
              <>
                <TestTube className="mr-2 h-4 w-4" />
                Run Model Tests
              </>
            )}
          </Button>

          {error && (
            <Alert className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {testData && (
            <div className="mt-6 space-y-6">
              {/* Accuracy Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Model Accuracy Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.entries(testData.accuracy).map(([model, accuracy]) => (
                      <div key={model} className="text-center">
                        <div className="text-sm font-medium mb-2 capitalize">{model.replace("_", " ")}</div>
                        <Badge className={getAccuracyColor(accuracy)}>{accuracy.toFixed(1)}% Accurate</Badge>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 text-sm text-muted-foreground text-center">
                    {testData.totalTests} test cases • {testData.modelsTestedCount} models tested
                  </div>
                </CardContent>
              </Card>

              {/* Detailed Test Results */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Detailed Test Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {testData.testResults.map((test, index) => (
                      <Card key={index} className="border-l-4 border-l-blue-500">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base">{test.testCase}</CardTitle>
                          <CardDescription>Expected Risk Level: {test.expected}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {Object.entries(test.results).map(([model, result]) => (
                              <div key={model} className="p-3 border rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-medium capitalize">{model.replace("_", " ")}</span>
                                  {result.error ? (
                                    <XCircle className="h-4 w-4 text-red-600" />
                                  ) : (
                                    getResultIcon(result.correct)
                                  )}
                                </div>
                                {result.error ? (
                                  <div className="text-xs text-red-600">{result.error}</div>
                                ) : (
                                  <div className="space-y-1 text-xs">
                                    <div>Risk: {result.riskLevel}</div>
                                    <div>Probability: {(result.probability * 100).toFixed(1)}%</div>
                                    <div>Confidence: {(result.confidence * 100).toFixed(1)}%</div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
