
import React, { useState } from 'react';
import Icon from './Icon';

interface CalendarProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  onClose: () => void;
}

const Calendar: React.FC<CalendarProps> = ({ selectedDate, onDateSelect, onClose }) => {
  const [currentDate, setCurrentDate] = useState(selectedDate || new Date());

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  
  const startingDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDateClick = (day: number) => {
    const newSelectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    onDateSelect(newSelectedDate);
  };

  const today = new Date();
  
  const blanks = Array.from({ length: startingDayOfWeek }, (_, i) => <div key={`blank-${i}`} />);

  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const isToday = day === today.getDate() && currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear();
    const isSelected = selectedDate && day === selectedDate.getDate() && currentDate.getMonth() === selectedDate.getMonth() && currentDate.getFullYear() === selectedDate.getFullYear();

    let dayClasses = "w-10 h-10 flex items-center justify-center rounded-full cursor-pointer hover:bg-blush transition-colors";
    if (isSelected) {
      dayClasses += " bg-gold-accent text-white font-bold hover:bg-gold-accent/90";
    } else if (isToday) {
      dayClasses += " bg-blush font-bold text-gold-accent";
    }

    return (
      <div key={day} className={dayClasses} onClick={() => handleDateClick(day)}>
        {day}
      </div>
    );
  });
  
  return (
    <div className="absolute top-full mt-2 w-full max-w-sm bg-ivory p-4 rounded-xl shadow-lg border border-gold-accent/20 z-50 animate-fade-in-down">
      <div className="flex items-center justify-between mb-4">
        <button type="button" onClick={prevMonth} className="p-2 rounded-full hover:bg-blush">
          <Icon id="arrow-left" className="w-5 h-5" />
        </button>
        <div className="font-serif font-bold text-lg text-dark-text">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </div>
        <button type="button" onClick={nextMonth} className="p-2 rounded-full hover:bg-blush">
          <Icon id="arrow-right" className="w-5 h-5" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-sm text-dark-text/70 mb-2">
        {daysOfWeek.map(day => <div key={day} className="font-sans font-semibold">{day}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-y-1">
        {blanks}
        {days}
      </div>
    </div>
  );
};


// Add fade-in animation to tailwind config or a global style tag
const style = document.createElement('style');
style.innerHTML = `
@keyframes fade-in-down {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in-down {
  animation: fade-in-down 0.3s ease-in-out;
}
`;
document.head.appendChild(style);

export default Calendar;
