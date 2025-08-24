import React, { useContext, useEffect, useState } from 'react'
import './PlaceOrder.css'
import { StoreContext } from '../../context/StoreContext'
import axios from 'axios'
import { useNavigate } from 'react-router-dom';
const PlaceOrder = () => {

  const { getTotalCartAmount, token, food_list, cartItems, url } = useContext(StoreContext)
  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
    phone: ""
  })

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData(data => ({ ...data, [name]: value }))
  }
  const placeOrder = async (event) => {
    event.preventDefault();

    let orderItems = [];
    food_list.forEach((item) => {
      if (cartItems[item._id] > 0) {
        let itemInfo = { ...item, quantity: cartItems[item._id] };
        orderItems.push(itemInfo);
      }
    });

    let orderData = {
      address: data,
      items: orderItems,
      amount: getTotalCartAmount() + 2,
    };

    try {
      const response = await axios.post(url + "/api/order/place", orderData, {
        headers: { token },
      });

      if (response.data.success) {
        const orderId = response.data.orderId; // ✅ CORRECT PLACE

        const options = {
          key: response.data.key,
          amount: response.data.amount,
          currency: response.data.currency,
          name: "Food Order",
          description: "Payment for your order",
          order_id: response.data.razorpayOrderId,
          handler: async function (paymentResponse) {
            alert("Payment Successful!");

            try {
              await axios.post(url + "/api/order/verify", {
                orderId: orderId,
                paymentId: paymentResponse.razorpay_payment_id,
                success: true,
              }, {
                headers: { token },
              });

              window.location.href = `/verify?success=true&orderId=${orderId}`;
            } catch (err) {
              console.error("Error updating payment", err);
            }
          },
          modal: {
            ondismiss: async function () {
              // Modal closed without completing payment
              try {
                await axios.post(url + "/api/order/verify", {
                  orderId: orderId,
                  success: false,
                }, {
                  headers: { token },
                });
              } catch (err) {
                console.error("Error handling modal dismiss", err);
              }
              console.log("Modal dismissed manually. Redirecting to home.");
              alert("Payment was cancelled. You are being redirected to the home page.");
              window.location.href = "/";
            }
          },
          prefill: {
            name: `${data.firstName} ${data.lastName}`,
            email: data.email,
            contact: data.phone,
          },
          theme: {
            color: "#F37254",
          },
        };

        const razor = new window.Razorpay(options);

        razor.on("payment.failed", async function () {
          try {
            await axios.post(url + "/api/order/verify", {
              orderId: orderId,
              success: false,
            }, {
              headers: { token },
            });
            console.log("Payment failed. Redirecting to home...");
            alert("Payment failed. Redirecting to home...");
            window.location.href = "/";
          } catch (err) {
            console.error("Failed to delete unpaid order", err);
          }
        });

        razor.open();
      } else {
        alert("Order placement failed.");
      }
    } catch (error) {
      console.error(" Place Order Error:", error);
      alert("Something went wrong.");
    }
  };
  const navigate = useNavigate();

  useEffect(()=>{
    if(!token){
      navigate('/cart')
    }
    else if(getTotalCartAmount()===0){
      navigate('/cart')
    }
  },[token])

  return (
    <form onSubmit={placeOrder} className='place-order'>
      <div className="place-order-left">
        <p className='title'>Delivery Information</p>
        <div className="multi-fields">
          <input required name="firstName" onChange={onChangeHandler} value={data.firstName} type='text' placeholder='First Name' />
          <input required name="lastName" onChange={onChangeHandler} value={data.lastName} type='text' placeholder='Last Name' />
        </div>
        <input required name="email" onChange={onChangeHandler} value={data.email} type='text' placeholder='Email address' />
        <input required name="street" onChange={onChangeHandler} value={data.street} type='text' placeholder='Street' />
        <div className="multi-fields">
          <input required name="city" onChange={onChangeHandler} value={data.city} type='text' placeholder='City' />
          <input required name="state" onChange={onChangeHandler} value={data.state} type='text' placeholder='State' />
        </div>
        <div className="multi-fields">
          <input required name="zipcode" onChange={onChangeHandler} value={data.zipcode} type='text' placeholder='Zip code' />
          <input required name="country" onChange={onChangeHandler} value={data.country} type='text' placeholder='Country' />
        </div>
        <input required name="phone" onChange={onChangeHandler} value={data.phone} type='text' placeholder='Phone' />
      </div>
      <div className="place-order-right"></div>
      <div className="cart-total">
        <h2>Cart Totals</h2>
        <div>
          <div className="cart-total-details">
            <p>Subtotal</p>
            <p>${getTotalCartAmount()}</p>
          </div>
          <hr />
          <div className="cart-total-details">
            <p>Delivery Fee</p>
            <p>${getTotalCartAmount() === 0 ? 0 : 2}</p>
          </div>
          <hr />
          <div className="cart-total-details">
            <b>Total</b>
            <b>${getTotalCartAmount() === 0 ? 0 : getTotalCartAmount() + 2}</b>
          </div>
        </div>
        <button type='submit'>PROCEED TO PAYMENT</button>
      </div>
    </form>
  )
}

export default PlaceOrder


