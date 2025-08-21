import React from "react";
import { Plus, Minus, Trash2 } from "lucide-react";

const ItemCard = ({ item, updateQuantity, removeItem, showParticipantInput, isLoading }) => (
  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg mb-3">
    {/* Item Image */}
    <img
      src={item.program_image || "/no-image-logo.png"}
      alt="Item"
      className="w-16 h-16 rounded-lg object-cover bg-gray-200"
    />

    {/* Item Details */}
    <div className="flex-grow min-w-0">
      <h3 className="font-medium text-black text-sm truncate">{item.program_name}</h3>
      {/* <p className="text-xs text-gray-500 mt-0.5">
        <span className="">Donation Period:</span> {item.donation_period}
      </p> */}
      <p className="text-grey text-xs">£{item.donation_amount}</p>

      {/* Quantity Controls & Remove Button */}
      <div className="flex items-center mt-1 gap-2">
        <button disabled={isLoading} onClick={() => updateQuantity(item.cart_id, item.quantity - 1)} className={`p-1 hover:bg-gray-200 rounded border border-primary ${isLoading ? 'cursor-not-allowed' : ''}`}>
          <Minus size={14} className="text-gray-600" />
        </button>
        <span className="w-6 text-center font-medium text-sm">{item.quantity}</span>
        <button disabled={isLoading} onClick={() => updateQuantity(item.cart_id, item.quantity + 1)} className={`p-1 hover:bg-gray-200 rounded border border-primary ${isLoading ? 'cursor-not-allowed' : ''}`}>
          <Plus size={14} className="text-gray-600" />
        </button>
        <button disabled={isLoading} onClick={() => removeItem(item.cart_id)} className={`p-1 hover:bg-gray-200 rounded text-gray-600 text-red-600 ${isLoading ? 'cursor-not-allowed' : ''}`}>
          <Trash2 size={14} />
        </button>
      </div>
    </div>

    {/* Total Price */}
    <p className="font-medium text-black text-sm">£{(item.donation_amount * item.quantity).toFixed(2)}</p>
  </div>
);

export default ItemCard;
