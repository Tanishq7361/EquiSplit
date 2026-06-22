export const validators = {
  required: (value) => (!value?.toString().trim() ? 'This field is required' : ''),

  email: (value) => {
    if (!value) return 'Email is required';
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? '' : 'Enter a valid email address';
  },

  minLength: (min) => (value) =>
    value?.length >= min ? '' : `Must be at least ${min} characters`,

  maxLength: (max) => (value) =>
    value?.length <= max ? '' : `Must be ${max} characters or fewer`,

  positiveNumber: (value) => {
    const str = String(value ?? "").trim();
    if (str === "") {
      return "Amount is required";
    }
    if (!/^\d+(\.\d{1,2})?$/.test(str)) {
      return "Enter a valid amount";
    }
    if (parseFloat(str) <= 0) {
      return "Amount must be greater than 0";
    }
    return "";
  },

  compose: (...fns) => (value) => {
    for (const fn of fns) {
      const error = fn(value);
      if (error) return error;
    }
    return '';
  },
};

export function validateLogin(values) {
  return {
    email:    validators.email(values.email),
    password: validators.required(values.password),
  };
}

export function validateRegister(values) {
  return {
    name:     validators.compose(validators.required, validators.minLength(2))(values.name),
    email:    validators.email(values.email),
    password: validators.compose(validators.required, validators.minLength(8))(values.password),
  };
}

export function validateGroup(values) {
  return {
    name:        validators.compose(validators.required, validators.minLength(2))(values.name),
    description: '',
  };
}

export function validateExpense(values) {
  return {
    description: validators.required(values.description),
    amount:      validators.positiveNumber(values.amount),
    paidByUserId:      validators.required(values.paidByUserId),
  };
}

export function validateSettlement(values) {

  const errors = {
    payerId: validators.required(values.payerId),
    receiverId: validators.required(values.receiverId),
    amount: validators.positiveNumber(values.amount),
  };

  if (
    values.payerId &&
    values.receiverId &&
    Number(values.payerId) === Number(values.receiverId)
  ) {
    errors.receiverId = "Payer and receiver cannot be the same.";
  }

  return errors;
}

export function validateMember(values) {
  return {
    email: validators.email(values.email),
  };
}
