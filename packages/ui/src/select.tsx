import React, { useState, useRef, useEffect } from "react";
import { FiChevronDown, FiChevronUp, FiCheck } from "react-icons/fi";
import { cn } from "../lib/util";

interface Option {
  label: string;
  value: string;
}

interface SelectProps {
  options: Option[];
  placeholder?: string;
  onChange?: (value: string) => void;
  value?: string;
  className?: string;
}

const Select: React.FC<SelectProps> = ({
  options,
  placeholder = "Select option",
  onChange,
  value,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(value || "");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (value: string) => {
    setSelected(value);
    onChange?.(value);
    setIsOpen(false);
  };

  return (
    <div ref={ref} className={cn("relative w-full", className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-inherit text-white " +
            "px-3 py-2 text-sm shadow-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        )}
      >
        <span className="truncate">
          {selected
            ? options.find((opt) => opt.value === selected)?.label
            : placeholder}
        </span>
        {isOpen ? (
          <FiChevronUp className="h-4 w-4 text-gray-500" />
        ) : (
          <FiChevronDown className="h-4 w-4 text-gray-500" />
        )}
      </button>

      {isOpen && (
        <div
          className="relative z-50 mt-2 w-full rounded-md border border-gray-200 bg-white shadow-lg "
        >
          <ul className="max-h-64 overflow-y-auto py-1 text-sm text-gray-800 bottom-0">
            {options.map((option) => (
              <li
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={cn(
                  "flex cursor-pointer items-center justify-between px-3 py-2 hover:bg-blue-50",
                  selected === option.value && "bg-blue-100 text-blue-700"
                )}
              >
                {option.label}
                {selected === option.value && <FiCheck className="h-4 w-4" />}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export {Select};
