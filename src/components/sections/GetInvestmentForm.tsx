"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion } from "framer-motion";

/* ═══════════════════════════════════════════════════════
   Country codes — dial code, ISO, name, phone digit range
   ═══════════════════════════════════════════════════════ */

interface CountryCode {
  code: string;   // ISO 3166
  dial: string;   // e.g. "+91"
  name: string;
  min: number;     // min digits (excluding dial code)
  max: number;     // max digits
}

const COUNTRY_CODES: CountryCode[] = [
  { code: "IN", dial: "+91",  name: "India",          min: 10, max: 10 },
  { code: "US", dial: "+1",   name: "United States",  min: 10, max: 10 },
  { code: "GB", dial: "+44",  name: "United Kingdom", min: 10, max: 10 },
  { code: "AE", dial: "+971", name: "UAE",            min: 9,  max: 9  },
  { code: "SG", dial: "+65",  name: "Singapore",      min: 8,  max: 8  },
  { code: "AU", dial: "+61",  name: "Australia",       min: 9,  max: 9  },
  { code: "CA", dial: "+1",   name: "Canada",         min: 10, max: 10 },
  { code: "DE", dial: "+49",  name: "Germany",        min: 10, max: 11 },
  { code: "FR", dial: "+33",  name: "France",         min: 9,  max: 9  },
  { code: "JP", dial: "+81",  name: "Japan",          min: 10, max: 10 },
  { code: "CN", dial: "+86",  name: "China",          min: 11, max: 11 },
  { code: "KR", dial: "+82",  name: "South Korea",    min: 9,  max: 10 },
  { code: "BR", dial: "+55",  name: "Brazil",         min: 10, max: 11 },
  { code: "ID", dial: "+62",  name: "Indonesia",      min: 9,  max: 12 },
  { code: "IL", dial: "+972", name: "Israel",         min: 9,  max: 9  },
  { code: "NL", dial: "+31",  name: "Netherlands",    min: 9,  max: 9  },
  { code: "SE", dial: "+46",  name: "Sweden",         min: 9,  max: 10 },
  { code: "CH", dial: "+41",  name: "Switzerland",    min: 9,  max: 9  },
  { code: "HK", dial: "+852", name: "Hong Kong",      min: 8,  max: 8  },
  { code: "MY", dial: "+60",  name: "Malaysia",       min: 9,  max: 10 },
  { code: "PH", dial: "+63",  name: "Philippines",    min: 10, max: 10 },
  { code: "TH", dial: "+66",  name: "Thailand",       min: 9,  max: 9  },
  { code: "VN", dial: "+84",  name: "Vietnam",        min: 9,  max: 10 },
  { code: "ZA", dial: "+27",  name: "South Africa",   min: 9,  max: 9  },
  { code: "NG", dial: "+234", name: "Nigeria",        min: 10, max: 10 },
  { code: "KE", dial: "+254", name: "Kenya",          min: 9,  max: 9  },
  { code: "MX", dial: "+52",  name: "Mexico",         min: 10, max: 10 },
  { code: "SA", dial: "+966", name: "Saudi Arabia",   min: 9,  max: 9  },
  { code: "PK", dial: "+92",  name: "Pakistan",       min: 10, max: 10 },
  { code: "BD", dial: "+880", name: "Bangladesh",     min: 10, max: 10 },
  { code: "LK", dial: "+94",  name: "Sri Lanka",      min: 9,  max: 9  },
  { code: "NP", dial: "+977", name: "Nepal",          min: 10, max: 10 },
];

/* ═══════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════ */

/** Validate a URL — must be a full http(s) URL or we prepend https:// and check */
function isValidUrl(value: string): boolean {
  if (!value.trim()) return true; // empty is ok (required check is separate)
  let url = value.trim();
  if (!/^https?:\/\//i.test(url)) url = "https://" + url;
  try {
    const parsed = new URL(url);
    // Must have a dot in host (e.g. acme.com, not just "localhost")
    return parsed.hostname.includes(".");
  } catch {
    return false;
  }
}

/** Validate phone: only digits, length within country range */
function isValidPhone(digits: string, country: CountryCode): boolean {
  if (!digits) return true; // empty is ok
  if (!/^\d+$/.test(digits)) return false;
  return digits.length >= country.min && digits.length <= country.max;
}

/* ═══════════════════════════════════════════════════════
   Constants
   ═══════════════════════════════════════════════════════ */

const INDUSTRY_OPTIONS = [
  "AI / ML",
  "Fintech",
  "Health",
  "Climate",
  "Developer tools",
  "B2B SaaS",
  "Consumer",
  "Deep tech",
  "Logistics",
  "Education",
  "Other",
];

const RAISED_BEFORE_OPTIONS = [
  "No — first round",
  "Yes — angels only",
  "Yes — institutional",
  "Bootstrapped",
];

const ONE_LINE_MAX = 100;
const PROBLEM_MAX = 500;
const ANYTHING_ELSE_MAX = 500;

/* ═══════════════════════════════════════════════════════
   Animation variants
   ═══════════════════════════════════════════════════════ */

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const, delay },
  }),
};

