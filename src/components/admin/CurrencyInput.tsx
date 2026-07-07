import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";

type CurrencyInputProps = {
  id?: string;
  value: number;
  onChange: (value: number) => void;
  onBlur?: () => void;
  placeholder?: string;
};

// Aceita: "99,90", "1.299,90", "R$ 1.299,90", colagem e digitação livre.
const parseCurrency = (raw: string): number => {
  const cleaned = raw
    .replace(/[^\d,.-]/g, "") // remove "R$", espaços e qualquer letra
    .replace(/\.(?=\d{3}(?:\D|$))/g, "") // remove pontos de milhar (1.299 -> 1299)
    .replace(",", "."); // vírgula decimal -> ponto decimal

  const parsed = parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatForDisplay = (value: number): string => {
  if (!value) return "";
  return value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export function CurrencyInput({ id, value, onChange, onBlur, placeholder }: CurrencyInputProps) {
  const [text, setText] = useState(() => formatForDisplay(value));
  const [focused, setFocused] = useState(false);

  // Reformata quando o valor muda externamente (ex: form.reset()), mas nunca enquanto o usuário digita.
  useEffect(() => {
    if (!focused) {
      setText(formatForDisplay(value));
    }
  }, [value, focused]);

  return (
    <Input
      id={id}
      type="text"
      inputMode="decimal"
      placeholder={placeholder ?? "0,00"}
      value={text}
      onFocus={() => setFocused(true)}
      onChange={(event) => {
        const raw = event.target.value;
        setText(raw);
        onChange(parseCurrency(raw));
      }}
      onBlur={() => {
        setFocused(false);
        setText(formatForDisplay(value));
        onBlur?.();
      }}
    />
  );
}
