export const validateAadhaar = (aadhaar) => {

  return /^\d{12}$/.test(aadhaar);
};

export const validatePassword = (password) => {

  return /^(?=.*[A-Z])(?=.*[0-9]).{8,}$/
    .test(password);
};