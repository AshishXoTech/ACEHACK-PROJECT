export default function Footer() {
  return (
    <footer className="border-t border-slate-800 mt-20">

      <div className="container py-16">

        <div className="grid md:grid-cols-4 gap-10">

          {/* PRODUCT */}

          <div>
            <h4 className="font-semibold mb-4">Product</h4>

            <ul className="space-y-3 text-sm text-slate-400">
              <li>Features</li>
              <li>Leaderboard</li>
              <li>Judging</li>
              <li>Certificates</li>
            </ul>
          </div>

          {/* DEVELOPERS */}

          <div>
            <h4 className="font-semibold mb-4">Developers</h4>

            <ul className="space-y-3 text-sm text-slate-400">
              <li>API Docs</li>
              <li>Integrations</li>
              <li>Open Source</li>
            </ul>
          </div>

          {/* COMMUNITY */}

          <div>
            <h4 className="font-semibold mb-4">Community</h4>

            <ul className="space-y-3 text-sm text-slate-400">
              <li>Discord</li>
              <li>Twitter</li>
              <li>LinkedIn</li>
            </ul>
          </div>

          {/* ABOUT */}

          <div>
            <h4 className="font-semibold mb-4">HackFlow AI</h4>

            <p className="text-sm text-slate-400">
              HackFlow AI is a modern hackathon management platform
              that automates registrations, submissions, judging,
              and leaderboards using intelligent insights.
            </p>
          </div>

        </div>

        {/* BOTTOM */}

        <div className="border-t border-slate-800 mt-12 pt-6 text-sm text-slate-500 text-center">
          © 2026 HackFlow AI — Built for the next generation of hackathons.
        </div>

      </div>

    </footer>
  );
}