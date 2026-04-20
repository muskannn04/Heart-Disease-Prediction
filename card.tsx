import PredictionForm from "@/components/prediction-form"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <main className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Heart Disease Detection System</h1>
          <p className="text-lg text-muted-foreground mb-6">
            Advanced ML-powered prediction system for heart disease risk assessment
          </p>
          <div className="flex justify-center gap-4 mb-8">
            <Button asChild>
              <Link href="/testing">Model Testing Dashboard</Link>
            </Button>
          </div>
        </div>

        <PredictionForm />
      </div>
    </main>
  )
}
