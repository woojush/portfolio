export default function ContactPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 pb-16 pt-3 md:px-6 md:pt-4 bg-slate-100 text-slate-900">
      <section className="section-container pt-0" style={{ borderTop: 'none' }}>
        <header className="section-header">
          <div className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white px-6 py-6 text-center shadow-sm">
            <h1 className="text-section-title">Contact</h1>
            <p className="mt-2 max-w-2xl text-body text-slate-0 mx-auto">
              함께 성장하고 싶은 분들과 소통하고 싶습니다.
            </p>
          </div>
          <div className="mt-4 h-px w-full bg-slate-200" />
        </header>

        <div className="mt-8 mx-auto max-w-2xl">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 mb-2">이메일</h2>
                <a 
                  href="mailto:your.email@example.com" 
                  className="text-blue-600 hover:text-blue-800 transition"
                >
                  your.email@example.com
                </a>
              </div>
              
              <div>
                <h2 className="text-lg font-semibold text-slate-900 mb-2">GitHub</h2>
                <a 
                  href="https://github.com/woojush" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 transition"
                >
                  github.com/woojush
                </a>
              </div>
              
              <div>
                <h2 className="text-lg font-semibold text-slate-900 mb-2">LinkedIn</h2>
                <a 
                  href="https://linkedin.com/in/yourprofile" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 transition"
                >
                  linkedin.com/in/yourprofile
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

