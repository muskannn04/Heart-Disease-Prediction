import { NextResponse } from "next/server"
import { modelManager } from "@/lib/models/model-manager"

// Sample test data for validation
const testCases = [
  {
    name: "Low Risk Patient",
    input: {
      age: 35,
      sex: 0,
      cp: 0,
      trestbps: 110,
      chol: 180,
      fbs: 0,
      restecg: 0,
      thalach: 170,
      exang: 0,
      oldpeak: 0.5,
      slope: 0,
      ca: 0,
      thal: 1,
    },
    expectedRisk: "Low",
  },
  {
    name: "High Risk Patient",
    input: {
      age: 65,
      sex: 1,
      cp: 2,
      trestbps: 160,
      chol: 280,
      fbs: 1,
      restecg: 1,
      thalach: 110,
      exang: 1,
      oldpeak: 3.0,
      slope: 2,
      ca: 2,
      thal: 3,
    },
    expectedRisk: "High",
  },
  {
    name: "Medium Risk Patient",
    input: {
      age: 50,
      sex: 1,
      cp: 1,
      trestbps: 140,
      chol: 220,
      fbs: 0,
      restecg: 0,
      thalach: 140,
      exang: 0,
      oldpeak: 1.5,
      slope: 1,
      ca: 1,
      thal: 2,
    },
    expectedRisk: "Medium",
  },
]

export async function GET() {
  try {
    const results = []
    const models = ["random_forest", "svm", "logistic_regression"]

    for (const testCase of testCases) {
      const testResult = {
        testCase: testCase.name,
        expected: testCase.expectedRisk,
        results: {} as Record<string, any>,
      }

      for (const modelType of models) {
        try {
          const prediction = await modelManager.predict(testCase.input, modelType)
          testResult.results[modelType] = {
            prediction: prediction.prediction,
            probability: prediction.probability,
            riskLevel: prediction.riskLevel,
            confidence: prediction.confidence,
            modelUsed: prediction.modelUsed,
            correct: prediction.riskLevel === testCase.expectedRisk,
          }
        } catch (error) {
          testResult.results[modelType] = {
            error: error instanceof Error ? error.message : "Unknown error",
          }
        }
      }

      results.push(testResult)
    }

    // Calculate overall accuracy
    const accuracy = {} as Record<string, number>
    for (const modelType of models) {
      const correct = results.filter((r) => r.results[modelType]?.correct).length
      accuracy[modelType] = (correct / results.length) * 100
    }

    return NextResponse.json({
      success: true,
      data: {
        testResults: results,
        accuracy,
        totalTests: results.length,
        modelsTestedCount: models.length,
      },
      message: "Model testing completed successfully",
    })
  } catch (error) {
    console.error("Error running tests:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to run model tests",
      },
      { status: 500 },
    )
  }
}
