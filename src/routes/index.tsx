import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle2, Loader2 } from "lucide-react";
import { submitRegistration } from "@/server/submit";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import tourlandLogo from "@/assets/tourland-logo.jpg";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Xitoy Ko'rgazmasi 2025 — Ro'yxatdan o'ting | Tourland" },
      {
        name: "description",
        content:
          "Xitoyda ishlab chiqarish bo'yicha ko'rgazmaga qatnashish uchun ro'yxatdan o'ting. 25-26 va 28-29 aprel sanalari mavjud.",
      },
    ],
  }),
});

const PHONE_PREFIX = "+998 ";

function formatPhone(value: string): string {
  // Always keep prefix
  let digits = value.replace(/\D/g, "");
  // Remove leading country code if user typed it
  if (digits.startsWith("998")) digits = digits.slice(3);
  digits = digits.slice(0, 9);

  let out = PHONE_PREFIX;
  if (digits.length > 0) out += digits.slice(0, 2);
  if (digits.length >= 3) out += " " + digits.slice(2, 5);
  if (digits.length >= 6) out += " " + digits.slice(5, 7);
  if (digits.length >= 8) out += " " + digits.slice(7, 9);
  return out;
}

function Index() {
  const submitFn = useServerFn(submitRegistration);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState(PHONE_PREFIX);
  const [date, setDate] = useState("");
  const [people, setPeople] = useState("");
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (!open) return;
    if (countdown <= 0) {
      window.location.href = "https://t.me/tourland_uz";
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [open, countdown]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhone(e.target.value));
  };

  const handlePhoneFocus = () => {
    if (!phone || !phone.startsWith(PHONE_PREFIX)) {
      setPhone(PHONE_PREFIX);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !date || !people) return;

    const digits = phone.replace(/\D/g, "");
    if (digits.length < 12) {
      toast.error("Telefon raqamni to'liq kiriting");
      return;
    }

    setLoading(true);
    try {
      await submitFn({
        data: { name, phone, date, people, question },
      });
      setCountdown(3);
      setOpen(true);
    } catch (err) {
      console.error(err);
      toast.error("Xatolik yuz berdi. Iltimos qaytadan urinib ko'ring.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary flex items-center justify-center px-4 py-12">
      <Toaster />
      <div className="w-full max-w-2xl">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl overflow-hidden mb-6 shadow-lg bg-white">
            <img src={tourlandLogo} alt="Tourland" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
            Xitoyda ishlab chiqarish bo'yicha ko'rgazma
          </h1>
          <p className="text-lg text-muted-foreground">
            Ko'rgazmaga bormoqchi bo'lsangiz, ma'lumotlaringizni qoldiring
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-xl space-y-5"
        >
          <div className="space-y-2">
            <Label htmlFor="name">Ismingiz</Label>
            <Input
              id="name"
              placeholder="Ismingizni kiriting"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefon raqamingiz</Label>
            <Input
              id="phone"
              type="tel"
              inputMode="numeric"
              placeholder="+998 90 123 45 67"
              value={phone}
              onChange={handlePhoneChange}
              onFocus={handlePhoneFocus}
              required
              maxLength={20}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Qaysi sanadagi ko'rgazmaga qatnashmoqchisiz?</Label>
            <Select value={date} onValueChange={setDate} required>
              <SelectTrigger id="date">
                <SelectValue placeholder="Sanani tanlang" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="25-26-aprel">25-26 aprel</SelectItem>
                <SelectItem value="28-29-aprel">28-29 aprel</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="people">Necha kishi bo'lasizlar?</Label>
            <Input
              id="people"
              type="number"
              min={1}
              max={100}
              placeholder="Masalan: 2"
              value={people}
              onChange={(e) => setPeople(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="question">Qo'shimcha savollaringiz</Label>
            <Textarea
              id="question"
              placeholder="Qo'shimcha savollaringiz bo'lsa yozib qoldiring"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              maxLength={1000}
              rows={4}
            />
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={loading}
            className="w-full text-base font-semibold"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Yuborilmoqda...
              </>
            ) : (
              "Yuborish"
            )}
          </Button>
        </form>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle2 className="h-10 w-10 text-primary" />
            </div>
            <DialogTitle className="text-center text-2xl">
              Ma'lumotlaringiz muvaffaqiyatli yuborildi!
            </DialogTitle>
            <DialogDescription className="text-center text-base pt-2">
              Siz bilan tez orada bog'lanamiz.
              <br />
              <span className="block mt-3 text-sm text-muted-foreground">
                {countdown} soniyadan so'ng Telegram kanalimizga yo'naltirilasiz...
              </span>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}
