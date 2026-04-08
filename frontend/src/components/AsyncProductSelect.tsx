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
import { productService } from "../services/productService";
import { Producto } from "../lib/store";

export function AsyncProductSelect({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (val: string, producto?: Producto) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [options, setOptions] = React.useState<Producto[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [selectedProducto, setSelectedProducto] = React.useState<Producto | null>(null);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      searchProducts(query);
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  const searchProducts = async (searchQuery: string) => {
    setLoading(true);
    try {
      const res = await productService.getAll({ 
        q: searchQuery, 
        limit: 15 
      });
      const mapped: Producto[] = res.data.map((p: any) => ({
        id: p.id_producto.toString(),
        nombre: p.nombre,
        descripcion: p.descripcion || "",
        categoriaId: p.id_categoria.toString(),
        marca: p.id_marca.toString(),
        precioCompra: Number(p.costo_promedio),
        precioVenta: Number(p.precio_venta),
        stock: p.stock_actual,
        stockMinimo: p.stock_min,
        stockMaximo: p.stock_max,
        imagenUrl: p.imagen_url || "",
        estado: p.estado ? "activo" : "inactivo",
        fechaCreacion: new Date().toISOString(),
      }));
      setOptions(mapped);
      
      const current = mapped.find((m) => m.id === value);
      if (current) setSelectedProducto(current);
      
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
          className="w-full justify-between bg-white border-gray-200 text-gray-800 rounded-xl hover:bg-gray-50 h-[42px]"
          disabled={disabled}
        >
          {value
            ? selectedProducto?.nombre || options.find((p) => p.id === value)?.nombre || "Producto seleccionado"
            : "Buscar producto por nombre..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 border-gray-200 rounded-xl" style={{ width: "100%", minWidth: "var(--radix-popover-trigger-width)" }}>
        <Command shouldFilter={false} className="border-none rounded-xl">
          <div className="flex items-center px-3 border-b border-gray-100">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <input
              className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-gray-400 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Escribe para buscar..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <CommandList>
            {loading && <div className="p-4 text-sm text-center text-gray-500">Buscando...</div>}
            {!loading && options.length === 0 && (
              <div className="p-4 text-sm text-center text-gray-500">No se encontraron productos.</div>
            )}
            <CommandGroup>
              {!loading && options.map((prod) => (
                <CommandItem
                  key={prod.id}
                  value={prod.id}
                  onSelect={(currentValue: string) => {
                    onChange(currentValue === value ? "" : currentValue, currentValue === value ? undefined : prod);
                    setSelectedProducto(prod);
                    setOpen(false);
                  }}
                  className="cursor-pointer"
                >
                  <Check
                    className={`mr-2 h-4 w-4 ${
                      value === prod.id ? "opacity-100" : "opacity-0"
                    }`}
                  />
                  <div className="flex flex-col">
                    <span>{prod.nombre}</span>
                    <span className="text-gray-400 text-xs">Stock: {prod.stock}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
