import Image from 'next/image';
import { Button } from '@/components/Button';

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Image
              src="/graneet-form-logo.png"
              width={200}
              height={200}
              alt="Graneet Form Logo"
              className="mx-auto mb-6"
            />
          </div>

          <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-800 to-teal-600 bg-clip-text text-transparent mb-6">
            Graneet Form
          </h1>

          <p className="text-xl text-fd-muted-foreground mb-8 leading-relaxed">
            Simple and performant form library built with performance in mind.
            <br />
            Zero dependencies, easy to use, with built-in wizard system.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button href="/docs" variant="primary" size="lg">
              🚀 Quick Start
            </Button>
            <Button
              href="https://github.com/graneet/graneet-form"
              target="_blank"
              rel="noopener noreferrer"
              variant="secondary"
              size="lg"
              icon={
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" role="img" aria-label="Github">
                  <path
                    fillRule="evenodd"
                    d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
                    clipRule="evenodd"
                  />
                </svg>
              }
            >
              GitHub
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-fd-muted/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Graneet Form?</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6 rounded-lg bg-fd-background border border-fd-border">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-lg font-semibold mb-3">Performant</h3>
              <p className="text-fd-muted-foreground">
                Built with performance in mind. You will not have unwanted renders.
              </p>
            </div>

            <div className="text-center p-6 rounded-lg bg-fd-background border border-fd-border">
              <div className="text-4xl mb-4">🌈</div>
              <h3 className="text-lg font-semibold mb-3">Easy to use</h3>
              <p className="text-fd-muted-foreground">API is built to be as simple as possible.</p>
            </div>

            <div className="text-center p-6 rounded-lg bg-fd-background border border-fd-border">
              <div className="text-4xl mb-4">📦</div>
              <h3 className="text-lg font-semibold mb-3">Small bundle size</h3>
              <p className="text-fd-muted-foreground">Zero dependencies for optimal bundle size.</p>
            </div>

            <div className="text-center p-6 rounded-lg bg-fd-background border border-fd-border">
              <div className="text-4xl mb-4">🗒️</div>
              <h3 className="text-lg font-semibold mb-3">Built-in Wizard system</h3>
              <p className="text-fd-muted-foreground">Simply build interfaces with steps where each step has a form.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Example Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">Get Started in Seconds</h2>

          <div className="bg-fd-muted/50 rounded-lg p-6 text-left overflow-x-auto">
            <pre className="text-sm">
              <code>{`import { useForm } from '@graneet/form';

const MyForm = () => {
  const form = useForm({
    defaultValues: {
      name: '',
      email: ''
    }
  });

  return (
    <form onSubmit={form.handleSubmit(console.log)}>
      <input {...form.register('name')} placeholder="Name" />
      <input {...form.register('email')} placeholder="Email" />
      <button type="submit">Submit</button>
    </form>
  );
};`}</code>
            </pre>
          </div>

          <div className="mt-8">
            <Button href="/docs" variant="ghost" size="md">
              📚 See Full Documentation →
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
