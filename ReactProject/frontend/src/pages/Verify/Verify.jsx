import React, { useEffect, useState, useContext } from "react";
import { useSearchParams } from "react-router-dom";
import { StoreContext } from "../../context/StoreContext";
import axios from "axios";
import "./Verify.css";

const Verify = () => {
  const [searchParams] = useSearchParams();
  const success = searchParams.get("success");
  const orderId = searchParams.get("orderId");

  const { token, url } = useContext(StoreContext);
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await axios.get(`${url}/api/order/${orderId}`, {
          headers: { token },
        });
        setOrder(res.data.order);
      } catch (err) {
        console.error("Error fetching order details:", err);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId, url, token]);

  if (success !== "true") {
    return <div className="verify"><h2>Payment failed or invalid URL.</h2></div>;
  }

  return (
    <div className="verify">
      <h1>🎉 Thank you for your order!</h1>
      <p>Your payment was successful.</p>
      <p><strong>Order ID:</strong> {orderId}</p>

      {order ? (
        <>
          <h3>Order Summary</h3>
          <ul>
            {order.items.map(item => (
              <li key={item._id}>
                {item.name} x {item.quantity} — ₹{item.price * item.quantity}
              </li>
            ))}
          </ul>
          <p><strong>Total Amount:</strong> ₹{order.amount}</p>
        </>
      ) : (
        <p>Loading order details...</p>
      )}

      <div className="actions">
        <a href="/" className="btn">🏠 Back to Home</a>
        <a href="/myorders" className="btn">📦 View My Orders</a>
      </div>
    </div>
  );
};

export default Verify;
