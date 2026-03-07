"use client";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell,
} from "recharts";

interface AIAnalysis {
  codeQuality: number;
  innovation: number;
  complexity: number;
  readability: number;
  usability: number;
  techStack?: { name: string; confidence: number }[];
}

const COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ec4899", "#8b5cf6", "#06b6d4"];
const TT = {
  contentStyle: { background: "#0f172a", border: "1px solid #334155", borderRadius: 8, fontSize: 12 },
  labelStyle: { color: "#94a3b8" },
};

export default function AIAnalysisChart({ analysis }: { analysis: AIAnalysis }) {
  const radarData = [
    { subject: "Code Quality", value: analysis.codeQuality },
    { subject: "Innovation", value: analysis.innovation },
    { subject: "Complexity", value: analysis.complexity },
    { subject: "Readability", value: analysis.readability },
    { subject: "Usability", value: analysis.usability },
  ];

  const stackData = (analysis.techStack ?? []).map(t => ({
    name: t.name,
    confidence: Math.round(t.confidence * 100),
  }));

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">Score Breakdown</p>
        <ResponsiveContainer width="100%" height={260}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="#1e293b" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: "#94a3b8", fontSize: 11 }} />
            <PolarRadiusAxis angle={90} domain={[0, 10]} tick={{ fill: "#475569", fontSize: 10 }} />
            <Radar name="Score" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} strokeWidth={2} />
            <Tooltip {...TT} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {stackData.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">Tech Stack Confidence</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={stackData} layout="vertical" barSize={14}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} unit="%" />
              <YAxis type="category" dataKey="name" width={80} tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip {...TT} formatter={((v: number) => [`${v}%`, "Confidence"]) as any} />
              <Bar dataKey="confidence" radius={[0, 4, 4, 0]}>
                {stackData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
