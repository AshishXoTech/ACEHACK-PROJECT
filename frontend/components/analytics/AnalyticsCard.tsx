type Props = {
  title: string
  value: number
}

export default function AnalyticsCard({ title, value }: Props) {
  return (
    <div className="bg-[#0f172a] p-6 rounded-xl shadow">

      <p className="text-gray-400 text-sm mb-2">
        {title}
      </p>

      <h2 className="text-3xl font-bold">
        {value}
      </h2>

    </div>
  )
}