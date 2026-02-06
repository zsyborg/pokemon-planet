"use client";
import { useEffect, useState } from "react";

export default function SearchInput({
  onSearch,
}: {
  onSearch: (query: string) => void;
}) {
  const [value, setValue] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => {
      onSearch(value);
    }, 300); // debounce

    return () => clearTimeout(timeout);
  }, [value, onSearch]);

  return (
    <input
      type="text"
      placeholder="Search Pokémon..."
      value={value}
      onChange={(e) => setValue(e.target.value)}
      className="w-full rounded border p-2"
    />
  );
}
