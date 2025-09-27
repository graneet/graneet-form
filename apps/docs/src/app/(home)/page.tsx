import { Callout } from 'fumadocs-ui/components/callout';
import { Card, Cards } from 'fumadocs-ui/components/card';
import { DynamicCodeBlock } from 'fumadocs-ui/components/dynamic-codeblock';
import Image from 'next/image';
import { Button } from '@/components/Button';

const START_CODE = `import { useForm, Form, Field, Rule } from 'graneet-form';

interface ContactForm {
  name: string;
  email: string;
}

const ContactFormExample = () => {
  const form = useForm<ContactForm>({
    defaultValues: { name: '', email: '' }
  });

  return (
    <Form form={form} onSubmit={form.handleSubmit(console.log)}>
      <Field name="name" render={(props, state) => (
        <div>
          <input {...props} placeholder="Name" />
          {state.validationStatus.status === 'invalid' && (
            <span className="error">{state.validationStatus.message}</span>
          )}
        </div>
      )}>
        <Rule validationFn={(value) => !!value} message="Name is required" />
      </Field>
      
      <Field name="email" render={(props, state) => (
        <div>
          <input {...props} placeholder="Email" type="email" />
          {state.validationStatus.status === 'invalid' && (
            <span className="error">{state.validationStatus.message}</span>
          )}
        </div>
      )}>
        <Rule validationFn={(v) => v?.includes('@')} message="Valid email required" />
      </Field>
      
      <button type="submit">Submit</button>
    </Form>
  );
};`;

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

          <Cards className="grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            <Card
              icon="🚀"
              title="Performant"
              description="Built with performance in mind. You will not have unwanted renders."
            />
            <Card icon="🌈" title="Easy to use" description="API is built to be as simple as possible." />
            <Card icon="📦" title="Small bundle size" description="Zero dependencies for optimal bundle size." />
            <Card
              icon="🗒️"
              title="Built-in Wizard system"
              description="Simply build interfaces with steps where each step has a form."
            />
          </Cards>
        </div>
      </section>

      {/* Quick Example Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto flex flex-col gap-3">
          <h2 className="text-3xl font-bold text-center">Get Started in Seconds</h2>

          <Callout type="info">
            Graneet Form provides a simple yet powerful API for building forms with TypeScript support and granular
            subscriptions.
          </Callout>

          <DynamicCodeBlock lang="tsx" code={START_CODE} />

          <div className="text-center">
            <Button href="/docs" variant="ghost" size="md">
              📚 See Full Documentation →
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
