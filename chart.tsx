import ModelTesting from "@/components/model-testing"

export default function TestingPage() {
  return (
    <main className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Model Testing Dashboard</h1>
          <p className="text-lg text-muted-foreground">
            Validate and test the performance of heart disease prediction models
          </p>
        </div>

        <ModelTesting />
      </div>
    </main>
  )
}
