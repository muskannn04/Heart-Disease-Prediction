"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Loader2, Heart, AlertTriangle, CheckCircle } from "lucide-react"

interface PredictionInput {
  age: number
  sex: number
  cp: number
  trestbps: number
  chol: number
  fbs: number
  restecg: number
  thalach: number
  exang: number
  oldpeak: number
  slope: number
  ca: number
  thal: number
}

interface PredictionResult {
  prediction: number
  probability: number
  riskLevel: "Low" | "Medium" | "High"
  confidence: number
  modelUsed: string
  timestamp: string
}

export default function PredictionForm() {
  const [formData, setFormData] = useState<Partial<PredictionInput>>({})
  const [selectedModel, setSelectedModel] = useState("random_forest")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<PredictionResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleInputChange = (field: keyof PredictionInput, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: Number.parseFloat(value) || 0,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch("/api/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input: formData,
          modelType: selectedModel,
        }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || "Prediction failed")
      }

      setResult(data.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "Low":
        return "bg-green-100 text-green-800 border-green-200"
      case "Medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "High":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case "Low":
        return <CheckCircle className="h-4 w-4" />
      case "Medium":
        return <AlertTriangle className="h-4 w-4" />
      case "High":
        return <Heart className="h-4 w-4" />
      default:
        return null
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Heart Disease Risk Prediction</CardTitle>
          <CardDescription>
            Enter patient data to predict heart disease risk using machine learning models
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Model Selection */}
            <div className="space-y-2">
              <Label htmlFor="model">Select Model</Label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="random_forest">Random Forest (87% accuracy)</SelectItem>
                  <SelectItem value="svm">Support Vector Machine (84% accuracy)</SelectItem>
                  <SelectItem value="logistic_regression">Logistic Regression (82% accuracy)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Patient Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="e.g., 45"
                  onChange={(e) => handleInputChange("age", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sex">Sex</Label>
                <Select onValueChange={(value) => handleInputChange("sex", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select sex" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Female</SelectItem>
                    <SelectItem value="1">Male</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cp">Chest Pain Type</Label>
                <Select onValueChange={(value) => handleInputChange("cp", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Typical Angina</SelectItem>
                    <SelectItem value="1">Atypical Angina</SelectItem>
                    <SelectItem value="2">Non-Anginal Pain</SelectItem>
                    <SelectItem value="3">Asymptomatic</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="trestbps">Resting Blood Pressure</Label>
                <Input
                  id="trestbps"
                  type="number"
                  placeholder="e.g., 120"
                  onChange={(e) => handleInputChange("trestbps", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="chol">Cholesterol</Label>
                <Input
                  id="chol"
                  type="number"
                  placeholder="e.g., 200"
                  onChange={(e) => handleInputChange("chol", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fbs">Fasting Blood Sugar {">"} 120</Label>
                <Select onValueChange={(value) => handleInputChange("fbs", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">No</SelectItem>
                    <SelectItem value="1">Yes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="restecg">Resting ECG</Label>
                <Select onValueChange={(value) => handleInputChange("restecg", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select result" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Normal</SelectItem>
                    <SelectItem value="1">ST-T Wave Abnormality</SelectItem>
                    <SelectItem value="2">Left Ventricular Hypertrophy</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="thalach">Max Heart Rate</Label>
                <Input
                  id="thalach"
                  type="number"
                  placeholder="e.g., 150"
                  onChange={(e) => handleInputChange("thalach", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="exang">Exercise Induced Angina</Label>
                <Select onValueChange={(value) => handleInputChange("exang", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">No</SelectItem>
                    <SelectItem value="1">Yes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="oldpeak">ST Depression</Label>
                <Input
                  id="oldpeak"
                  type="number"
                  step="0.1"
                  placeholder="e.g., 1.0"
                  onChange={(e) => handleInputChange("oldpeak", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slope">ST Slope</Label>
                <Select onValueChange={(value) => handleInputChange("slope", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select slope" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Upsloping</SelectItem>
                    <SelectItem value="1">Flat</SelectItem>
                    <SelectItem value="2">Downsloping</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ca">Major Vessels</Label>
                <Select onValueChange={(value) => handleInputChange("ca", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select count" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0</SelectItem>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="thal">Thalassemia</Label>
                <Select onValueChange={(value) => handleInputChange("thal", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Normal</SelectItem>
                    <SelectItem value="2">Fixed Defect</SelectItem>
                    <SelectItem value="3">Reversible Defect</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Predict Heart Disease Risk"
              )}
            </Button>
          </form>

          {error && (
            <Alert className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {result && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Prediction Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Risk Level:</span>
                  <Badge className={`${getRiskColor(result.riskLevel)} flex items-center gap-1`}>
                    {getRiskIcon(result.riskLevel)}
                    {result.riskLevel} Risk
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Probability:</span>
                  <span className="text-sm">{(result.probability * 100).toFixed(1)}%</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Model Used:</span>
                  <span className="text-sm">{result.modelUsed}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Model Confidence:</span>
                  <span className="text-sm">{(result.confidence * 100).toFixed(1)}%</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Prediction:</span>
                  <span className="text-sm">
                    {result.prediction === 1 ? "Heart Disease Detected" : "No Heart Disease Detected"}
                  </span>
                </div>

                <div className="text-xs text-muted-foreground">
                  Analysis completed at {new Date(result.timestamp).toLocaleString()}
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
