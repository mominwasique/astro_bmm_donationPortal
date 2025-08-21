import api from './axios';
import axios from 'axios';

export const formatSortCode = sortCode => {
  if (!sortCode) return '';
  // Remove any existing hyphens and ensure we have 6 digits
  const cleanCode = sortCode.replace(/-/g, '');
  if (cleanCode.length !== 6) return sortCode;
  // Format as XX-XX-XX
  return `${cleanCode.slice(0, 2)}-${cleanCode.slice(2, 4)}-${cleanCode.slice(4, 6)}`;
};

export const createCart = async cartData => {
  const response = await api.post('/cart/create', cartData, {
    timeout: 30000,
  });
  return response.data;
};

export const getCart = async data => {
  try {
    const res = await api.post('/cart/cart', data);

    // Handle different response structures
    if (res.data && res.data.cart) {
      return res.data.cart;
    } else if (res.data && Array.isArray(res.data)) {
      return res.data;
    } else if (res.data && res.data.data && Array.isArray(res.data.data)) {
      return res.data.data;
    } else {
      console.warn('Unexpected cart response structure:', res.data);
      return [];
    }
  } catch (error) {
    // One line: On 429, fall back to cached cart to avoid breaking UX
    if (error?.response?.status === 429) {
      try {
        const cached = JSON.parse(localStorage.getItem('cart') || '[]');
        return Array.isArray(cached) ? cached : [];
      } catch (_) {
        return [];
      }
    }
    console.error('Error fetching cart:', error);
    throw error;
  }
};

export const updateCart = async data => {
  const res = await api.post('/cart/quantity', {
    cart_id: data.id,
    quantity: data.newQuantity,
  });
  return res.data;
};

export const deleteFromCart = async data => {
  try {
    const res = await api.post('/cart/delete', { cart_id: data });
    return res.data;
  } catch (error) {
    if (error?.response?.status === 429) {
      // One line: Soft-fail on 429 by returning a recognizable shape
      return { success: false, message: 'Rate limited' };
    }
    throw error;
  }
};

export const updateParticipant = async data => {
  const res = await api.post('/cart/update-participant', {
    cart_id: data.cart_id,
    participant_name: data.participant_name,
  });
  return res.data;
};

export const cartTransaction = async data => {
  const guest_details = {
    title: data?.personalInfo?.title,
    first_name: data?.personalInfo?.firstName,
    last_name: data?.personalInfo?.lastName,
    phone: data?.personalInfo?.phone,
    email: data?.personalInfo?.email,
    address1: data?.personalInfo?.address1,
    address2: data?.personalInfo?.address2,
    postcode: data?.personalInfo?.postcode,
    // city: data.personalInfo.city,
    city_id: data?.personalInfo?.city_id || 'sample',
    country: data?.personalInfo?.country,
    city_name: data?.personalInfo?.city,
    payment_gateway: 'stripe',
  };

  const form_Data = new FormData();

  if (data.isAuthenticated) {
    form_Data.append('auth', 1);
    form_Data.append('donor_id', data.user.user_id);
    form_Data.append('donor_address_id', data.personalInfo.address_id);
  } else {
    form_Data.append('auth', 0);
    form_Data.append('session_id', data.session);
    // form_Data.append("reference_no", data.referenceId);
    form_Data.append('guest_details', JSON.stringify(guest_details));
  }
  form_Data.append('reference_no', data.referenceId);
  form_Data.append('payment_method', '');
  form_Data.append('is_giftaid', (data?.personalInfo?.country !== '1' ? 'O' : (data.giftAid ? 'Y' : 'N')));
  form_Data.append('tele_calling', data.phone ? 'Y' : 'N');
  form_Data.append('send_email', data.email ? 'Y' : 'N');
  form_Data.append('send_mail', data.post ? 'Y' : 'N');
  form_Data.append('send_text', data.sms ? 'Y' : 'N');

  // Format bank sort code with hyphens

  form_Data.append('bank_sort_code', formatSortCode(data?.personalInfo?.bank_sort_code));
  form_Data.append('bank_ac_no', data?.personalInfo?.bank_ac_no);
  form_Data.append('dd_run', data?.personalInfo?.dd_run);
  form_Data.append('payment_gateway', 'stripe');
  form_Data.append('paywith', 'stripe');
  form_Data.append('payment_method', 'stripe');


  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      const cookieValue = parts.pop().split(';').shift();
      return cookieValue;
    }
    return null;
  }

  // Append fields from cookies
  form_Data.append('first_source', getCookie('first_source') || '');
  form_Data.append('last_source', getCookie('last_source') || '');
  form_Data.append('first_referrer', getCookie('first_referrer') || '');
  form_Data.append('last_referrer', getCookie('last_referrer') || '');
  form_Data.append('utm_source_first', getCookie('first_utm_source') || '');
  form_Data.append('utm_source_last', getCookie('last_utm_source') || '');
  form_Data.append('utm_medium_first', getCookie('first_utm_medium') || '');
  form_Data.append('utm_medium_last', getCookie('last_utm_medium') || '');
  form_Data.append('utm_campaign_first', getCookie('first_utm_campaign') || '');
  form_Data.append('utm_campaign_last', getCookie('last_utm_campaign') || '');
  form_Data.append('utm_term_first', getCookie('first_utm_term') || '');
  form_Data.append('utm_term_last', getCookie('last_utm_term') || '');
  form_Data.append('utm_content_first', getCookie('first_utm_content') || '');
  form_Data.append('utm_content_last', getCookie('last_utm_content') || '');

  try {
    // const response = await api.post(`payment/transaction`, form_Data);

    const response = await axios.post(
      `${import.meta.env.PUBLIC_API_BASE_URL}/payment/transaction`,
      form_Data,
      {
        headers: {
          Authorization: `Bearer ${import.meta.env.PUBLIC_API_TOKEN}`,
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error in creating transaction:', error.message);
    throw error;
  }
};
