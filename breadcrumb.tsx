import ProtectedRoute from "@/components/auth/protected-route"
import PredictionForm from "@/components/prediction-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function PatientDashboard() {
  return (
    <ProtectedRoute requiredRole="patient">
      <div className="min-h-screen p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Patient Dashboard</h1>
            <p className="text-muted-foreground">Welcome to your personal heart disease risk assessment portal</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Risk Assessment</CardTitle>
                <CardDescription>Get your personalized heart disease risk evaluation</CardDescription>
              </CardHeader>
              <CardContent>
                <PredictionForm />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Your Health History</CardTitle>
                <CardDescription>View your previous assessments and track your health journey</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Your assessment history will appear here after you complete your first evaluation.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