/* ═══════════════════════════════════════════════════════
   Reusable form primitives
   ═══════════════════════════════════════════════════════ */

function FieldLabel({
  children,
  required,
  htmlFor,
}: {
  children: React.ReactNode;
  required?: boolean;
  htmlFor?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-[clamp(8px,0.8vw,12px)] block font-['Poppins',_sans-serif] font-medium text-[#1D2939]"
      style={{ fontSize: "clamp(14px, min(1.25vw, 1.85vh), 18px)" }}
    >
      {children}
      {required && <span className="ml-1 text-[#C53030]">*</span>}
    </label>
  );
}

function TextInput({
  id,
  placeholder,
  value,
  onChange,
  type = "text",
}: {
  id: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <input
      id={id}
      name={id}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-[10px] border-none bg-[#F2F7FF] font-['Poppins',_sans-serif] text-[#1D2939] outline-none transition-shadow duration-200 placeholder:text-[#98A2B3] focus:ring-2 focus:ring-[#001A4D]/20"
      style={{
        padding: "clamp(14px, min(1.25vw, 1.85vh), 18px) clamp(16px, min(1.4vw, 2vh), 22px)",
        fontSize: "clamp(13px, min(1.1vw, 1.6vh), 16px)",
      }}
    />
  );
}

function TextArea({
  id,
  placeholder,
  value,
  onChange,
  maxChars,
  rows = 5,
}: {
  id: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  maxChars: number;
  rows?: number;
}) {
  return (
    <div>
      <textarea
        id={id}
        name={id}
        value={value}
        onChange={(e) => {
          if (e.target.value.length <= maxChars) onChange(e.target.value);
        }}
        placeholder={placeholder}
        rows={rows}
        className="w-full resize-none rounded-[10px] border-none bg-[#F2F7FF] font-['Poppins',_sans-serif] text-[#1D2939] outline-none transition-shadow duration-200 placeholder:text-[#98A2B3] focus:ring-2 focus:ring-[#001A4D]/20"
        style={{
          padding: "clamp(14px, min(1.25vw, 1.85vh), 18px) clamp(16px, min(1.4vw, 2vh), 22px)",
          fontSize: "clamp(13px, min(1.1vw, 1.6vh), 16px)",
        }}
      />
      <p
        className="mt-[6px] text-right font-['Poppins',_sans-serif] text-[#98A2B3]"
        style={{ fontSize: "clamp(11px, min(0.9vw, 1.3vh), 13px)" }}
      >
        {value.length}/{maxChars} characters
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   Phone input with country code selector
   ═══════════════════════════════════════════════════════ */

function PhoneInput({
  country,
  onCountryChange,
  phone,
  onPhoneChange,
  error,
}: {
  country: CountryCode;
  onCountryChange: (c: CountryCode) => void;
  phone: string;
  onPhoneChange: (v: string) => void;
  error: string;
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
      setDropdownOpen(false);
      setSearch("");
    }
  }, []);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [handleClickOutside]);

  const filtered = useMemo(() => {
    if (!search.trim()) return COUNTRY_CODES;
    const q = search.toLowerCase();
    return COUNTRY_CODES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.dial.includes(q) ||
        c.code.toLowerCase().includes(q)
    );
  }, [search]);

  const [phoneFocused, setPhoneFocused] = useState(false);

  /* Live validation state:
     - empty → neutral (no ring)
     - invalid → red ring (persists after blur)
     - valid + focused → green ring
     - valid + blurred → no ring (green goes away) */
  const liveStatus: "neutral" | "invalid" | "valid" =
    phone.length === 0
      ? "neutral"
      : isValidPhone(phone, country)
        ? "valid"
        : "invalid";

  const ringClass =
    liveStatus === "invalid"
      ? "ring-2 ring-[#C53030]/40"
      : liveStatus === "valid" && phoneFocused
        ? "ring-2 ring-[#16a34a]/40"
        : "";

  return (
    <div>
      <div ref={wrapperRef} className="relative flex w-full">
        {/* Country code button */}
        <button
          type="button"
          onClick={() => { setDropdownOpen((p) => !p); setSearch(""); }}
          className={`flex shrink-0 items-center gap-[6px] rounded-l-[10px] border-none bg-[#F2F7FF] font-['Poppins',_sans-serif] text-[#1D2939] outline-none transition-all hover:bg-[#DCE4FA] ${ringClass}`}
          style={{
            padding: "clamp(14px, min(1.25vw, 1.85vh), 18px) clamp(10px, min(1vw, 1.4vh), 14px)",
            fontSize: "clamp(13px, min(1.1vw, 1.6vh), 16px)",
            borderRight: "1px solid #D0D5DD",
          }}
        >
          <span>{country.code}</span>
          <span className="text-[#667085]">{country.dial}</span>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className={`transition-transform ${dropdownOpen ? "rotate-180" : ""}`}>
            <path d="M2 3.5L5 6.5L8 3.5" stroke="#667085" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Phone number input */}
        <input
          type="tel"
          value={phone}
          onChange={(e) => {
            const v = e.target.value.replace(/[^\d]/g, "");
            onPhoneChange(v);
          }}
          onFocus={() => setPhoneFocused(true)}
          onBlur={() => setPhoneFocused(false)}
          placeholder={`${"0".repeat(country.min)}`}
          className={`min-w-0 flex-1 rounded-r-[10px] border-none bg-[#F2F7FF] font-['Poppins',_sans-serif] text-[#1D2939] outline-none transition-all duration-200 placeholder:text-[#98A2B3] ${ringClass}`}
          style={{
            padding: "clamp(14px, min(1.25vw, 1.85vh), 18px) clamp(16px, min(1.4vw, 2vh), 22px)",
            fontSize: "clamp(13px, min(1.1vw, 1.6vh), 16px)",
          }}
        />

        {/* Dropdown */}
        {dropdownOpen && (
          <div
            className="absolute left-0 top-full z-50 mt-[4px] w-full overflow-hidden rounded-[10px] border border-[#E4E7EC] bg-white shadow-lg"
            style={{ maxHeight: 240 }}
          >
            {/* Search */}
            <div className="border-b border-[#E4E7EC] p-[8px]">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search country..."
                autoFocus
                className="w-full rounded-[6px] border border-[#E4E7EC] bg-[#F9FAFB] px-[10px] py-[6px] font-['Poppins',_sans-serif] text-[13px] text-[#1D2939] outline-none placeholder:text-[#98A2B3] focus:ring-1 focus:ring-[#001A4D]/20"
              />
            </div>
            <div className="overflow-y-auto" style={{ maxHeight: 190 }}>
              {filtered.length === 0 ? (
                <p className="px-3 py-3 font-['Poppins',_sans-serif] text-[12px] text-[#98A2B3]">No results</p>
              ) : (
                filtered.map((c) => (
                  <button
                    key={c.code + c.dial}
                    type="button"
                    onClick={() => {
                      onCountryChange(c);
                      setDropdownOpen(false);
                      setSearch("");
                    }}
                    className={`flex w-full items-center gap-[8px] px-3 py-[8px] text-left font-['Poppins',_sans-serif] text-[13px] transition-colors hover:bg-[#F0F4FF] ${
                      c.code === country.code && c.dial === country.dial ? "bg-[#F0F4FF] font-medium text-[#001A4D]" : "text-[#344054]"
                    }`}
                  >
                    <span className="w-[36px] shrink-0 text-[#667085]">{c.dial}</span>
                    <span className="truncate">{c.name}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Live validation hint or submit error */}
      {(liveStatus === "invalid" || error) && (
        <p
          className="mt-[6px] font-['Poppins',_sans-serif] text-[#C53030]"
          style={{ fontSize: "clamp(11px, min(0.9vw, 1.3vh), 13px)" }}
        >
          {error ||
            (country.min === country.max
              ? `Enter ${country.min} digits for ${country.name}`
              : `Enter ${country.min}–${country.max} digits for ${country.name}`)}
        </p>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   Email validation helper
   ═══════════════════════════════════════════════════════ */

function isValidEmail(email: string): boolean {
  // Simple but reliable: local@domain.tld
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

/* ═══════════════════════════════════════════════════════a
   Email input with live validation
   ═══════════════════════════════════════════════════════ */

function EmailInput({
  id,
  placeholder,
  value,
  onChange,
}: {
  id: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [touched, setTouched] = useState(false);
  const [focused, setFocused] = useState(false);

  const liveStatus: "neutral" | "invalid" | "valid" =
    value.length === 0
      ? "neutral"
      : isValidEmail(value)
        ? "valid"
        : touched
          ? "invalid"
          : "neutral";

  /* Green ring only while focused; red ring persists after blur */
  const ringClass =
    liveStatus === "invalid"
      ? "ring-2 ring-[#C53030]/40"
      : liveStatus === "valid" && focused
        ? "ring-2 ring-[#16a34a]/40"
        : "";

  return (
    <div>
      <input
        id={id}
        name={id}
        type="email"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          if (!touched) setTouched(true);
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
          if (!touched) setTouched(true);
        }}
        placeholder={placeholder}
        className={`w-full rounded-[10px] border-none bg-[#F2F7FF] font-['Poppins',_sans-serif] text-[#1D2939] outline-none transition-all duration-200 placeholder:text-[#98A2B3] ${ringClass}`}
        style={{
          padding: "clamp(14px, min(1.25vw, 1.85vh), 18px) clamp(16px, min(1.4vw, 2vh), 22px)",
          fontSize: "clamp(13px, min(1.1vw, 1.6vh), 16px)",
        }}
      />
      {liveStatus === "invalid" && (
        <p
          className="mt-[6px] font-['Poppins',_sans-serif] text-[#C53030]"
          style={{ fontSize: "clamp(11px, min(0.9vw, 1.3vh), 13px)" }}
        >
          Please enter a valid email address
        </p>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   URL input with validation
   ═══════════════════════════════════════════════════════ */

function UrlInput({
  id,
  placeholder,
  value,
  onChange,
  error,
  onBlur,
}: {
  id: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  error: string;
  onBlur: () => void;
}) {
  return (
    <div>
      <input
        id={id}
        name={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        className={`w-full rounded-[10px] border-none bg-[#F2F7FF] font-['Poppins',_sans-serif] text-[#1D2939] outline-none transition-shadow duration-200 placeholder:text-[#98A2B3] focus:ring-2 focus:ring-[#001A4D]/20 ${
          error ? "ring-2 ring-[#C53030]/30" : ""
        }`}
        style={{
          padding: "clamp(14px, min(1.25vw, 1.85vh), 18px) clamp(16px, min(1.4vw, 2vh), 22px)",
          fontSize: "clamp(13px, min(1.1vw, 1.6vh), 16px)",
        }}
      />
      {error && (
        <p
          className="mt-[6px] font-['Poppins',_sans-serif] text-[#C53030]"
          style={{ fontSize: "clamp(11px, min(0.9vw, 1.3vh), 13px)" }}
        >
          {error}
        </p>
      )}
    </div>
  );
}

function CheckboxGroup({
  options,
  selected,
  onToggle,
  multi = true,
}: {
  options: string[];
  selected: Set<string>;
  onToggle: (val: string) => void;
  multi?: boolean;
}) {
  return (
    <div
      className="flex flex-wrap gap-x-[clamp(16px,2vw,32px)] gap-y-[clamp(12px,1.2vw,20px)] rounded-[10px] bg-[#F2F7FF]"
      style={{
        padding: "clamp(16px, min(1.6vw, 2.4vh), 24px) clamp(18px, min(1.8vw, 2.6vh), 28px)",
      }}
    >
      {options.map((opt) => {
        const checked = selected.has(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onToggle(opt)}
            className="flex items-center gap-[clamp(6px,0.6vw,10px)] font-['Poppins',_sans-serif] text-[#1D2939] transition-colors"
            style={{ fontSize: "clamp(13px, min(1.1vw, 1.6vh), 16px)" }}
          >
            <span
              className={`flex shrink-0 items-center justify-center rounded-[4px] border-[1.5px] transition-colors duration-150 ${
                checked
                  ? "border-[#001A4D] bg-[#001A4D]"
                  : "border-[#C0C5D0] bg-white"
              }`}
              style={{
                width: "clamp(18px, min(1.6vw, 2.4vh), 24px)",
                height: "clamp(18px, min(1.6vw, 2.4vh), 24px)",
              }}
            >
              {checked && (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M2.5 6L5 8.5L9.5 3.5"
                    stroke="white"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </span>
            {opt}
          </button>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   File upload drop zone
   ═══════════════════════════════════════════════════════ */

function FileUpload({
  file,
  onFile,
}: {
  file: File | null;
  onFile: (f: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const dropped = e.dataTransfer.files[0];
      if (dropped) onFile(dropped);
    },
    [onFile]
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`flex cursor-pointer flex-col items-center justify-center rounded-[10px] bg-[#F2F7FF] transition-colors ${
        dragOver ? "ring-2 ring-[#001A4D]/30" : ""
      }`}
      style={{
        padding: "clamp(28px, min(3vw, 4.5vh), 48px) clamp(20px, min(2vw, 3vh), 32px)",
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.pptx,.ppt,.png,.jpg,.jpeg,.doc,.docx,.xls,.xlsx,.csv,.txt"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0] ?? null;
          onFile(f);
        }}
      />

      {file ? (
        <div className="flex flex-col items-center gap-2">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-[#001A4D]">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p
            className="font-['Poppins',_sans-serif] font-medium text-[#001A4D]"
            style={{ fontSize: "clamp(13px, min(1.1vw, 1.6vh), 15px)" }}
          >
            {file.name}
          </p>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onFile(null);
            }}
            className="font-['Poppins',_sans-serif] text-[#667085] underline transition-colors hover:text-[#344054]"
            style={{ fontSize: "clamp(11px, min(0.9vw, 1.3vh), 13px)" }}
          >
            Remove
          </button>
        </div>
      ) : (
        <>
          {/* Upload icon */}
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            className="mb-[8px] text-[#667085]"
          >
            <path
              d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M14 2v6h6M12 18v-6M9 15l3-3 3 3"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <p
            className="font-['Poppins',_sans-serif] font-medium text-[#1D2939]"
            style={{ fontSize: "clamp(13px, min(1.1vw, 1.6vh), 15px)" }}
          >
            Upload Deck
          </p>
          <p
            className="mt-[4px] text-center font-['Poppins',_sans-serif] text-[#98A2B3]"
            style={{ fontSize: "clamp(11px, min(0.9vw, 1.3vh), 13px)" }}
          >
            Supported formats: PDF, PPTX, DOC, PNG, JPG
            <br />& Max Size: 20MB
          </p>
        </>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   Section divider heading (e.g. "About You" / "The Company")
   ═══════════════════════════════════════════════════════ */

function SectionHeading({
  label,
  title,
  subtitle,
}: {
  label: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-[clamp(24px,min(2.5vw,3.7vh),40px)]">
      <p
        className="mb-[clamp(4px,0.4vw,8px)] font-['Poppins',_sans-serif] font-normal text-[#667085]"
        style={{ fontSize: "clamp(13px, min(1.1vw, 1.6vh), 16px)" }}
      >
        {label}
      </p>
      <h3
        className="mb-[clamp(6px,0.6vw,10px)] font-['Libre_Baskerville',_serif] font-semibold text-[#001A4D]"
        style={{ fontSize: "clamp(22px, min(2.2vw, 3.3vh), 32px)" }}
      >
        {title}
      </h3>
      <p
        className="font-['Poppins',_sans-serif] font-normal text-[#667085]"
        style={{ fontSize: "clamp(13px, min(1.1vw, 1.6vh), 16px)" }}
      >
        {subtitle}
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   Main form component
   ═══════════════════════════════════════════════════════ */

export default function GetInvestmentForm() {
  /* ── Form state ── */
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneCountry, setPhoneCountry] = useState<CountryCode>(COUNTRY_CODES[0]); // India default
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [linkedin, setLinkedin] = useState("");

  const [companyName, setCompanyName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [urlError, setUrlError] = useState("");
  const [oneLiner, setOneLiner] = useState("");
  const [problem, setProblem] = useState("");
  const [industries, setIndustries] = useState<Set<string>>(new Set());
  const [currentStage, setCurrentStage] = useState("");
  const [raisingAmount, setRaisingAmount] = useState("");
  const [raisedBefore, setRaisedBefore] = useState<Set<string>>(new Set());
  const [pitchDeck, setPitchDeck] = useState<File | null>(null);
  const [hearAbout, setHearAbout] = useState("");
  const [anythingElse, setAnythingElse] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const toggleIndustry = useCallback((val: string) => {
    setIndustries((prev) => {
      const next = new Set(prev);
      if (next.has(val)) next.delete(val);
      else next.add(val);
      return next;
    });
  }, []);

  const toggleRaised = useCallback((val: string) => {
    setRaisedBefore((prev) => {
      const next = new Set(prev);
      if (next.has(val)) next.delete(val);
      else next.add(val);
      return next;
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate email
    if (email && !isValidEmail(email)) {
      return;
    }

    // Validate phone
    if (phone && !isValidPhone(phone, phoneCountry)) {
      setPhoneError(
        phoneCountry.min === phoneCountry.max
          ? `Enter a valid ${phoneCountry.name} number (${phoneCountry.min} digits)`
          : `Enter a valid ${phoneCountry.name} number (${phoneCountry.min}–${phoneCountry.max} digits)`
      );
      return;
    }

    // Validate URL
    if (websiteUrl.trim() && !isValidUrl(websiteUrl)) {
      setUrlError("Please enter a valid URL (e.g. https://acme.com)");
      return;
    }

    setSubmitting(true);

    try {
      const body = new FormData();
      body.append("firstName", firstName);
      body.append("lastName", lastName);
      body.append("email", email);
      body.append("phoneCountry", phoneCountry.code);
      body.append("phoneDial", phoneCountry.dial);
      body.append("phone", phone);
      body.append("linkedin", linkedin);
      body.append("companyName", companyName);
      body.append("websiteUrl", websiteUrl);
      body.append("oneLiner", oneLiner);
      body.append("problem", problem);
      body.append("industries", Array.from(industries).join(", "));
      body.append("currentStage", currentStage);
      body.append("raisingAmount", raisingAmount);
      body.append("raisedBefore", Array.from(raisedBefore).join(", "));
      body.append("hearAbout", hearAbout);
      body.append("anythingElse", anythingElse);
      if (pitchDeck) body.append("pitchDeck", pitchDeck);

      const res = await fetch("/api/apply", { method: "POST", body });
      const json = await res.json();

      if (json.success) {
        setSubmitted(true);
      } else {
        setSubmitError(json.message || "Something went wrong. Please try again.");
      }
    } catch {
      setSubmitError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      className="relative flex w-full flex-col items-center overflow-hidden bg-white"
      style={{
        paddingTop: "clamp(40px, min(6.94vw, 10.18vh), 100px)",
        paddingBottom: "clamp(40px, min(6.94vw, 10.18vh), 100px)",
        paddingLeft: "var(--section-px-wide)",
        paddingRight: "var(--section-px-wide)",
      }}
    >
      <div className="mx-auto flex w-full max-w-[1440px] flex-col items-center">

        {/* ══════════════════════════════════════════
            HEADING: "Build something the world needs."
            ══════════════════════════════════════════ */}
        <motion.div
          className="mb-[clamp(36px,min(4.5vw,6.5vh),64px)] flex flex-col items-center text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
        >
          <motion.h2
            className="m-0 font-['Libre_Baskerville',_serif] font-semibold leading-[115%] text-[#001A4D] max-md:!text-[28px]"
            style={{ fontSize: "var(--heading-xl)" }}
            custom={0}
            variants={fadeUp}
          >
            Build something
          </motion.h2>

          <motion.div
            className="relative mt-[clamp(4px,0.5vw,8px)] inline-flex items-center justify-center overflow-hidden bg-transparent px-[4px] py-[8px] md:px-[6px] md:py-[10px]"
            custom={0.2}
            variants={fadeUp}
          >
            <motion.span
              className="absolute inset-0 z-0 h-full w-full bg-[#D3E2FF]"
              style={{ transformOrigin: "left" }}
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: "easeInOut", delay: 0.8 }}
            />
            <span
              className="relative z-10 font-['Libre_Baskerville',_serif] font-semibold italic leading-[115%] text-[#001A4D] max-md:!text-[28px]"
              style={{ fontSize: "var(--heading-xl)" }}
            >
              the world needs.
            </span>
          </motion.div>

          <motion.p
            className="mt-[clamp(16px,min(2.5vw,4vh),36px)] max-w-[600px] font-['Poppins',_sans-serif] font-normal leading-[1.6] text-[#323232] text-center"
            style={{ fontSize: "clamp(14px, min(1.6vw, 2.35vh), 20px)" }}
            custom={0.4}
            variants={fadeUp}
          >
            We back founders at the earliest stage — before the playbook exists. Tell us about what you&apos;re building. Takes about 10 minutes.
          </motion.p>
        </motion.div>

        {/* ══════════════════════════════════════════
            SUCCESS STATE
            ══════════════════════════════════════════ */}
        {submitted ? (
          <motion.div
            className="flex w-full max-w-[940px] flex-col items-center rounded-[clamp(12px,1.2vw,20px)] border border-[#E4E7EC] bg-white text-center"
            style={{
              padding: "clamp(48px, min(6vw, 9vh), 96px) clamp(24px, min(3.5vw, 5vh), 56px)",
            }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" className="mb-[20px] text-[#16a34a]">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <h3
              className="font-['Libre_Baskerville',_serif] font-semibold text-[#001A4D]"
              style={{ fontSize: "clamp(22px, min(2.2vw, 3.3vh), 32px)" }}
            >
              Application submitted
            </h3>
            <p
              className="mt-[clamp(12px,1.2vw,20px)] max-w-[460px] font-['Poppins',_sans-serif] font-normal leading-[1.6] text-[#667085]"
              style={{ fontSize: "clamp(14px, min(1.25vw, 1.85vh), 18px)" }}
            >
              We read every application personally. You&apos;ll hear from us soon.
            </p>
          </motion.div>
        ) : (

        /* ══════════════════════════════════════════
            FORM CARD
            ══════════════════════════════════════════ */
        <motion.form
          onSubmit={handleSubmit}
          className="w-full max-w-[940px] rounded-[clamp(12px,1.2vw,20px)] border border-[#E4E7EC] bg-white"
          style={{
            padding:
              "clamp(32px, min(4vw, 6vh), 64px) clamp(24px, min(3.5vw, 5vh), 56px)",
          }}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
        >

          {/* ────────────────────────────────────────
              SECTION 1: About You — The Founder
              ──────────────────────────────────────── */}
          <SectionHeading
            label="About You"
            title="The founder"
            subtitle="We invest in people first. Tell us who you are."
          />

          {/* First Name / Last Name */}
          <div
            className="grid grid-cols-1 md:grid-cols-2"
            style={{
              gap: "clamp(16px, min(1.6vw, 2.4vh), 24px)",
              marginBottom: "clamp(20px, min(2vw, 3vh), 32px)",
            }}
          >
            <div>
              <FieldLabel required htmlFor="firstName">First Name</FieldLabel>
              <TextInput id="firstName" placeholder="Jane" value={firstName} onChange={setFirstName} />
            </div>
            <div>
              <FieldLabel required htmlFor="lastName">Last Name</FieldLabel>
              <TextInput id="lastName" placeholder="Doe" value={lastName} onChange={setLastName} />
            </div>
          </div>

          {/* Email / Phone */}
          <div
            className="grid grid-cols-1 md:grid-cols-2"
            style={{
              gap: "clamp(16px, min(1.6vw, 2.4vh), 24px)",
              marginBottom: "clamp(20px, min(2vw, 3vh), 32px)",
            }}
          >
            <div>
              <FieldLabel required htmlFor="email">Email</FieldLabel>
              <EmailInput id="email" placeholder="jane@company.com" value={email} onChange={setEmail} />
            </div>
            <div>
              <FieldLabel required htmlFor="phone">Phone number</FieldLabel>
              <PhoneInput
                country={phoneCountry}
                onCountryChange={(c) => {
                  setPhoneCountry(c);
                  setPhoneError("");
                }}
                phone={phone}
                onPhoneChange={(v) => {
                  setPhone(v);
                  if (phoneError) setPhoneError("");
                }}
                error={phoneError}
              />
            </div>
          </div>

          {/* LinkedIn */}
          <div
            style={{
              marginBottom: "clamp(40px, min(4vw, 6vh), 64px)",
            }}
          >
            <FieldLabel htmlFor="linkedin">LinkedIn or personal site</FieldLabel>
            <TextInput id="linkedin" placeholder="linkedin.com/in/jane" value={linkedin} onChange={setLinkedin} />
          </div>

          {/* ── Divider ── */}
          <hr className="mb-[clamp(32px,min(3.5vw,5vh),56px)] border-[#E4E7EC]" />

          {/* ────────────────────────────────────────
              SECTION 2: The Company
              ──────────────────────────────────────── */}
          <SectionHeading
            label="The Company"
            title="What are you building?"
            subtitle=""
          />

          {/* Company Name / Website */}
          <div
            className="grid grid-cols-1 md:grid-cols-2"
            style={{
              gap: "clamp(16px, min(1.6vw, 2.4vh), 24px)",
              marginBottom: "clamp(20px, min(2vw, 3vh), 32px)",
            }}
          >
            <div>
              <FieldLabel required htmlFor="companyName">Company name</FieldLabel>
              <TextInput id="companyName" placeholder="Acme Inc." value={companyName} onChange={setCompanyName} />
            </div>
            <div>
              <FieldLabel required htmlFor="websiteUrl">Website or product URL</FieldLabel>
              <UrlInput
                id="websiteUrl"
                placeholder="https://acme.com"
                value={websiteUrl}
                onChange={(v) => {
                  setWebsiteUrl(v);
                  if (urlError) setUrlError("");
                }}
                error={urlError}
                onBlur={() => {
                  if (websiteUrl.trim() && !isValidUrl(websiteUrl)) {
                    setUrlError("Please enter a valid URL (e.g. https://acme.com)");
                  } else {
                    setUrlError("");
                  }
                }}
              />
            </div>
          </div>

          {/* One-line description */}
          <div style={{ marginBottom: "clamp(20px, min(2vw, 3vh), 32px)" }}>
            <FieldLabel required htmlFor="oneLiner">
              One-line description <span className="font-normal text-[#98A2B3]">(≤ 15 words)</span>
            </FieldLabel>
            <TextInput
              id="oneLiner"
              placeholder="e.g. AI-powered freight matching for cross-border SME logistics"
              value={oneLiner}
              onChange={(v) => { if (v.length <= ONE_LINE_MAX) setOneLiner(v); }}
            />
            <p
              className="mt-[6px] text-right font-['Poppins',_sans-serif] text-[#98A2B3]"
              style={{ fontSize: "clamp(11px, min(0.9vw, 1.3vh), 13px)" }}
            >
              {oneLiner.length}/{ONE_LINE_MAX} characters
            </p>
          </div>

          {/* Problem statement */}
          <div style={{ marginBottom: "clamp(20px, min(2vw, 3vh), 32px)" }}>
            <FieldLabel required htmlFor="problem">
              What problem are you solving, and why does it matter now?
            </FieldLabel>
            <TextArea
              id="problem"
              placeholder="Describe the problem from the customer's perspective. Why is now the right moment — what has changed in the market, technology, or regulation?"
              value={problem}
              onChange={setProblem}
              maxChars={PROBLEM_MAX}
              rows={5}
            />
          </div>

          {/* Industry / sector */}
          <div style={{ marginBottom: "clamp(20px, min(2vw, 3vh), 32px)" }}>
            <FieldLabel required>
              Industry / sector <span className="font-normal text-[#98A2B3]">(select all that apply)</span>
            </FieldLabel>
            <CheckboxGroup
              options={INDUSTRY_OPTIONS}
              selected={industries}
              onToggle={toggleIndustry}
            />
          </div>

          {/* Current stage */}
          <div style={{ marginBottom: "clamp(20px, min(2vw, 3vh), 32px)" }}>
            <FieldLabel htmlFor="currentStage">Current stage</FieldLabel>
            <TextInput id="currentStage" placeholder="e.g. Pre-seed, Seed, Series A" value={currentStage} onChange={setCurrentStage} />
          </div>

          {/* How much raising */}
          <div style={{ marginBottom: "clamp(20px, min(2vw, 3vh), 32px)" }}>
            <FieldLabel htmlFor="raisingAmount">How much are you raising? (in Rs.)</FieldLabel>
            <TextInput id="raisingAmount" placeholder="e.g. 2,00,00,000" value={raisingAmount} onChange={setRaisingAmount} />
          </div>

          {/* Raised before */}
          <div style={{ marginBottom: "clamp(20px, min(2vw, 3vh), 32px)" }}>
            <FieldLabel>Have you raised before?</FieldLabel>
            <CheckboxGroup
              options={RAISED_BEFORE_OPTIONS}
              selected={raisedBefore}
              onToggle={toggleRaised}
            />
          </div>

          {/* Pitch deck upload */}
          <div style={{ marginBottom: "clamp(20px, min(2vw, 3vh), 32px)" }}>
            <FieldLabel required>Pitch deck <span className="font-normal text-[#98A2B3]">(PDF, PPT, DOC, or image)</span></FieldLabel>
            <FileUpload file={pitchDeck} onFile={setPitchDeck} />
          </div>

          {/* How did you hear about us */}
          <div style={{ marginBottom: "clamp(20px, min(2vw, 3vh), 32px)" }}>
            <FieldLabel htmlFor="hearAbout">How did you hear about us?</FieldLabel>
            <TextInput
              id="hearAbout"
              placeholder="Founder Referral, Linkedin, Website, News, Other"
              value={hearAbout}
              onChange={setHearAbout}
            />
          </div>

          {/* Anything else */}
          <div style={{ marginBottom: "clamp(32px, min(3.5vw, 5vh), 48px)" }}>
            <FieldLabel htmlFor="anythingElse">Anything else you want us to know?</FieldLabel>
            <TextArea
              id="anythingElse"
              placeholder="A contrarian belief about your market, a risk you're thinking hard about, what keeps you up at night — or just something about you as a person."
              value={anythingElse}
              onChange={setAnythingElse}
              maxChars={ANYTHING_ELSE_MAX}
              rows={5}
            />
          </div>

          {/* ── Submit button ── */}
          <div className="flex flex-col items-center">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-[8px] bg-[#001A4D] font-['Poppins',_sans-serif] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              style={{
                padding:
                  "clamp(12px, min(1.25vw, 1.85vh), 18px) clamp(48px, min(5vw, 7vh), 72px)",
                fontSize: "clamp(14px, min(1.25vw, 1.85vh), 18px)",
              }}
            >
              {submitting ? "Submitting…" : "Submit"}
            </button>

            {/* Closing message */}
            <div
              className="mt-[clamp(24px,min(2.5vw,3.7vh),40px)] text-center"
            >
              <p
                className="font-['Poppins',_sans-serif] font-semibold text-[#1D2939]"
                style={{ fontSize: "clamp(14px, min(1.25vw, 1.85vh), 18px)" }}
              >
                We read every application personally.
              </p>
              <p
                className="mt-[4px] font-['Poppins',_sans-serif] font-normal text-[#667085]"
                style={{ fontSize: "clamp(13px, min(1.1vw, 1.6vh), 16px)" }}
              >
                You&apos;ll hear from us soon
              </p>
            </div>
          </div>

        </motion.form>
        )}

        {/* ── Submit error toast ── */}
        {submitError && (
          <motion.div
            className="mt-[16px] w-full max-w-[940px] rounded-[10px] border border-[#FCA5A5] bg-[#FEF2F2] px-[20px] py-[14px] font-['Poppins',_sans-serif] text-[14px] text-[#991B1B]"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {submitError}
          </motion.div>
        )}

      </div>
    </section>
  );
}
