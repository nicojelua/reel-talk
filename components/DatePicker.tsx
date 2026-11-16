"use client";

import { useState } from "react";

type DatePickerProps = {
  selectedDate: string;
  onDateChange: (date: string) => void;
};

export default function DatePicker({
  selectedDate,
  onDateChange,
}: DatePickerProps) {
  const today = new Date();

  const [currentMonth, setCurrentMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const monthName = currentMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const daysInMonth = new Date(
    year,
    month + 1,
    0
  ).getDate();

  function previousMonth() {
    setCurrentMonth(
      new Date(year, month - 1, 1)
    );
  }

  function nextMonth() {
    setCurrentMonth(
      new Date(year, month + 1, 1)
    );
  }

  function selectDate(day: number) {
    const formattedMonth = String(month + 1).padStart(2, "0");
    const formattedDay = String(day).padStart(2, "0");

    const date = `${year}-${formattedMonth}-${formattedDay}`;

    onDateChange(date);
  }

  function isSelected(day: number) {
    const formattedMonth = String(month + 1).padStart(2, "0");
    const formattedDay = String(day).padStart(2, "0");

    return (
      selectedDate ===
      `${year}-${formattedMonth}-${formattedDay}`
    );
  }

  return (
    <div className="w-full rounded-2xl border border-[#3A3432] bg-[#1B1818] p-5">

      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={previousMonth}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-[#242020] text-lg transition hover:bg-[#332D2D]"
        >
          ‹
        </button>

        <h3 className="font-semibold text-[#F5EEE6]">
          {monthName}
        </h3>

        <button
          type="button"
          onClick={nextMonth}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-[#242020] text-lg transition hover:bg-[#332D2D]"
        >
          ›
        </button>
      </div>

      {/* Days of week */}
      <div className="mt-5 grid grid-cols-7 text-center text-xs font-semibold text-[#817774]">
        <span>Sun</span>
        <span>Mon</span>
        <span>Tue</span>
        <span>Wed</span>
        <span>Thu</span>
        <span>Fri</span>
        <span>Sat</span>
      </div>

      {/* Calendar days */}
      <div className="mt-3 grid grid-cols-7 gap-1">

        {/* Empty spaces before first day */}
        {Array.from({
          length: firstDayOfMonth,
        }).map((_, index) => (
          <div key={`empty-${index}`} />
        ))}

        {/* Actual days */}
        {Array.from({
          length: daysInMonth,
        }).map((_, index) => {
          const day = index + 1;
          const selected = isSelected(day);

          return (
            <button
              key={day}
              type="button"
              onClick={() => selectDate(day)}
              className={`aspect-square rounded-full text-sm transition ${
                selected
                  ? "bg-[#E8A0A8] font-bold text-[#151313]"
                  : "text-[#D6CDC7] hover:bg-[#2D2828]"
              }`}
            >
              {day}
            </button>
          );
        })}

      </div>
    </div>
  );
}