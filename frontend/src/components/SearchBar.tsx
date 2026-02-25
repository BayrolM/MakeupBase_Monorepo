import { Search } from 'lucide-react';
import { Input } from './ui/input';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChange, placeholder = 'Buscar...' }: SearchBarProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-secondary" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10 bg-input-background border-border text-foreground"
        placeholder={placeholder}
      />
    </div>
  );
}
