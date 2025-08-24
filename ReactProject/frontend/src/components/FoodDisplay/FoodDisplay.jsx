import React, { useContext } from 'react';
import './FoodDisplay.css';
import { StoreContext } from '../../context/StoreContext';
import FoodItem from '../FoodItem/FoodItem';

const FoodDisplay = ({ category }) => {
  const { food_list, searchQuery } = useContext(StoreContext);

  const safeSearchQuery = searchQuery || ""; // Fallback to empty string

  const filteredList = food_list.filter((item) => {
    const matchCategory =
      category === "All" || item.category.toLowerCase() === category.toLowerCase();
    const matchSearch =
      safeSearchQuery.trim() === "" ||
      item.name.toLowerCase().includes(safeSearchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className='food-display' id='food-display'>
      <h2>Top dishes near you</h2>
      <div className='food-display-list'>
        {filteredList.map((item, index) => (
          <FoodItem
            key={index}
            id={item._id}
            name={item.name}
            description={item.description}
            price={item.price}
            image={item.image}
          />
        ))}
        {filteredList.length === 0 && (
          <p style={{ marginTop: '20px', fontStyle: 'italic', color: 'gray' }}>
            No matching food items found.
          </p>
        )}
      </div>
    </div>
  );
};

export default FoodDisplay;
