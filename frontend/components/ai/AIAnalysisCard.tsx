"use client"

type AIAnalysis = {
  techStack: string[]
  complexity: string
  usabilityScore: number
}

export default function AIAnalysisCard({ analysis }: { analysis: AIAnalysis }) {

  return (
    <div className="bg-[#020617] border border-slate-700 p-5 rounded-xl mt-4">

      <h3 className="text-lg font-semibold mb-3 text-blue-400">
        AI Analysis
      </h3>

      <div className="mb-3">
        <p className="text-sm text-gray-400 mb-2">Tech Stack</p>

        <div className="flex flex-wrap gap-2">

          {analysis.techStack.map((tech) => (
            <span
              key={tech}
              className="bg-blue-600 text-white text-xs px-3 py-1 rounded"
            >
              {tech}
            </span>
          ))}

        </div>
      </div>

      <div className="mb-3">

        <p className="text-sm text-gray-400">
          Complexity
        </p>

        <p className="font-semibold">
          {analysis.complexity}
        </p>

      </div>

      <div>

        <p className="text-sm text-gray-400 mb-2">
          Usability Score
        </p>

        <div className="w-full bg-gray-800 rounded-full h-3">

          <div
            className="bg-green-500 h-3 rounded-full"
            style={{ width: `${analysis.usabilityScore}%` }}
          />

        </div>

        <p className="text-sm mt-1">
          {analysis.usabilityScore}/100
        </p>

      </div>

    </div>
  )
}