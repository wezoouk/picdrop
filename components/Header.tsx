
import React from 'react';

interface HeaderProps {
  coupleNames: string;
  date: string;
  message: string;
}

const Header: React.FC<HeaderProps> = ({ coupleNames, date, message }) => {
  return (
    <header className="text-center py-12 px-4 bg-blush/50">
      <h1 className="font-serif text-4xl md:text-6xl text-dark-text font-bold tracking-tight">
        {coupleNames}
      </h1>
      <p className="mt-2 text-lg text-gold-accent font-semibold">{date}</p>
      <p className="mt-4 max-w-2xl mx-auto text-base text-dark-text/80">
        {message}
      </p>
    </header>
  );
};

export default Header;
