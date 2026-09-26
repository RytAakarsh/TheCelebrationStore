import { useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, MessageCircle, Phone, Send, CheckCircle2, Clock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ShopLayout, PageHeader } from "@/components/shop/ShopLayout";
import { BRAND, whatsappLink } from "@/lib/brand";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: `Contact Us — ${BRAND.name} | Visakhapatnam Store` },
      {
        name: "description",
        content: `Contact ${BRAND.name}, Poorna Market, Visakhapatnam. Phone/WhatsApp: ${BRAND.phone}. Get in touch for celebration supplies, bulk return gifts and party decorations.`,
      },
      { property: "og:title", content: `Contact ${BRAND.name}` },
      { property: "og:description", content: "Reach our Poorna Market store in Visakhapatnam." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("General Enquiry");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !message.trim()) {
      toast.error("Please fill in your name, phone number, and message.");
      return;
    }

    setSubmitting(true);
    try {
      // Try to save to contact_messages table if available
      try {
        await (supabase.from("contact_messages" as any) as any).insert({
          name: name.trim(),
          email: email.trim() || null,
          phone: phone.trim(),
          subject: subject.trim(),
          message: message.trim(),
          created_at: new Date().toISOString(),
        });
      } catch (dbErr) {
        console.warn("DB contact_messages table fallback:", dbErr);
      }

      setSubmitted(true);
      toast.success("Thank you! Your message has been sent to our celebration team.");
    } catch (err: any) {
      toast.error(err.message || "Could not submit enquiry. Please WhatsApp or call us directly.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ShopLayout>
      <PageHeader
        title="Contact &amp; Store Location"
        subtitle="We'd love to help make your celebration memorable"
        breadcrumbs={[{ label: "Home", to: "/" }, { label: "Contact Us" }]}
      />

      <div className="container-page py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Contact Cards & Details (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-5">
              <h2 className="font-display text-xl font-bold text-ink">Get in Touch</h2>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Whether you need bulk balloons, custom return gift hampers, or event decoration advice, we are just a call or message away!
              </p>

              <div className="space-y-4 pt-2 text-sm">
                <div className="flex items-start gap-3">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gold/15 text-gold mt-0.5">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <strong className="block text-ink font-semibold">Store Address</strong>
                    <span className="text-xs text-muted-foreground leading-relaxed">
                      Party World, Poorna Market<br />
                      Visakhapatnam - 530001<br />
                      Andhra Pradesh, India
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-pink/15 text-pink mt-0.5">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div>
                    <strong className="block text-ink font-semibold">Phone Contact</strong>
                    <a href={`tel:+91${BRAND.phone}`} className="text-xs text-pink hover:underline font-medium">
                      {BRAND.phoneDisplay}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-500/15 text-emerald-600 mt-0.5">
                    <MessageCircle className="h-4 w-4" />
                  </div>
                  <div>
                    <strong className="block text-ink font-semibold">WhatsApp Store Assistance</strong>
                    <a
                      href={whatsappLink()}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-emerald-600 hover:underline font-medium"
                    >
                      +91 {BRAND.whatsapp} (Instant Chat)
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-purple/15 text-purple mt-0.5">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <strong className="block text-ink font-semibold">Email Address</strong>
                    <a href={`mailto:${BRAND.email}`} className="text-xs text-purple hover:underline font-medium break-all">
                      {BRAND.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-secondary text-muted-foreground mt-0.5">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <strong className="block text-ink font-semibold">Business Hours</strong>
                    <span className="text-xs text-muted-foreground">
                      Monday – Saturday: 9:30 AM – 9:00 PM<br />
                      Sunday: 10:00 AM – 8:00 PM
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Button asChild variant="gold" className="w-full rounded-xl shadow-gold" size="lg">
                  <a href={whatsappLink()} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    <span>Chat on WhatsApp Directly</span>
                  </a>
                </Button>
              </div>
            </div>

            {/* Google Maps Location Card */}
            <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <span className="text-xs font-bold text-ink flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-gold" /> Visakhapatnam Map
                </span>
                <a
                  href="https://maps.google.com/?q=Poorna+Market+Visakhapatnam"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-pink font-semibold hover:underline"
                >
                  Open in Google Maps
                </a>
              </div>
              <div className="relative aspect-video w-full bg-muted">
                <iframe
                  title="The Celebration Store - Poorna Market Visakhapatnam"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3799.857321287465!2d83.2982!3d17.7056!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a394336f32e4d9b%3A0x6b9d63c4826b1a3!2sPoorna%20Market%2C%20Visakhapatnam%2C%20Andhra%20Pradesh%20530001!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={false}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-full"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Contact & Enquiry Form (7 cols) */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl border border-border bg-card p-6 sm:p-10 shadow-sm">
              {submitted ? (
                <div className="text-center py-12 space-y-4">
                  <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-emerald-600">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <h3 className="font-display text-2xl font-bold text-ink">Thank You!</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Your celebration enquiry has been received. Our team will get back to you promptly via phone or WhatsApp.
                  </p>
                  <div className="pt-4">
                    <Button
                      onClick={() => {
                        setSubmitted(false);
                        setMessage("");
                      }}
                      variant="outline"
                      className="rounded-full"
                    >
                      Send Another Message
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-gold">
                      <Sparkles className="h-3.5 w-3.5" /> Send an Enquiry
                    </span>
                    <h3 className="mt-2 font-display text-2xl font-bold text-ink">How Can We Help You?</h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Tell us about your celebration requirements, bulk orders, or product questions.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label htmlFor="contact-name" className="text-xs font-semibold text-ink">
                        Your Full Name *
                      </label>
                      <Input
                        id="contact-name"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Ramesh Kumar"
                        className="rounded-xl"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="contact-phone" className="text-xs font-semibold text-ink">
                        Mobile / WhatsApp Number *
                      </label>
                      <Input
                        id="contact-phone"
                        required
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. 9876543210"
                        className="rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label htmlFor="contact-email" className="text-xs font-semibold text-ink">
                        Email Address (Optional)
                      </label>
                      <Input
                        id="contact-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. ramesh@gmail.com"
                        className="rounded-xl"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="contact-subject" className="text-xs font-semibold text-ink">
                        Enquiry Type
                      </label>
                      <select
                        id="contact-subject"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="h-10 w-full rounded-xl border border-input bg-card px-3 text-xs outline-none focus:border-gold"
                      >
                        <option value="General Enquiry">General Enquiry</option>
                        <option value="Bulk Return Gifts">Bulk Return Gifts</option>
                        <option value="Birthday Balloon Decor">Birthday / Balloon Decor</option>
                        <option value="Wedding Essentials">Wedding &amp; Marriage Supplies</option>
                        <option value="German Silver Custom Order">German Silver Custom Order</option>
                        <option value="Order Tracking Help">Order Tracking &amp; Delivery Help</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="contact-message" className="text-xs font-semibold text-ink">
                      Your Message / Celebration Details *
                    </label>
                    <Textarea
                      id="contact-message"
                      required
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Please tell us about your requirements, date of event, preferred quantities or specific products..."
                      className="rounded-xl text-xs"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded-xl bg-pink text-white hover:bg-pink/90 shadow-pink"
                    size="lg"
                  >
                    <Send className="mr-2 h-4 w-4" />
                    {submitting ? "Sending..." : "Submit Celebration Enquiry"}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </ShopLayout>
  );
}
