import React, { useState } from 'react';

const SearchableList = ({ items, renderItem, searchKey, placeholder = "Search..." }) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter items based on the search query
  const filteredItems = items.filter((item) =>
    item[searchKey].toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <input
        type="text"
        className="w-full rounded-md border border-gray-300 p-2 text-sm shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      {/* Render the filtered list */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {filteredItems.map((item) => renderItem(item))}
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 text-gray-700">
          <p>No items match your search criteria.</p>
        </div>
      )}
    </div>
  );
};

export default SearchableList;
