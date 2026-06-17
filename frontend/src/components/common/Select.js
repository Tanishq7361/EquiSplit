import React from 'react';
import inputStyles from './Input.module.css';
import { classNames } from '../../utils/formatters';

export default function Select({ label, name, error, options = [], placeholder, className, ...props }) {
  const id = `field-${name}`;
  return (
    <div className={inputStyles.wrapper}>
      {label && <label htmlFor={id} className={inputStyles.label}>{label}</label>}
      <select
        id={id}
        name={name}
        className={classNames(inputStyles.input, error && inputStyles.error, className)}
        style={{ cursor: 'pointer' }}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <span className={inputStyles.errorMsg} role="alert">{error}</span>}
    </div>
  );
}
