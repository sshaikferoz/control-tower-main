import React from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { SearchBarProps } from './types';

const SearchBar: React.FC<SearchBarProps> = ({ search, setSearch }) => {
  return (
    <div className="relative mt-4">
      <MagnifyingGlassIcon className="absolute top-3 left-3 h-5 w-5 text-gray-300" />
      <input
        type="text"
        placeholder="Search Menu"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-md bg-[#ffffff20] p-2 pl-10 text-white placeholder-gray-300 outline-none"
      />
    </div>
  );
};

export default SearchBar;
