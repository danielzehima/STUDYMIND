import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { ContactForm } from "@/components/contact/ContactForm";

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto flex max-w-xl flex-col gap-6 px-6 py-16">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Contact</h1>
          <p className="mt-2 text-sm text-slate-500">
            Une question, un problème, une suggestion ? Écrivez-nous.
          </p>
        </div>
        <ContactForm />
      </main>
      <Footer />
    </>
  );
}
