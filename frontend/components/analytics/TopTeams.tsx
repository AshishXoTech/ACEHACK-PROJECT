type Team = {
  teamId: string
  teamName: string
  score: number
}

export default function TopTeams({ teams }: { teams: Team[] }) {

  return (

    <div className="bg-[#0f172a] p-6 rounded-xl">

      <h2 className="text-xl font-semibold mb-4">
        Top Teams
      </h2>

      {teams.length === 0 && (
        <p className="text-gray-400">
          No scores yet
        </p>
      )}

      <div className="space-y-3">

        {teams.map((team, index) => (

          <div
            key={team.teamId}
            className="flex justify-between border-b border-slate-700 pb-2"
          >

            <span>
              {index + 1}. {team.teamName}
            </span>

            <span className="font-semibold text-green-400">
              {team.score}
            </span>

          </div>

        ))}

      </div>

    </div>

  )

}