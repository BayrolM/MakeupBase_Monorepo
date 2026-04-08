import * as React from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "./ui/command";
import { userService } from "../services/userService";

export function AsyncClientSelect({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [options, setOptions] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [selectedCliente, setSelectedCliente] = React.useState<any | null>(null);

  React.useEffect(() => {
    const fetchSelected = async () => {
      if (value && !selectedCliente && !options.find((o) => o.id === value)) {
        // Here we could fetch the single client if needed.
        // For simplicity, we just trigger a search if an ID exists.
      }
    };
    fetchSelected();
  }, [value]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      searchClients(query);
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  const searchClients = async (searchQuery: string) => {
    setLoading(true);
    try {
      const res = await userService.getAll({ 
        id_rol: 2, 
        q: searchQuery, 
        limit: 15 
      });
      const mapped = res.data.map((u: any) => ({
        id: u.id_usuario.toString(),
        nombre: `${u.nombres || u.nombre || ""} ${u.apellidos || u.apellido || ""}`.trim(),
        documento: u.documento,
      }));
      setOptions(mapped);
      
      // Keep track of the currently selected if it is among options
      const current = mapped.find((m: any) => m.id === value);
      if (current) setSelectedCliente(current as any);
      
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-white border-gray-200 text-gray-800 rounded-xl hover:bg-gray-50 h-11"
          disabled={disabled}
        >
          {value
            ? selectedCliente?.nombre || options.find((client) => client.id === value)?.nombre || "Cliente seleccionado"
            : "Buscar cliente..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 border-gray-200 rounded-xl" style={{ width: "100%", minWidth: "var(--radix-popover-trigger-width)" }}>
        <Command shouldFilter={false} className="border-none rounded-xl">
          <div className="flex items-center px-3 border-b border-gray-100">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <input
              className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-gray-400 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Buscar por nombre o documento..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <CommandList>
            {loading && <div className="p-4 text-sm text-center text-gray-500">Buscando...</div>}
            {!loading && options.length === 0 && (
              <div className="p-4 text-sm text-center text-gray-500">No se encontraron clientes.</div>
            )}
            <CommandGroup>
              {!loading && options.map((client) => (
                <CommandItem
                  key={client.id}
                  value={client.id}
                  onSelect={(currentValue: string) => {
                    onChange(currentValue === value ? "" : currentValue);
                    setSelectedCliente(client);
                    setOpen(false);
                  }}
                  className="cursor-pointer"
                >
                  <Check
                    className={`mr-2 h-4 w-4 ${
                      value === client.id ? "opacity-100" : "opacity-0"
                    }`}
                  />
                  {client.nombre} - <span className="text-gray-400 text-xs ml-2">{client.documento}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
