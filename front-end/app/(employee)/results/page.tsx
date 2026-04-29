"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PredictionResult } from "@/lib/api/quiz";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import BurnRateGauge from "@/components/charts/BurnRateGauge";

// ============================================================
// TODO: These recommendations could come from the backend.
// For now they are hardcoded based on severity thresholds.
// ============================================================
const RECOMMENDATIONS = {
  low: [
    { title: "Keep it up!", description: "Your stress levels are healthy. Continue your current routines." },
    { title: "Stay Active", description: "Maintain regular exercise and social activities." },
  ],
  moderate: [
    { title: "Take Regular Breaks", description: "Step away from your station every 90 minutes for a 10-minute walk." },
    { title: "Talk to Someone", description: "Share your feelings with a trusted colleague or friend." },
    { title: "Sleep Hygiene", description: "Aim for 7-8 hours of quality sleep each night." },
  ],
  high: [
    { title: "Speak with HR", description: "Request a workload review or shift adjustment with your supervisor." },
    { title: "Professional Support", description: "Consider scheduling a session with the workplace counselor." },
    { title: "15-min Breathing Exercise", description: "Practice deep breathing or meditation during breaks." },
    { title: "Reduce Overtime", description: "Limit extra hours until your recovery improves." },
  ],
  critical: [
    { title: "Immediate Counseling", description: "Please contact the Employee Assistance Program right away." },
    { title: "Medical Check-up", description: "Schedule a visit with your doctor to assess physical symptoms." },
    { title: "Mandatory Rest", description: "Request time off to recover — your health comes first." },
    { title: "Talk to Your Manager", description: "Escalate workload concerns to management immediately." },
  ],
};

function getRecommendations(burnRate: number) {
  if (burnRate <= 0.3) return RECOMMENDATIONS.low;
  if (burnRate <= 0.6) return RECOMMENDATIONS.moderate;
  if (burnRate <= 0.8) return RECOMMENDATIONS.high;
  return RECOMMENDATIONS.critical;
}

export default function ResultsPage() {
  const [result, setResult] = useState<PredictionResult | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("burnout_result");
    if (stored) {
      setResult(JSON.parse(stored));
    }
  }, []);

  if (!result) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <h1 className="font-serif font-medium text-2xl text-near-black mb-4">
          No Results Available
        </h1>
        <p className="text-olive-gray mb-6">
          You need to complete the assessment first.
        </p>
        <Link href="/assessment">
          <Button variant="brand">Take Assessment</Button>
        </Link>
      </div>
    );
  }

  const recommendations = getRecommendations(result.burnRate);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="font-serif font-medium text-3xl text-near-black mb-2">
          Your Assessment Results
        </h1>
        <p className="text-olive-gray">
          AI-predicted burnout analysis based on your responses and work profile.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card title="Predicted Burn Rate" className="flex flex-col items-center">
          <BurnRateGauge value={result.burnRate} />
        </Card>

        <Card title="Mental Fatigue Score">
          <div className="flex flex-col items-center justify-center h-full py-4">
            <p className="text-5xl font-serif font-medium text-near-black">
              {result.mentalFatigueScore}
            </p>
            <p className="text-stone-gray mt-2">out of 10.0</p>
          </div>
        </Card>
      </div>

      <div className="mb-8">
        <h2 className="font-serif font-medium text-2xl text-near-black mb-4">
          Recommendations
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.map((rec) => (
            <Card key={rec.title}>
              <h3 className="font-medium text-near-black mb-1">{rec.title}</h3>
              <p className="text-sm text-olive-gray">{rec.description}</p>
            </Card>
          ))}
        </div>
      </div>

      <div className="flex gap-4">
        <Link href="/dashboard">
          <Button variant="secondary">Back to Dashboard</Button>
        </Link>
        <Link href="/assessment">
          <Button variant="brand">Retake Assessment</Button>
        </Link>
      </div>
    </div>
  );
}
