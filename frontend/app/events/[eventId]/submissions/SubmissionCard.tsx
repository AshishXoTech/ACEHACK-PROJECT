"use client"

import React from "react"
import AIAnalysisCard from "@/components/ai/AIAnalysisCard"

type Submission = {
  id: string
  teamName: string
  repoUrl: string
  demoUrl?: string
  summary: string
  status: string
  score?: number
  mlAnalysis?: {
    techStack: string[]
    complexity: string
    usabilityScore: number
  }
}

export default function SubmissionCard({ submission }: { submission: Submission }) {
  return (
    <div className="bg-[#0f172a] p-6 rounded-xl shadow-lg border border-[#1e293b] hover:border-[#334155] transition-colors h-full flex flex-col">

      <div className="flex justify-between items-start mb-3">
        <h2 className="text-lg font-semibold flex-1">
          {submission.teamName}
        </h2>
        {submission.score && (
          <span className="bg-green-600 text-white px-3 py-1 rounded text-xs font-semibold ml-2 flex-shrink-0">
            {submission.score}
          </span>
        )}
      </div>

      {submission.status && (
        <span className={`inline-block px-2 py-1 rounded text-xs font-medium mb-3 w-fit ${
          submission.status === 'approved' ? 'bg-green-900 text-green-200' :
          submission.status === 'pending' ? 'bg-yellow-900 text-yellow-200' :
          'bg-red-900 text-red-200'
        }`}>
          {submission.status}
        </span>
      )}

      <p className="text-gray-400 mb-4 text-sm line-clamp-4 break-words flex-grow">
        {submission.summary}
      </p>

      <div className="flex gap-2 mb-4 flex-wrap">

        <a
          href={submission.repoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300 underline text-sm"
        >
          Repository
        </a>

        {submission.demoUrl && (
          <a
            href={submission.demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-400 hover:text-green-300 underline text-sm"
          >
            Demo
          </a>
        )}

      </div>

      {submission.mlAnalysis && (
        <AIAnalysisCard analysis={submission.mlAnalysis} />
      )}

    </div>
  )
}
